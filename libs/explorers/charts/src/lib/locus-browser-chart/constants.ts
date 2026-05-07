import type { EChartsOption } from 'echarts';

export const BAR_CORNER_RADIUS = 4;
export const BAR_FILL = '#F1F2F4';
// Introns share the bar's gray surface so they read as gaps between segments.
export const INTRON_FILL = '#F1F2F4';

export const EXON_FILL = '#A5C7F3';
export const UTR_FILL = '#D8A5F3';

export const TSS_TES_FILL = '#4A5056';

export const FONT_FAMILY = "'DM Sans', sans-serif";

export const GENE_STRUCTURE_RANGE_PADDING_FRACTION = 0.05;

export const BAR_HEIGHT_PX = 18;
export const GAP_BETWEEN_BARS_PX = 62;

// Vertical layout (top → bottom): track-label gutter on the left, chromosome
// grid (gene-marker leader + bar), bracket transition zone, gene-structure grid,
// bottom padding. Pixel values are fixed so bar positions don't shift on resize.

export const TRACK_LABEL_GUTTER_PX = 140;
export const GRID_LEFT = TRACK_LABEL_GUTTER_PX;
export const GRID_RIGHT = 24;
export const BOTTOM_PADDING_PX = 30;

// Top padding accommodates the 200-px leader plus headroom for the rotated
// label at its largest size (300 = 200 leader + ~100 label/buffer).
export const CHROMOSOME_GRID_TOP_PX = 300;
export const CHROMOSOME_GRID_HEIGHT_PX = 80;
export const GENE_STRUCTURE_GRID_HEIGHT_PX = 80;

// Derived: bar pixel positions (top-left origin, Y down).
export const CHROMOSOME_BAR_CENTER_Y_PX = CHROMOSOME_GRID_TOP_PX + CHROMOSOME_GRID_HEIGHT_PX / 2;
export const CHROMOSOME_BAR_TOP_Y_PX = CHROMOSOME_BAR_CENTER_Y_PX - BAR_HEIGHT_PX / 2;
export const CHROMOSOME_BAR_BOTTOM_Y_PX = CHROMOSOME_BAR_CENTER_Y_PX + BAR_HEIGHT_PX / 2;
export const GENE_STRUCTURE_BAR_TOP_Y_PX = CHROMOSOME_BAR_BOTTOM_Y_PX + GAP_BETWEEN_BARS_PX;
export const GENE_STRUCTURE_BAR_CENTER_Y_PX = GENE_STRUCTURE_BAR_TOP_Y_PX + BAR_HEIGHT_PX / 2;
export const GENE_STRUCTURE_BAR_BOTTOM_Y_PX = GENE_STRUCTURE_BAR_TOP_Y_PX + BAR_HEIGHT_PX;
export const GENE_STRUCTURE_GRID_TOP_PX =
  GENE_STRUCTURE_BAR_CENTER_Y_PX - GENE_STRUCTURE_GRID_HEIGHT_PX / 2;

export const INITIAL_CHART_HEIGHT_PX = `${
  GENE_STRUCTURE_GRID_TOP_PX + GENE_STRUCTURE_GRID_HEIGHT_PX + BOTTOM_PADDING_PX
}px`;

// Gene-marker leader: three-segment path (bottom stub, diagonal kink, top
// vertical) anchored to the bar; the label sits at the top, rotated -90°. The
// diagonal's horizontal endpoint is computed per marker by the chart so labels
// pack densely without text colliding with neighbors' leaders.
export const GENE_MARKER_LEADER_HEIGHT_PX = 200;
export const GENE_MARKER_LEADER_BOTTOM_STUB_PX = 15.56;
export const GENE_MARKER_LEADER_DIAGONAL_DX_PX = -82.8; // negative = label is to the left
export const GENE_MARKER_LEADER_DIAGONAL_DY_PX = -80.8; // negative = upward
export const GENE_MARKER_LEADER_TOP_VERTICAL_PX = 103.6;
// Floor on per-label horizontal spacing when markers crowd together.
export const GENE_MARKER_LABEL_MIN_SPACING_PX = 22;

export const DEFAULT_GROUPING_THRESHOLD_PX = 16;

// Variants on the gene-structure track sit at bar height. On the chromosome
// track they extend above and below so they read as ticks, not segments.
export const CHROMOSOME_VARIANT_TICK_HEIGHT_PX = 28;
export const GENE_STRUCTURE_VARIANT_TICK_HEIGHT_PX = BAR_HEIGHT_PX;

// Variants almost always span only a few bp (sub-pixel width), so the renderer
// falls back to these absolute widths per track.
export const CHROMOSOME_VARIANT_LINE_WIDTH_PX = 3;
export const GENE_STRUCTURE_VARIANT_LINE_WIDTH_PX = 2;

export const TSS_TES_DECORATION_HEIGHT_PX = 23;

