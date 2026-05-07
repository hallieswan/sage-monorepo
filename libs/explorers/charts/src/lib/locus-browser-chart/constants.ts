import type { EChartsOption } from 'echarts';

// All values in this file map directly to the spec in `tmp/plans/gene-bar-chart.md`.
// Section headers below cite the plan section the values come from. Where the plan
// gives only a qualitative description (e.g. "blue", "purple"), the inferred hex is
// flagged with INFERRED + the plan reference that motivated the choice.

// ─── Bar body and gene-structure segments ─────────────────────────────────────
// Plan: "Bar shape" -- "4px corner radius on all four corners and fill color `#F1F2F4`"
// Plan: "the bar reads as a continuous gray surface that exon and UTR segments paint over"
// Plan: "gene-detail bar showing exons (blue), UTRs (purple), introns (gray, computed)"

export const BAR_CORNER_RADIUS = 4;
export const BAR_FILL = '#F1F2F4';
export const INTRON_FILL = '#F1F2F4'; // Plan: introns share the bar's gray surface

export const EXON_FILL = '#A5C7F3';
export const UTR_FILL = '#D8A5F3';

// Plan ("TSS and TES shapes ..."): "Fill color is the existing `tss` / `tes` constant
// (`#4A5056`)"
export const TSS_TES_FILL = '#4A5056';

// All text in the locus browser uses DM Sans (with a sans-serif fallback).
export const FONT_FAMILY = "'DM Sans', sans-serif";

// ─── Gene-structure track range padding ───────────────────────────────────────
// Plan: "padding = 0.05 * (coreSpan.end - coreSpan.start)"

export const GENE_STRUCTURE_RANGE_PADDING_FRACTION = 0.05;

// ─── Bar dimensions and gap ───────────────────────────────────────────────────
// Design spec: each bar is 18px high; gap between the chromosome and gene-structure
// bars is 62px.

export const BAR_HEIGHT_PX = 18;
export const GAP_BETWEEN_BARS_PX = 62;

// ─── Grid layout (absolute pixel positions) ───────────────────────────────────
// Plan ("Track labels"): "a sensible default reserves ~140px on the left"
//
// Vertical layout, top → bottom of the chart (fixed pixel values, so the chart's
// total height is deterministic and bar positions don't shift on resize):
//   1. CHROMOSOME_GRID_TOP_PX reserved for rotated gene-marker labels and the
//      200-px leader that connects each label down to its bar tick.
//   2. Chromosome grid spans CHROMOSOME_GRID_TOP_PX → CHROMOSOME_GRID_TOP_PX +
//      CHROMOSOME_GRID_HEIGHT_PX. Bar sits at its vertical center.
//   3. Bracket transition zone, sized so the chromosome bar bottom and the
//      gene-structure bar top are exactly GAP_BETWEEN_BARS_PX apart.
//   4. Gene-structure grid; bar sits at its vertical center.
//   5. BOTTOM_PADDING_PX reserved for chart bottom padding.

export const TRACK_LABEL_GUTTER_PX = 140;
export const GRID_LEFT = TRACK_LABEL_GUTTER_PX;
export const GRID_RIGHT = 24;
export const BOTTOM_PADDING_PX = 30;

// Top padding accommodates the 200-px leader plus room for a vertical label at
// the largest size, plus headroom for one collision-avoidance lane (see
// GENE_MARKER_LANE_BUMP_PX). 300px = 200 (lane-0 leader) + 60 (lane-1 bump) +
// ~40 buffer for label height.
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

// ─── Gene-marker leader-line geometry ─────────────────────────────────────────
// Reference: tmp/images/example-gene-marker-ling.svg -- 85×200 viewBox with a
// path of three segments (bottom stub, diagonal kink, top vertical). The label
// sits at the top of the top-vertical segment, horizontally offset from the bar
// attachment so labels can pack densely without text colliding with neighbors'
// leader lines.

