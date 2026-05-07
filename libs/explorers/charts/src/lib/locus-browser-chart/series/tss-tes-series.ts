import type { CustomSeriesOption } from 'echarts';
import {
  DecorationGeometry,
  TOOLTIP_BACKGROUNDS,
  TSS_TES_DECORATION_HEIGHT_PX,
  TSS_TES_FILL,
  makeTooltipConfig,
} from '../constants';
import { tooltipFormatterByIndex } from '../tooltip-formatter';
import type { GridCoordSys } from '../../types';

export interface TssTesItem {
  position: number;
  tooltipHtml: string;
}

export interface TssTesSeriesOptions {
  items: TssTesItem[];
  /**
   * Path geometry to render. Callers pick the positive- or negative-strand
   * variant from constants (e.g. `TSS_POSITIVE_GEOMETRY` /
   * `TSS_NEGATIVE_GEOMETRY`); this builder doesn't transform the path.
   */
  geometry: DecorationGeometry;
  xAxisIndex: number;
  yAxisIndex: number;
  z: number;
}

/**
 * Renders TSS or TES decorations from inlined SVG path data. The bottom of the
 * viewBox aligns with the bar center, and the path is positioned so the
 * geometry's `stemNormalized` x-offset lands at the marker's bp x position.
 * The path renders as-given -- direction-specific symbols (positive vs negative
 * strand) are encoded as separate path data, not via mirroring.
 */
export function decorationSeries(opts: TssTesSeriesOptions): CustomSeriesOption {
  const { items, geometry, xAxisIndex, yAxisIndex, z } = opts;
  const tooltipsByIndex = items.map((item) => item.tooltipHtml);

  return {
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    xAxisIndex,
    yAxisIndex,
    data: items.map((item) => [item.position, 50]),
    renderItem: (params, api) => {
      const grid = params.coordSys as unknown as GridCoordSys;
      const [xAnchor] = api.coord([api.value(0) as number, 50]);
      const barCenterY = grid.y + grid.height / 2;

      const targetHeight = TSS_TES_DECORATION_HEIGHT_PX;
      const targetWidth = (geometry.viewBoxWidth / geometry.viewBoxHeight) * targetHeight;
      const stemOffsetPx = geometry.stemNormalized * targetWidth;

      // Path bbox is placed so the stem (offset stemOffsetPx into the path)
      // lands at local x = 0 -- i.e. at the bar's bp position. For 'up' glyphs
      // the path extends upward from the bar (bbox bottom at bar center), and
      // for 'down' glyphs it extends downward from the bar (bbox top at bar).
      const yOffset = geometry.extendsFromBar === 'up' ? -targetHeight : 0;
      return {
        type: 'group',
        x: xAnchor,
        y: barCenterY,
        emphasisDisabled: true,
        children: [
          {
            type: 'path',
            shape: {
              pathData: geometry.pathData,
              x: -stemOffsetPx,
              y: yOffset,
              width: targetWidth,
              height: targetHeight,
            },
            style: { fill: TSS_TES_FILL },
            emphasisDisabled: true,
            states: { emphasis: { style: { fill: TSS_TES_FILL } } },
          },
        ],
      };
    },
    tooltip: {
      ...makeTooltipConfig(TOOLTIP_BACKGROUNDS['tss-tes']),
      formatter: tooltipFormatterByIndex(tooltipsByIndex),
    },
    emphasis: { itemStyle: {} },
    z,
  };
}
