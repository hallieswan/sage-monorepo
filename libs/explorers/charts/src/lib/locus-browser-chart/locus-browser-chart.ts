import type { CustomSeriesOption, ECharts, EChartsOption } from 'echarts';
import type {
  ChromosomeTrack,
  ChromosomeTrackItem,
  Exon,
  GeneMarker,
  GeneStructureItem,
  GeneStructureTrack,
  LocusBrowserProps,
  LocusBrowserSelection,
  TranscriptionEndSite,
  TranscriptionStartSite,
  Utr,
  Variant,
} from '../models/locus-browser';
import { initChart, setNoDataOption } from '../utils';
import {
  BRACKET_BOTTOM_GAP_PX,
  BRACKET_CORNER_RADIUS_PX,
  BRACKET_STYLE,
  BRACKET_TIP_GAP_PX,
  BRACKET_TOP_GAP_PX,
  BRACKET_TOP_STEM_PX,
  CHROMOSOME_BAR_BOTTOM_Y_PX,
  CHROMOSOME_BAR_CENTER_Y_PX,
  CHROMOSOME_GRID_HEIGHT_PX,
  CHROMOSOME_GRID_TOP_PX,
  CHROMOSOME_VARIANT_LINE_WIDTH_PX,
  CHROMOSOME_VARIANT_TICK_HEIGHT_PX,
  DEFAULT_GROUPING_THRESHOLD_PX,
  FONT_FAMILY,
  GENE_MARKER_LEADER_DIAGONAL_DX_PX,
  GENE_STRUCTURE_BAR_CENTER_Y_PX,
  GENE_STRUCTURE_BAR_TOP_Y_PX,
  GENE_STRUCTURE_GRID_HEIGHT_PX,
  GENE_STRUCTURE_GRID_TOP_PX,
  GENE_STRUCTURE_RANGE_PADDING_FRACTION,
  GENE_STRUCTURE_VARIANT_LINE_WIDTH_PX,
  GRID_LEFT,
  GRID_RIGHT,
  INITIAL_CHART_HEIGHT_PX,
  TRACK_LABEL_STYLES,
  VARIANT_BADGE_STYLE,
  VARIANT_STYLES,
} from './constants';
import { computeIntrons } from './intron-utils';
import { computeVariantGroups, midpoint, VariantGroup } from './grouping-utils';
import { BracketSideShape, computeBrackets } from './bracket-utils';
import {
  formatBp,
  formatGeneStructureItemTooltip,
  formatIntronTooltip,
  formatVariantGroupTooltip,
  formatVariantTooltip,
  TooltipContext,
} from './tooltip-formatter';
import {
  barBackgroundSeries,
  exonSeriesDefaults,
  geneMarkerSeries,
  intronSeriesDefaults,
  segmentSeries,
  tesSeries,
  tssSeries,
  utrSeriesDefaults,
  variantGroupSeries,
  variantLineSeries,
} from './series';

const CHROMOSOME_GRID_INDEX = 0;
const GENE_STRUCTURE_GRID_INDEX = 1;

interface ComputedGroups {
  chromosome: VariantGroup[];
  geneStructure: VariantGroup[];
}

interface PartitionedChromosome {
  variants: Variant[];
  markers: GeneMarker[];
}

interface PartitionedGeneStructure {
  variants: Variant[];
  exons: Exon[];
  utrs: Utr[];
  tssList: TranscriptionStartSite[];
  tesList: TranscriptionEndSite[];
}

function partitionChromosomeItems(items: ChromosomeTrackItem[]): PartitionedChromosome {
  const variants: Variant[] = [];
  const markers: GeneMarker[] = [];
  for (const item of items) {
    if (item.type === 'variant') variants.push(item);
    else markers.push(item);
  }
  return { variants, markers };
}