export const VARIANT_COLOR = '#469DA0';

// Persistent badge for selected variants on the chromosome track. Primary
// badges sit higher above the bar than secondary so stacked selections at the
// same locus stay readable.
export const VARIANT_BADGE_STYLE = {
  textColor: '#FFFFFF',
  fontSize: 12,
  fontWeight: 700,
  paddingX: 6,
  paddingY: 3,
  height: 18,
  cornerRadius: BAR_CORNER_RADIUS,
  primaryTopFromBarBottomPx: 72,
  secondaryTopFromBarBottomPx: 52,
  connectorStrokeWidth: 2,
};

export const VARIANT_GROUP_BUBBLE_STYLE = {
  bgColor: '#469DA0',
  textColor: '#FFFFFF',
  fontSize: 14,
  fontWeight: 700,
  paddingX: 0,
  height: 22,
  cornerRadius: 4,
};

export interface GeneMarkerStyle {
  stroke: string;
  strokeWidth: number;
  labelColor: string;
  labelWeight: number;
  labelSize: number;
}

// Shared base for the three "blue" states. `secondary` and `primary` spread
// from this so each state's body shows only the fields that differ from the
// highlighted baseline.
const HIGHLIGHTED_GENE_MARKER_STYLE: GeneMarkerStyle = {
  stroke: '#ADC7E7',
  strokeWidth: 2.5,
  labelColor: '#437DC8',
  labelWeight: 400,
  labelSize: 18,
};

export const GENE_MARKER_STYLES: Record<
  'default' | 'highlighted' | 'secondary' | 'primary',
  GeneMarkerStyle
> = {
  default: {
    stroke: '#D0D4D9',
    strokeWidth: 1.5,
    labelColor: '#AEB5BC',
    labelWeight: 400,
    labelSize: 18,
  },
  highlighted: HIGHLIGHTED_GENE_MARKER_STYLE,
  // Highlighted + bolder label.
  secondary: { ...HIGHLIGHTED_GENE_MARKER_STYLE, labelWeight: 700 },
  // Highlighted + deeper/thicker stroke + bolder, larger label.
  primary: {
    ...HIGHLIGHTED_GENE_MARKER_STYLE,
    stroke: '#437DC8',
    strokeWidth: 3.5,
    labelWeight: 700,
    labelSize: 24,
  },
};

// Design spec: labels read vertically (bottom-up) at the leader's top end.
export const GENE_MARKER_LABEL_ROTATION_DEG = -90;

// Brackets connect the primary gene marker on the chromosome track down to the
// full bp range on the gene-structure track. Left and right tips sit
// BRACKET_TIP_GAP_PX apart under the marker (not meeting at a point).
export const BRACKET_STYLE = {
  stroke: '#AEB5BC',
  lineWidth: 1,
};
export const BRACKET_TIP_GAP_PX = 6;
export const BRACKET_TOP_GAP_PX = 10;
export const BRACKET_BOTTOM_GAP_PX = 16;
export const BRACKET_TOP_STEM_PX = 14.8;
export const BRACKET_CORNER_RADIUS_PX = 8;

export interface TrackLabelStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
}

export const TRACK_LABEL_STYLES: Record<'main' | 'sub', TrackLabelStyle> = {
  main: { fontSize: 14, fontWeight: 700, color: '#353A3F' },
  sub: { fontSize: 12, fontWeight: 400, color: '#353A3F' },
};

// Horizontal offset of the track-label text block from the left edge.
export const TRACK_LABEL_X_OFFSET_PX = 16;

// `stemNormalized` is the fraction of viewBox width where the bar-anchor sits:
// TSS stem at x≈2 of 14; TES anchor at x≈2.744 of 6.
export interface DecorationGeometry {
  pathData: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
  stemNormalized: number;
  /**
   * Direction the symbol extends from the bar.
   *   - 'up'   → anchor sits at the BOTTOM of the viewBox; the rest of the
   *             glyph rises above the bar (positive strand).
   *   - 'down' → anchor sits at the TOP of the viewBox; the glyph hangs below
   *             the bar (negative strand).
   */
  extendsFromBar: 'up' | 'down';
}

// Positive-strand TSS: anchor circle at bottom-left, stem extending up, arrow
// tip at top-right pointing up-and-right (5'→3' direction).
export const TSS_POSITIVE_GEOMETRY: DecorationGeometry = {
  pathData:
    'M13.7969 2.88672L8.79688 5.77344V3.38672H6.4502C5.21711 3.38673 4.25684 3.88143 ' +
    '3.59668 4.67188C2.92925 5.47124 2.54692 6.60149 2.54688 7.88672V19.1436C3.38541 ' +
    '19.3816 4 20.1516 4 21.0664C4 22.171 3.10457 23.0664 2 23.0664C0.895431 23.0664 ' +
    '0 22.171 0 21.0664C0 20.1179 0.660817 19.3256 1.54688 19.1201V7.88672C1.54692 ' +
    '6.41084 1.98552 5.04044 2.8291 4.03027C3.68013 3.01134 4.92212 2.38673 6.4502 ' +
    '2.38672H8.79688V0L13.7969 2.88672Z',
  viewBoxWidth: 14,
  viewBoxHeight: 24,
  stemNormalized: 2 / 14,
  extendsFromBar: 'up',
};

