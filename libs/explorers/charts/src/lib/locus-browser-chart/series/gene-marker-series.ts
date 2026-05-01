import type { CustomSeriesOption } from 'echarts';
import {
  BAR_HEIGHT_PX,
  FONT_FAMILY,
  GENE_MARKER_LABEL_ROTATION_DEG,
  GENE_MARKER_LEADER_BOTTOM_STUB_PX,
  GENE_MARKER_LEADER_DIAGONAL_DY_PX,
  GENE_MARKER_LEADER_TOP_VERTICAL_PX,
  GENE_MARKER_STYLES,
} from '../constants';
import type { GeneMarker, LocusBrowserSelection } from '../../models/locus-browser';
import type { GridCoordSys } from '../../types';

export type GeneMarkerState = keyof typeof GENE_MARKER_STYLES;

export function resolveGeneMarkerState(
  gene: string,
  primary: LocusBrowserSelection,
  secondary?: LocusBrowserSelection,
  highlightedGenes: string[] = [],
): GeneMarkerState {
  if (gene === primary.gene) return 'primary';
  if (gene === secondary?.gene) return 'secondary';
  if (highlightedGenes.includes(gene)) return 'highlighted';
  return 'default';
}

export interface GeneMarkerSeriesOptions {
  markers: GeneMarker[];
  /**
   * Per-marker label X position in chart pixel space; same length as `markers`.
   * The diagonal segment of the leader bends from the marker's bar position to
   * this X, so labels spread horizontally to avoid collisions while staying at
   * the same vertical position. When `labelXPx === markerBarXPx`, the leader
   * renders as a perfectly straight vertical line.
   */
  labelXsPx: number[];
  primary: LocusBrowserSelection;
  secondary?: LocusBrowserSelection;
  highlightedGenes?: string[];
  xAxisIndex: number;
  yAxisIndex: number;
  z: number;
}

/**
 * Renders gene markers on the chromosome track. Per the design reference at
 * tmp/images/example-gene-marker-ling.svg, the leader has three segments:
 *
 *   1. Short vertical stub rising from the bar (at the marker's bar X).
 *   2. Diagonal kink that translates to the label's column.
 *   3. Long vertical segment up to the label anchor (at the label X).
 *
 * The label sits at the top of segment 3, rotated -90° per the plan. State
 * (default / highlighted / secondary / primary) drives stroke and label styling.
 *
 * Collision avoidance is handled outside this builder: the chart class computes
 * `labelXsPx` so adjacent labels stay horizontally separated. When two markers
 * are far apart their diagonal collapses (label X = marker X = straight line);
 * when they're close the label X drifts horizontally and the diagonal bends to
 * reach it.
 */
export function geneMarkerSeries(opts: GeneMarkerSeriesOptions): CustomSeriesOption {
  const { markers, labelXsPx, primary, secondary, highlightedGenes, xAxisIndex, yAxisIndex, z } =
    opts;
  const states = markers.map((m) =>
    resolveGeneMarkerState(m.gene, primary, secondary, highlightedGenes),
  );
  const labels = markers.map((m) => m.label ?? m.gene);

  return {
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    xAxisIndex,
    yAxisIndex,
    data: markers.map((marker) => [marker.position, 50]),
    renderItem: (params, api) => {
      const grid = params.coordSys as unknown as GridCoordSys;
      const state = states[params.dataIndex] ?? 'default';
      const labelText = labels[params.dataIndex] ?? '';
      const style = GENE_MARKER_STYLES[state];

      const [xCenter] = api.coord([api.value(0) as number, 50]);
      const barBottomY = grid.y + grid.height / 2 + BAR_HEIGHT_PX / 2;
      const labelX = labelXsPx[params.dataIndex] ?? xCenter;

      // Polyline geometry, anchored at bar bottom (200px from there to the
      // label). Diagonal segment connects the marker's bar X to the label's X.
      const stubEndY = barBottomY - GENE_MARKER_LEADER_BOTTOM_STUB_PX;
      const diagEndY = stubEndY + GENE_MARKER_LEADER_DIAGONAL_DY_PX;
      const labelAnchorY = diagEndY - GENE_MARKER_LEADER_TOP_VERTICAL_PX;

      const stroke = style.stroke;
      const lineWidth = style.strokeWidth;

      return {
        type: 'group',
        children: [
          {
            type: 'polyline',
            shape: {
              points: [
                [xCenter, barBottomY],
                [xCenter, stubEndY],
                [labelX, diagEndY],
                [labelX, labelAnchorY],
              ],
            },
            style: { stroke, lineWidth, fill: 'none' },
          },
          {
            type: 'text',
            style: {
              text: labelText,
              x: labelX,
              y: labelAnchorY,
              fill: style.labelColor,
              fontSize: style.labelSize,
              fontWeight: style.labelWeight,
              fontFamily: FONT_FAMILY,
              textAlign: 'left',
              textVerticalAlign: 'bottom',
            },
            rotation: (GENE_MARKER_LABEL_ROTATION_DEG * Math.PI) / 180,
            originX: labelX,
            originY: labelAnchorY,
          },
        ],
      };
    },
    silent: true,
    tooltip: { show: false },
    z,
  };
}