function partitionGeneStructureItems(items: GeneStructureItem[]): PartitionedGeneStructure {
  const variants: Variant[] = [];
  const exons: Exon[] = [];
  const utrs: Utr[] = [];
  const tssList: TranscriptionStartSite[] = [];
  const tesList: TranscriptionEndSite[] = [];
  for (const item of items) {
    switch (item.type) {
      case 'variant':
        variants.push(item);
        break;
      case 'exon':
        exons.push(item);
        break;
      case 'utr':
        utrs.push(item);
        break;
      case 'transcription-start-site':
        tssList.push(item);
        break;
      case 'transcription-end-site':
        tesList.push(item);
        break;
    }
  }
  return { variants, exons, utrs, tssList, tesList };
}

/**
 * Computes the gene-structure track's effective x-axis range. Uses the explicit range
 * when provided; otherwise pads the bounding box of non-variant items by 5% each side.
 */
export function resolveGeneStructureRange(track: GeneStructureTrack): {
  start: number;
  end: number;
} {
  if (track.range) return track.range;

  const nonVariantBounds = track.items.flatMap((item) => {
    if (item.type === 'variant') return [];
    if ('position' in item) return [item.position];
    return [item.start, item.end];
  });

  if (nonVariantBounds.length === 0) {
    return { start: 0, end: 1 };
  }

  const start = Math.min(...nonVariantBounds);
  const end = Math.max(...nonVariantBounds);
  const span = end - start;
  const pad = span * GENE_STRUCTURE_RANGE_PADDING_FRACTION;
  return { start: start - pad, end: end + pad };
}

function chromosomeTooltipContext(track: ChromosomeTrack): TooltipContext {
  return { track: 'chromosome', chromosome: track.chromosome };
}

function geneStructureTooltipContext(track: GeneStructureTrack): TooltipContext {
  return { track: 'gene-structure', gene: track.gene, strand: track.strand };
}

function variantTooltipFormatter(context: TooltipContext) {
  return (variant: Variant) => variant.tooltipHtml ?? formatVariantTooltip(variant, context);
}

function variantGroupTooltipFormatter(context: TooltipContext) {
  return (group: VariantGroup) => formatVariantGroupTooltip(group.members, context);
}

function pixelHash(...values: (string | number | undefined)[]): string {
  return values.map((v) => (v === undefined ? 'u' : String(v))).join('|');
}

function collectGroupedVariantIds(groups: VariantGroup[]): Set<string> {
  const ids = new Set<string>();
  for (const group of groups) {
    if (group.members.length < 2) continue;
    for (const member of group.members) ids.add(member.variantId);
  }
  return ids;
}

function computeVariantGroupsForGrid(
  chart: ECharts,
  variants: Variant[],
  gridIndex: number,
  thresholdPx: number,
): VariantGroup[] {
  const bpToPixel = (bp: number) => {
    try {
      return chart.convertToPixel({ xAxisIndex: gridIndex }, bp);
    } catch {
      return 0;
    }
  };
  return computeVariantGroups(variants, bpToPixel, thresholdPx);
}

export class LocusBrowserChart {
  chart: ECharts | undefined;
  private currentProps: LocusBrowserProps | undefined;
  private currentGroups: ComputedGroups = { chromosome: [], geneStructure: [] };
  private lastFinishedHash = '';
  private resizeObserver: ResizeObserver | undefined;
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(chartDom: HTMLDivElement | HTMLCanvasElement, props: LocusBrowserProps) {
    this.chart = initChart(chartDom, INITIAL_CHART_HEIGHT_PX);
    this.setOptions(props);
    this.installResizeObserver(chartDom);
    this.chart?.on('finished', () => this.onChartFinished());
  }

  destroy() {
    this.resizeObserver?.disconnect();
    if (this.resizeTimer !== undefined) clearTimeout(this.resizeTimer);
    this.chart?.dispose();
  }