// Negative-strand TSS: arrow tip at bottom-left pointing left (3'←5'), stem
// extending up, small circle anchor at top-right.
export const TSS_NEGATIVE_GEOMETRY: DecorationGeometry = {
  pathData:
    'M0 20.1797L5 17.293V19.6797H7.34668C8.57984 19.6797 9.54003 19.1851 10.2002 ' +
    '18.3945C10.8677 17.5951 11.25 16.465 11.25 15.1797V3.92285C10.4115 3.68483 9.79688 ' +
    '2.91482 9.79688 2C9.79688 0.89543 10.6923 0 11.7969 0C12.9014 0 13.7969 0.89543 ' +
    '13.7969 2C13.7969 2.94855 13.1361 3.74082 12.25 3.94629V15.1797C12.25 16.6557 ' +
    '11.8114 18.0259 10.9678 19.0361C10.1167 20.0552 8.87483 20.6797 7.34668 ' +
    '20.6797H5V23.0664L0 20.1797Z',
  viewBoxWidth: 14,
  viewBoxHeight: 24,
  // Stem sits on the right side of the negative-strand glyph (around viewBox
  // x≈11.75, midway between the stem's left edge at 11.25 and right edge at
  // 12.25). The bar's bp position aligns with this stem.
  stemNormalized: 11.75 / 14,
  extendsFromBar: 'down',
};

// Positive-strand TES: small anchor circle at the bar (bottom of viewBox),
// stem, larger cap circle at top.
export const TES_POSITIVE_GEOMETRY: DecorationGeometry = {
  pathData:
    'M2.66699 0C4.13975 0 5.33398 1.19423 5.33398 2.66699C5.33398 3.96868 4.40051 ' +
    '5.04995 3.16699 5.28418V18.3916C4.06844 18.5857 4.74414 19.3872 4.74414 20.3467C ' +
    '4.74401 21.4511 3.84863 22.3467 2.74414 22.3467C1.63965 22.3467 0.744273 21.4511 ' +
    '0.744141 20.3467C0.744141 19.4428 1.34389 18.6794 2.16699 18.4316V5.28418C0.933472 ' +
    '5.04995 0 3.96868 0 2.66699C0 1.19423 1.19423 0 2.66699 0Z',
  viewBoxWidth: 6,
  viewBoxHeight: 23,
  stemNormalized: 2.667 / 6,
  extendsFromBar: 'up',
};

// Negative-strand TES: large cap circle at the bar (bottom of viewBox), stem,
// small circle at top -- vertically inverted relative to TES-positive.
export const TES_NEGATIVE_GEOMETRY: DecorationGeometry = {
  pathData:
    'M2.66699 22.3467C4.13975 22.3467 5.33398 21.1524 5.33398 19.6797C5.33398 18.378 ' +
    '4.40051 17.2967 3.16699 17.0625V3.95508C4.06841 3.76099 4.74414 2.95945 4.74414 ' +
    '2C4.74388 0.895655 3.84855 0 2.74414 0C1.63973 0 0.744404 0.895655 0.744141 ' +
    '2C0.744141 2.90382 1.34392 3.66726 2.16699 3.91504V17.0625C0.933472 17.2967 0 ' +
    '18.378 0 19.6797C0 21.1524 1.19423 22.3467 2.66699 22.3467Z',
  viewBoxWidth: 6,
  viewBoxHeight: 23,
  stemNormalized: 2.667 / 6,
  extendsFromBar: 'down',
};

export type LocusBrowserItemKind = 'variant' | 'tss-tes' | 'utr' | 'exon-intron';

export const TOOLTIP_BACKGROUNDS: Record<LocusBrowserItemKind, string> = {
  variant: '#388C95',
  'tss-tes': '#22252A',
  utr: '#22252A',
  'exon-intron': '#2C5182',
};

export const TOOLTIP_TEXT_COLOR = '#FFFFFF';

export function makeTooltipConfig(backgroundColor: string): NonNullable<EChartsOption['tooltip']> {
  return {
    confine: true,
    position: 'top',
    backgroundColor,
    borderColor: 'transparent',
    textStyle: { color: TOOLTIP_TEXT_COLOR, fontFamily: FONT_FAMILY },
    extraCssText:
      'opacity: 1 !important; width: auto; max-width: 320px; white-space: pre-wrap; text-align: left;',
  };
}