// Leader segment lengths (vertical extents) are fixed; the diagonal's
// horizontal endpoint is computed per marker by the chart class so labels
// spread to avoid collisions while remaining at the same y. By default the
// label sits GENE_MARKER_LEADER_DIAGONAL_DX_PX horizontally from the marker
// (matching the SVG reference), so every leader has a visible bend. When
// neighbors crowd a marker, the chart class adjusts that horizontal endpoint
// so the diagonal's angle changes -- the leader keeps its three-segment shape
// but bends more or less steeply.
export const GENE_MARKER_LEADER_HEIGHT_PX = 200;
export const GENE_MARKER_LEADER_BOTTOM_STUB_PX = 15.56;
export const GENE_MARKER_LEADER_DIAGONAL_DX_PX = -82.8; // negative = label is to the left
export const GENE_MARKER_LEADER_DIAGONAL_DY_PX = -80.8; // negative = upward
export const GENE_MARKER_LEADER_TOP_VERTICAL_PX = 103.6;

// ─── Variant grouping ─────────────────────────────────────────────────────────
// Plan ("Pre-processing utilities"): "default threshold 16px"

export const DEFAULT_GROUPING_THRESHOLD_PX = 16;

// ─── Variant tick heights (absolute pixels) ──────────────────────────────────
// Variants on the gene-structure track sit at the bar height (18px). Variants
// on the chromosome track are taller -- they extend slightly above and below
// the bar so they read as ticks rather than in-bar segments.

export const CHROMOSOME_VARIANT_TICK_HEIGHT_PX = 28;
export const GENE_STRUCTURE_VARIANT_TICK_HEIGHT_PX = BAR_HEIGHT_PX;

// Variant tick *width* is track-specific. Most variants span only a few bp, which
// projects to sub-pixel width, so the renderer falls back to these absolute pixel
// widths.
export const CHROMOSOME_VARIANT_LINE_WIDTH_PX = 3;
export const GENE_STRUCTURE_VARIANT_LINE_WIDTH_PX = 2;

// ─── TSS / TES decoration target height ──────────────────────────────────────
// The decoration extends upward from the bar center; height is set in absolute
// pixels so it doesn't shrink/grow with grid dimensions. The TES SVG is natively
// 23px tall; the TSS SVG (24px native) scales to 23px to match.

export const TSS_TES_DECORATION_HEIGHT_PX = 23;

// ─── Variant color ────────────────────────────────────────────────────────────
// Per design feedback, all variant ticks, connector lines, and badge backgrounds
// are teal. Primary and secondary selections are differentiated by the badge's
// vertical offset (primary higher above the bar, secondary lower), not by
// color or stroke width. Tick widths are track-specific
// (CHROMOSOME_VARIANT_LINE_WIDTH_PX, GENE_STRUCTURE_VARIANT_LINE_WIDTH_PX).

export const VARIANT_COLOR = '#469DA0';

// Persistent badge for selected variants on the chromosome track only (not on the
// gene-structure track). A vertical connector line drops from the bar up to the
// badge. Primary-selected badges sit higher above the bar than secondary ones, so
// stacked selections at the same locus stay readable.
//
// `primaryTopFromBarBottomPx` / `secondaryTopFromBarBottomPx` are the design-spec
// distances from the bar's bottom edge up to the badge's top edge.
export const VARIANT_BADGE_STYLE = {
  textColor: '#FFFFFF',
  fontSize: 12,
  fontWeight: 700,
  paddingX: 6,
  paddingY: 3,
  height: 18, // fontSize + 2 × paddingY
  cornerRadius: BAR_CORNER_RADIUS,
  primaryTopFromBarBottomPx: 72,
  secondaryTopFromBarBottomPx: 52,
  connectorStrokeWidth: 2,
};

// ─── Variant-group bubble styling ─────────────────────────────────────────────
// Plan ("Variant-group bubble styling" table):
// | Background color  | `#469DA0`                                          |
// | Text color        | `#FFFFFF`                                          |
// | Font size         | 14px                                               |
// | Font weight       | 700                                                |
// | Content           | exact member count (no cap; e.g. `2`, `12`, `247`) |
// Plan: "rounded rectangle (corner radius matching the height) sized to fit the count
// text with horizontal padding"