  setOptions(props: LocusBrowserProps) {
    if (!this.chart) return;
    this.currentProps = props;
    this.currentGroups = { chromosome: [], geneStructure: [] };
    this.lastFinishedHash = '';

    const chromosomeEmpty = !props.chromosomeTrack.items.length;
    const geneEmpty = !props.geneStructureTrack.items.length;
    if (chromosomeEmpty || geneEmpty) {
      setNoDataOption(this.chart, props.noDataStyle ?? 'textOnly');
      return;
    }

    this.chart.setOption(this.buildOption(props, this.currentGroups), true);
  }

  private installResizeObserver(chartDom: HTMLDivElement | HTMLCanvasElement) {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeTimer !== undefined) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.chart?.resize();
        this.lastFinishedHash = '';
      }, 100);
    });
    this.resizeObserver.observe(chartDom);
  }

  private onChartFinished() {
    const props = this.currentProps;
    const chart = this.chart;
    if (!props || !chart) return;
    if (!props.chromosomeTrack.items.length || !props.geneStructureTrack.items.length) return;

    const dom = chart.getDom();
    const widthPx = dom?.clientWidth ?? 0;
    const hash = pixelHash(
      widthPx,
      props.primarySelection.gene,
      props.primarySelection.variantId,
      props.secondarySelection?.gene,
      props.secondarySelection?.variantId,
    );
    if (hash === this.lastFinishedHash) return;
    this.lastFinishedHash = hash;

    const groupingThresholdPx = props.groupingThresholdPx ?? DEFAULT_GROUPING_THRESHOLD_PX;
    const { variants: chromVariants } = partitionChromosomeItems(props.chromosomeTrack.items);
    const { variants: geneVariants } = partitionGeneStructureItems(props.geneStructureTrack.items);

    this.currentGroups = {
      chromosome: computeVariantGroupsForGrid(
        chart,
        chromVariants,
        CHROMOSOME_GRID_INDEX,
        groupingThresholdPx,
      ),
      geneStructure: computeVariantGroupsForGrid(
        chart,
        geneVariants,
        GENE_STRUCTURE_GRID_INDEX,
        groupingThresholdPx,
      ),
    };

    chart.setOption(this.buildOption(props, this.currentGroups), true);
  }

  private buildOption(props: LocusBrowserProps, groups: ComputedGroups): EChartsOption {
    const { chromosomeTrack, geneStructureTrack, primarySelection, secondarySelection } = props;
    const highlightedGenes = props.highlightedGenes ?? [];
    const geneStructureRange = resolveGeneStructureRange(geneStructureTrack);

    const chromosomeContext = chromosomeTooltipContext(chromosomeTrack);
    const geneStructureContext = geneStructureTooltipContext(geneStructureTrack);

    const { variants: chromVariants, markers } = partitionChromosomeItems(chromosomeTrack.items);
    const {
      variants: geneVariants,
      exons,
      utrs,
      tssList,
      tesList,
    } = partitionGeneStructureItems(geneStructureTrack.items);
    const introns = computeIntrons(geneStructureTrack.items);

    const chromGroupedIds = collectGroupedVariantIds(groups.chromosome);
    const geneGroupedIds = collectGroupedVariantIds(groups.geneStructure);
    // On the chromosome track, primary/secondary selected variants render as
    // badges with connector lines instead of in-bar ticks. Filter them out of the
    // line series so they don't appear twice.
    const selectedIds = new Set(
      [primarySelection.variantId, secondarySelection?.variantId].filter((id): id is string =>
        Boolean(id),
      ),
    );
    const visibleChromVariants = chromVariants.filter(
      (v) => !chromGroupedIds.has(v.variantId) && !selectedIds.has(v.variantId),
    );
    const visibleGeneVariants = geneVariants.filter((v) => !geneGroupedIds.has(v.variantId));

    const series: CustomSeriesOption[] = [
      barBackgroundSeries({
        range: chromosomeTrack.range,
        xAxisIndex: CHROMOSOME_GRID_INDEX,
        yAxisIndex: CHROMOSOME_GRID_INDEX,
        z: 0,
      }),
      // Gene markers sit just above the bar (z=1) so they're visible on the bar
      // but rendered behind variant ticks (z=2), bubbles (z=3), and badges
      // (drawn separately via the `graphic` component, which paints last).
      geneMarkerSeries({
        markers,
        labelXsPx: this.assignGeneMarkerLabelXs(markers),
        primary: primarySelection,
        secondary: secondarySelection,
        highlightedGenes,
        xAxisIndex: CHROMOSOME_GRID_INDEX,
        yAxisIndex: CHROMOSOME_GRID_INDEX,
        z: 1,
      }),
      variantLineSeries({
        variants: visibleChromVariants,
        primary: primarySelection,
        secondary: secondarySelection,
        tooltipFormatter: variantTooltipFormatter(chromosomeContext),
        xAxisIndex: CHROMOSOME_GRID_INDEX,
        yAxisIndex: CHROMOSOME_GRID_INDEX,
        z: 2,
        tickHeightPx: CHROMOSOME_VARIANT_TICK_HEIGHT_PX,
        lineWidthPx: CHROMOSOME_VARIANT_LINE_WIDTH_PX,
      }),
      variantGroupSeries({
        groups: groups.chromosome,
        tooltipFormatter: variantGroupTooltipFormatter(chromosomeContext),
        xAxisIndex: CHROMOSOME_GRID_INDEX,
        yAxisIndex: CHROMOSOME_GRID_INDEX,
        z: 3,
      }),
      barBackgroundSeries({
        range: geneStructureRange,
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 0,
      }),
      segmentSeries({
        items: introns.map((intron) => ({
          start: intron.start,
          end: intron.end,
          tooltipHtml: formatIntronTooltip(
            intron,
            geneStructureTrack.gene,
            geneStructureTrack.strand,
          ),
        })),
        ...intronSeriesDefaults,
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 1,
      }),
      segmentSeries({
        items: utrs.map((utr) => ({
          start: utr.start,
          end: utr.end,
          tooltipHtml:
            utr.tooltipHtml ??
            formatGeneStructureItemTooltip(utr, geneStructureTrack.gene, geneStructureTrack.strand),
        })),
        ...utrSeriesDefaults,
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 2,
      }),
      segmentSeries({
        items: exons.map((exon) => ({
          start: exon.start,
          end: exon.end,
          tooltipHtml:
            exon.tooltipHtml ??
            formatGeneStructureItemTooltip(
              exon,
              geneStructureTrack.gene,
              geneStructureTrack.strand,
            ),
        })),
        ...exonSeriesDefaults,
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 3,
      }),
      variantLineSeries({
        variants: visibleGeneVariants,
        primary: primarySelection,
        secondary: secondarySelection,
        tooltipFormatter: variantTooltipFormatter(geneStructureContext),
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 4,
        lineWidthPx: GENE_STRUCTURE_VARIANT_LINE_WIDTH_PX,
      }),
      tssSeries({
        items: tssList.map((tss) => ({
          position: tss.position,
          tooltipHtml:
            tss.tooltipHtml ??
            formatGeneStructureItemTooltip(tss, geneStructureTrack.gene, geneStructureTrack.strand),
        })),
        strand: geneStructureTrack.strand,
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 5,
      }),
      tesSeries({
        items: tesList.map((tes) => ({
          position: tes.position,
          tooltipHtml:
            tes.tooltipHtml ??
            formatGeneStructureItemTooltip(tes, geneStructureTrack.gene, geneStructureTrack.strand),
        })),
        strand: geneStructureTrack.strand,
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 5,
      }),
      variantGroupSeries({
        groups: groups.geneStructure,
        tooltipFormatter: variantGroupTooltipFormatter(geneStructureContext),
        xAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        yAxisIndex: GENE_STRUCTURE_GRID_INDEX,
        z: 6,
      }),
    ];

    const graphicElements = [
      ...this.buildTrackLabels(chromosomeTrack),
      ...this.buildBracketGraphics(props, geneStructureRange),
      ...this.buildSelectionBadges(props),
    ];

    return {
      grid: [
        {
          left: GRID_LEFT,
          right: GRID_RIGHT,
          top: CHROMOSOME_GRID_TOP_PX,
          height: CHROMOSOME_GRID_HEIGHT_PX,
          containLabel: false,
        },
        {
          left: GRID_LEFT,
          right: GRID_RIGHT,
          top: GENE_STRUCTURE_GRID_TOP_PX,
          height: GENE_STRUCTURE_GRID_HEIGHT_PX,
          containLabel: false,
        },
      ],
      xAxis: [
        {
          type: 'value',
          gridIndex: CHROMOSOME_GRID_INDEX,
          min: chromosomeTrack.range.start,
          max: chromosomeTrack.range.end,
          show: false,
        },
        {
          type: 'value',
          gridIndex: GENE_STRUCTURE_GRID_INDEX,
          min: geneStructureRange.start,
          max: geneStructureRange.end,
          show: false,
        },
      ],
      yAxis: [
        { type: 'value', gridIndex: CHROMOSOME_GRID_INDEX, min: 0, max: 100, show: false },
        { type: 'value', gridIndex: GENE_STRUCTURE_GRID_INDEX, min: 0, max: 100, show: false },
      ],
      series,
      tooltip: { trigger: 'item', confine: true },
      graphic: { elements: graphicElements },
      aria: { enabled: true },
    };
  }

  /**
   * Computes per-marker label X positions so all labels are EVENLY SPACED and
   * all leaders bend in the same direction.
   *
   * The label band is the markers' span (leftmost-marker-x to rightmost-
   * marker-x) shifted LEFT by `|GENE_MARKER_LEADER_DIAGONAL_DX_PX|`. Each
   * marker then gets the i-th evenly-spaced slot in that shifted band. For
   * uniformly-distributed markers every leader has exactly the SVG's natural
   * bend (label sits 82.8px to the left of its marker); when marker density
   * varies the leaders' diagonal angles vary, but the shift keeps every label
   * on the same side of its marker so the bend direction stays consistent.
   *
   * If markers are too dense to fit at natural spacing, spacing is clamped to
   * `minSpacingPx` so labels don't overlap.
   *
   * On the first render `convertToPixel` may not be ready -- in that case we
   * return zeros and the post-`finished` re-render fills in correct values.
   */
  private assignGeneMarkerLabelXs(markers: GeneMarker[]): number[] {
    const chart = this.chart;
    if (!chart || markers.length === 0) return markers.map(() => 0);

    const markerXs = markers.map((m) => {
      try {
        const px = chart.convertToPixel({ xAxisIndex: CHROMOSOME_GRID_INDEX }, m.position);
        return typeof px === 'number' && Number.isFinite(px) ? px : 0;
      } catch {
        return 0;
      }
    });

    const order = markers.map((_, i) => i).sort((a, b) => markerXs[a] - markerXs[b]);
    const labelXs: number[] = new Array(markers.length).fill(0);

    if (order.length === 1) {
      labelXs[order[0]] = markerXs[order[0]] + GENE_MARKER_LEADER_DIAGONAL_DX_PX;
      return labelXs;
    }

    // Shift both endpoints LEFT by |DIAGONAL_DX| so the entire label band sits
    // to the left of the marker band. Span width is preserved.
    const leftmostLabelX = markerXs[order[0]] + GENE_MARKER_LEADER_DIAGONAL_DX_PX;
    const rightmostMarkerX = markerXs[order.at(-1) ?? order[0]];
    const rightmostLabelX = rightmostMarkerX + GENE_MARKER_LEADER_DIAGONAL_DX_PX;
    const naturalSpacing = (rightmostLabelX - leftmostLabelX) / (order.length - 1);
    const minSpacingPx = 22;
    const spacing = Math.max(naturalSpacing, minSpacingPx);

    for (let i = 0; i < order.length; i++) {
      labelXs[order[i]] = leftmostLabelX + i * spacing;
    }
    return labelXs;
  }

  private buildTrackLabels(chromosomeTrack: ChromosomeTrack) {
    const main = TRACK_LABEL_STYLES.main;
    const sub = TRACK_LABEL_STYLES.sub;
    const labelXPx = 16;

    // Chromosome track:
    //   - Main label "Chromosome {n}" vertically centered on the chromosome bar.
    //   - Sub-label "Base pairs\n{start}-{end}" sits as a 2-line block whose
    //     bottom line baseline is just above the main label.
    // Gene-structure track:
    //   - Main label "Gene Structure" vertically centered on the gene bar.

    const chromMainTextY = CHROMOSOME_BAR_CENTER_Y_PX;
    // Design spec: 30px between the bottom of the "Base pairs" sub-label and
    // the top of the "Chromosome {n}" main label (whose top edge sits about
    // mainFontSize/2 above its vertically-centered y).
    const chromSubTextY = chromMainTextY - main.fontSize / 2 - 30;

    return [
      {
        type: 'text' as const,
        silent: true,
        cursor: 'default' as const,
        style: {
          x: labelXPx,
          y: chromSubTextY,
          text: `Base pairs\n${formatBp(chromosomeTrack.range.start)}-${formatBp(
            chromosomeTrack.range.end,
          )}`,
          fill: sub.color,
          fontSize: sub.fontSize,
          fontWeight: sub.fontWeight,
          fontFamily: FONT_FAMILY,
          textAlign: 'left' as const,
          textVerticalAlign: 'bottom' as const,
        },
      },
      {
        type: 'text' as const,
        silent: true,
        cursor: 'default' as const,
        style: {
          x: labelXPx,
          y: chromMainTextY,
          text: `Chromosome ${chromosomeTrack.chromosome}`,
          fill: main.color,
          fontSize: main.fontSize,
          fontWeight: main.fontWeight,
          fontFamily: FONT_FAMILY,
          textAlign: 'left' as const,
          textVerticalAlign: 'middle' as const,
        },
      },
      {
        type: 'text' as const,
        silent: true,
        cursor: 'default' as const,
        style: {
          x: labelXPx,
          y: GENE_STRUCTURE_BAR_CENTER_Y_PX,
          text: 'Gene Structure',
          fill: main.color,
          fontSize: main.fontSize,
          fontWeight: main.fontWeight,
          fontFamily: FONT_FAMILY,
          textAlign: 'left' as const,
          textVerticalAlign: 'middle' as const,
        },
      },
    ];
  }

  private buildBracketGraphics(
    props: LocusBrowserProps,
    geneStructureRange: { start: number; end: number },
  ) {
    const chart = this.chart;
    if (!chart) return [];

    const primaryMarker = props.chromosomeTrack.items.find(
      (item): item is GeneMarker =>
        item.type === 'gene-marker' && item.gene === props.primarySelection.gene,
    );
    if (!primaryMarker) return [];

    let upperX: number;
    let lowerLeftX: number;
    let lowerRightX: number;
    try {
      upperX = chart.convertToPixel({ xAxisIndex: CHROMOSOME_GRID_INDEX }, primaryMarker.position);
      lowerLeftX = chart.convertToPixel(
        { xAxisIndex: GENE_STRUCTURE_GRID_INDEX },
        geneStructureRange.start,
      );
      lowerRightX = chart.convertToPixel(
        { xAxisIndex: GENE_STRUCTURE_GRID_INDEX },
        geneStructureRange.end,
      );
    } catch {
      return [];
    }
    if (![upperX, lowerLeftX, lowerRightX].every((v) => Number.isFinite(v))) return [];

    // Bracket geometry per design feedback:
    //   - Tip is split: left tip sits BRACKET_TIP_GAP_PX/2 to the left of the
    //     primary gene-marker x, right tip the same distance to the right.
    //   - Tip y is BRACKET_TOP_GAP_PX below the chromosome bar's bottom edge.
    //   - Bottom y is BRACKET_BOTTOM_GAP_PX above the gene-structure bar's
    //     top edge.
    const upperY = CHROMOSOME_BAR_BOTTOM_Y_PX + BRACKET_TOP_GAP_PX;
    const lowerY = GENE_STRUCTURE_BAR_TOP_Y_PX - BRACKET_BOTTOM_GAP_PX;
    const tipHalfGap = BRACKET_TIP_GAP_PX / 2;

    const brackets = computeBrackets(
      {
        upperLeft: { x: upperX - tipHalfGap, y: upperY },
        upperRight: { x: upperX + tipHalfGap, y: upperY },
        lowerLeft: { x: lowerLeftX, y: lowerY },
        lowerRight: { x: lowerRightX, y: lowerY },
      },
      BRACKET_TOP_STEM_PX,
      BRACKET_CORNER_RADIUS_PX,
    );

    return [...bracketSideToElements(brackets.left), ...bracketSideToElements(brackets.right)];
  }

  private buildSelectionBadges(props: LocusBrowserProps) {
    const chart = this.chart;
    if (!chart) return [];

    // Per the design spec, persistent badges only render on the chromosome track.
    // The gene-structure track shows variant lines only, no badges.
    const items = props.chromosomeTrack.items;

    const entries: Array<{
      selection: LocusBrowserSelection;
      color: string;
      offsetPx: number;
    }> = [
      {
        selection: props.primarySelection,
        color: VARIANT_STYLES.primary.color,
        offsetPx: VARIANT_BADGE_STYLE.primaryTopFromBarBottomPx,
      },
    ];
    if (props.secondarySelection) {
      entries.push({
        selection: props.secondarySelection,
        color: VARIANT_STYLES.secondary.color,
        offsetPx: VARIANT_BADGE_STYLE.secondaryTopFromBarBottomPx,
      });
    }

    return entries.flatMap((entry) => {
      const variant = findVariantById(items, entry.selection.variantId);
      if (!variant) return [];
      const xPx = safeConvertToPixel(chart, CHROMOSOME_GRID_INDEX, midpoint(variant));
      if (xPx === null) return [];
      return buildBadgeWithConnector(xPx, entry.color, variant.variantId, entry.offsetPx);
    });
  }
}

