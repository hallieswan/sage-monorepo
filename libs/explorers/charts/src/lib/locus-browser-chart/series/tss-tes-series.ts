import type { CustomSeriesOption } from 'echarts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import {
  DecorationGeometry,
  TES_GEOMETRY,
  TOOLTIP_BACKGROUNDS,
  TSS_GEOMETRY,
  TSS_TES_DECORATION_HEIGHT_PX,
  TSS_TES_FILL,
  makeTooltipConfig,
} from '../constants';
import type { Strand } from '../../models/locus-browser';
import type { GridCoordSys } from '../../types';

export interface TssTesItem {
  position: number;
  tooltipHtml: string;
}

export interface TssTesSeriesOptions {
  items: TssTesItem[];
  strand: Strand;
  xAxisIndex: number;
  yAxisIndex: number;
  z: number;
}

/**
 * Renders TSS or TES decorations from inlined SVG path data. The bottom of the path
 * (its anchor circle) sits at the bar center; the path extends upward by `targetHeight`
 * pixels. For TSS, the path is mirrored horizontally on the negative strand.
 */
function decorationSeries(
  opts: TssTesSeriesOptions,
  geometry: DecorationGeometry,
  flipOnNegativeStrand: boolean,
): CustomSeriesOption {
  const { items, strand, xAxisIndex, yAxisIndex, z } = opts;
  const flip = flipOnNegativeStrand && strand === 'negative';
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

      // Group origin sits at the anchor pixel (bar center, x = bp position). The path
      // bbox is placed so the stem (offset stemOffsetPx into the path) lands at local
      // x = 0 — i.e. at the anchor. For negative strand, scaleX = -1 mirrors the path
      // around that anchor without disturbing the stem position.
      const sign = flip ? -1 : 1;
      return {
        type: 'group',
        x: xAnchor,
        y: barCenterY,
        scaleX: sign,
        emphasisDisabled: true,
        children: [
          {
            type: 'path',
            shape: {
              pathData: geometry.pathData,
              x: -stemOffsetPx,
              y: -targetHeight,
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
      formatter: (rawParams) => {
        const params = rawParams as CallbackDataParams;
        return tooltipsByIndex[params.dataIndex] ?? '';
      },
    },
    z,
  };
}

export function tssSeries(opts: TssTesSeriesOptions): CustomSeriesOption {
  return decorationSeries(opts, TSS_GEOMETRY, true);
}

export function tesSeries(opts: TssTesSeriesOptions): CustomSeriesOption {
  return decorationSeries(opts, TES_GEOMETRY, false);
}