export const VARIANT_GROUP_BUBBLE_STYLE = {
  bgColor: '#469DA0', // Plan
  textColor: '#FFFFFF', // Plan
  fontSize: 14, // Plan
  fontWeight: 700, // Plan
  paddingX: 0,
  height: 22, // INFERRED -- bubble height
  cornerRadius: 4,
};

// ─── Gene-marker visual hierarchy ─────────────────────────────────────────────

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

// ─── Connecting brackets between grids ────────────────────────────────────────
// Plan ("Connecting brackets ..."): "stroke `#AEB5BC`, stroke-width `1px`, no fill"
//
// Bracket geometry tweaks from design feedback:
//   - Left and right tips don't meet at a point; they sit BRACKET_TIP_GAP_PX apart
//     under the primary gene marker.
//   - Bracket tips sit BRACKET_TOP_GAP_PX below the chromosome bar bottom.
//   - Bracket bottom sits BRACKET_BOTTOM_GAP_PX above the gene-structure bar top.

export const BRACKET_STYLE = {
  stroke: '#AEB5BC',
  lineWidth: 1,
};
export const BRACKET_TIP_GAP_PX = 6;
export const BRACKET_TOP_GAP_PX = 10;
export const BRACKET_BOTTOM_GAP_PX = 16;

// Bracket shape (per design ref tmp/images/example-bracket-line.svg):
//   short vertical stem on the chromosome side → rounded corner →
//   long horizontal segment → rounded corner →
//   shorter vertical stem on the gene-structure side.
// Total height is GAP_BETWEEN_BARS - TOP_GAP - BOTTOM_GAP = 36px, and equals
// BRACKET_TOP_STEM_PX + 2*BRACKET_CORNER_RADIUS_PX + (implicit bottom stem).
export const BRACKET_TOP_STEM_PX = 14.8;
export const BRACKET_CORNER_RADIUS_PX = 8;

// ─── Track labels (left of each grid) ─────────────────────────────────────────
// Plan ("Track labels (left of each grid)" table):
// | Track            | Label                              | Font size | Font weight |
// | Chromosome (sub) | `Base pairs {start}—{end}`         | 12px      | 400         |
// | Chromosome (main)| `Chromosome {chromosome}`          | 14px      | 700         |
// | Gene structure   | `Gene Structure` (literal)         | 14px      | 700         |
//
// The plan's track-label table has no `color` column; design has confirmed `#353A3F`.

export interface TrackLabelStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
}

export const TRACK_LABEL_STYLES: Record<'main' | 'sub', TrackLabelStyle> = {
  main: { fontSize: 14, fontWeight: 700, color: '#353A3F' },
  sub: { fontSize: 12, fontWeight: 400, color: '#353A3F' },
};

// ─── TSS / TES decoration geometry ────────────────────────────────────────────
// Plan ("TSS and TES shapes" table):
// | Decoration | Source SVG                                  | viewBox |
// | TES        | `tmp/plans/gene-bar-chart-tes-positive.svg` | 6×23    |
// | TSS        | `tmp/plans/gene-bar-chart-tss-positive.svg` | 14×24   |
//
// `stemNormalized` is the fraction of viewBox width where the stem (anchor circle that
// touches the bar) sits. Computed by inspecting each SVG path: TSS stem center at
// viewBox x≈2 of 14; TES bottom-anchor circle center at viewBox x≈2.744 of 6.

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

// Positive-strand TSS: anchor circle at bottom-left (viewBox y≈21), stem
// extending up, arrow tip at top-right pointing up-and-right (5'→3' direction).
// Source: tmp/images/tss-positive.svg
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
// Source: tmp/images/tss-negative.svg
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
// Source: tmp/images/tse-positive.svg
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
// Source: tmp/images/tse-negative.svg
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

// ─── Tooltip backgrounds and text ─────────────────────────────────────────────
// Plan ("Default tooltip templates" table):
// | Type                     | Background |
// | variant (chromosome)     | `#388C95`  |
// | variant (gene-structure) | `#388C95`  |
// | TSS                      | `#22252A`  |
// | UTR                      | `#22252A`  |
// | TES                      | `#22252A`  |
// | exon                     | `#2C5182`  |
// | intron                   | `#2C5182`  |
// Plan: "Text color: `#FFFFFF` for all types."

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