/**
 * Builds the five graphic primitives that compose one side of the angular
 * bracket: top vertical stem, top rounded corner (cubic bezier), horizontal
 * segment, bottom rounded corner, bottom vertical stem. ECharts'
 * `graphic.elements` doesn't accept a free-form 'path' element, so the side
 * is assembled from `line` + `bezierCurve` primitives.
 */
function bracketSideToElements(side: BracketSideShape) {
  const decorative = { silent: true, cursor: 'default' as const };
  const lineStyle = { ...BRACKET_STYLE };
  const curveStyle = { ...BRACKET_STYLE, fill: 'none' as const };
  const cc = side.cornerControlPx;
  const dir = side.direction;

  return [
    // Top stem (chromosome side)
    {
      type: 'line' as const,
      ...decorative,
      shape: {
        x1: side.start.x,
        y1: side.start.y,
        x2: side.stem1End.x,
        y2: side.stem1End.y,
      },
      style: lineStyle,
    },
    // Top rounded corner: vertical-down → horizontal-(dir)
    {
      type: 'bezierCurve' as const,
      ...decorative,
      shape: {
        x1: side.stem1End.x,
        y1: side.stem1End.y,
        cpx1: side.stem1End.x,
        cpy1: side.stem1End.y + cc,
        cpx2: side.horizontalStart.x - dir * cc,
        cpy2: side.horizontalStart.y,
        x2: side.horizontalStart.x,
        y2: side.horizontalStart.y,
      },
      style: curveStyle,
    },
    // Horizontal segment
    {
      type: 'line' as const,
      ...decorative,
      shape: {
        x1: side.horizontalStart.x,
        y1: side.horizontalStart.y,
        x2: side.horizontalEnd.x,
        y2: side.horizontalEnd.y,
      },
      style: lineStyle,
    },
    // Bottom rounded corner: horizontal-(dir) → vertical-down
    {
      type: 'bezierCurve' as const,
      ...decorative,
      shape: {
        x1: side.horizontalEnd.x,
        y1: side.horizontalEnd.y,
        cpx1: side.horizontalEnd.x + dir * cc,
        cpy1: side.horizontalEnd.y,
        cpx2: side.stem2Start.x,
        cpy2: side.stem2Start.y - cc,
        x2: side.stem2Start.x,
        y2: side.stem2Start.y,
      },
      style: curveStyle,
    },
    // Bottom stem (gene-structure side)
    {
      type: 'line' as const,
      ...decorative,
      shape: {
        x1: side.stem2Start.x,
        y1: side.stem2Start.y,
        x2: side.end.x,
        y2: side.end.y,
      },
      style: lineStyle,
    },
  ];
}

function findVariantById(
  items: ReadonlyArray<ChromosomeTrackItem | GeneStructureItem>,
  variantId: string,
): Variant | undefined {
  return items.find(
    (item): item is Variant => item.type === 'variant' && item.variantId === variantId,
  );
}

function safeConvertToPixel(chart: ECharts, gridIndex: number, bp: number): number | null {
  try {
    const px = chart.convertToPixel({ xAxisIndex: gridIndex }, bp);
    return typeof px === 'number' && Number.isFinite(px) ? px : null;
  } catch {
    return null;
  }
}

/**
 * Builds the persistent badge for a selected variant on the chromosome track. The
 * badge sits `topFromBarBottomPx` above the bar's bottom edge (so primary badges
 * land higher than secondary), with a vertical connector line dropping from the
 * badge bottom to the bar top.
 */
function buildBadgeWithConnector(
  xPx: number,
  fill: string,
  text: string,
  topFromBarBottomPx: number,
) {
  const badge = VARIANT_BADGE_STYLE;
  const textWidth = text.length * 7;
  const width = textWidth + badge.paddingX * 2;
  const height = badge.height;
  const x = xPx - width / 2;
  const y = CHROMOSOME_BAR_BOTTOM_Y_PX - topFromBarBottomPx;

  // z=100 puts the connector + badge above all chart series (max series z is ~12),
  // so they render in front of the chromosome bar (z=0) and gene-marker lines (z=1)
  // rather than behind them.
  const ON_TOP_Z = 100;
  const decorative = { silent: true, cursor: 'default' as const, z: ON_TOP_Z };
  return [
    // Connector line goes from the bar's BOTTOM edge up through the bar to the
    // badge bottom. Drawing it from the bar bottom (rather than the bar top)
    // makes the connector visually pass through the bar surface, replacing the
    // suppressed in-bar variant tick.
    {
      type: 'line' as const,
      ...decorative,
      shape: { x1: xPx, y1: CHROMOSOME_BAR_BOTTOM_Y_PX, x2: xPx, y2: y + height },
      style: { stroke: fill, lineWidth: badge.connectorStrokeWidth },
    },
    {
      type: 'rect' as const,
      ...decorative,
      shape: { x, y, width, height, r: badge.cornerRadius },
      style: { fill },
    },
    {
      type: 'text' as const,
      ...decorative,
      style: {
        text,
        x: x + width / 2,
        y: y + height / 2,
        fill: badge.textColor,
        fontSize: badge.fontSize,
        fontWeight: badge.fontWeight,
        fontFamily: FONT_FAMILY,
        textAlign: 'center' as const,
        textVerticalAlign: 'middle' as const,
      },
    },
  ];
}
