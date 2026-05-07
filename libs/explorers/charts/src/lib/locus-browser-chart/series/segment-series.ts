import type { CustomSeriesOption } from 'echarts';
import {
  BAR_CORNER_RADIUS,
  BAR_FILL,
  BAR_HEIGHT_PX,
  EXON_FILL,
  INTRON_FILL,
  TOOLTIP_BACKGROUNDS,
  UTR_FILL,
  makeTooltipConfig,
} from '../constants';
import { tooltipFormatterByIndex } from '../tooltip-formatter';
import type { GridCoordSys } from '../../types';

export interface BarBackgroundSeriesOptions {
  range: { start: number; end: number };
  xAxisIndex: number;
  yAxisIndex: number;
  z?: number;
}

/**
 * Renders the gray rounded-rectangle bar background spanning the track's full x-axis
 * range. Bar height is 20% of grid height, centered vertically.
 */
export function barBackgroundSeries(opts: BarBackgroundSeriesOptions): CustomSeriesOption {
  const { range, xAxisIndex, yAxisIndex, z = 0 } = opts;
  return {
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    xAxisIndex,
    yAxisIndex,
    data: [{ value: [range.start, 50] }],
    renderItem: (params, api) => {
      const grid = params.coordSys as unknown as GridCoordSys;
      const [xLeft] = api.coord([range.start, 50]);
      const [xRight] = api.coord([range.end, 50]);
      const barHeight = BAR_HEIGHT_PX;
      const y = grid.y + grid.height / 2 - barHeight / 2;
      return {
        type: 'rect',
        shape: { x: xLeft, y, width: xRight - xLeft, height: barHeight, r: BAR_CORNER_RADIUS },
        style: { fill: BAR_FILL },
        silent: true,
      };
    },
    silent: true,
    tooltip: { show: false },
    z,
  };
}

export interface SegmentItem {
  start: number;
  end: number;
  tooltipHtml?: string;
}

export interface SegmentSeriesOptions {
  items: SegmentItem[];
  fill: string;
  tooltipBg: string;
  xAxisIndex: number;
  yAxisIndex: number;
  z: number;
}

/**
 * Renders a list of bp ranges as filled rectangles inside the bar (height = 20% of
 * grid). Used for exons, UTRs, and introns -- callers pass the appropriate fill color.
 */
export function segmentSeries(opts: SegmentSeriesOptions): CustomSeriesOption {
  const { items, fill, tooltipBg, xAxisIndex, yAxisIndex, z } = opts;
  const tooltipsByIndex = items.map((item) => item.tooltipHtml ?? '');

  return {
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    xAxisIndex,
    yAxisIndex,
    data: items.map((item) => [item.start, 50, item.end]),
    renderItem: (params, api) => {
      const grid = params.coordSys as unknown as GridCoordSys;
      const start = api.value(0) as number;
      const end = api.value(2) as number;
      const [xLeft] = api.coord([start, 50]);
      const [xRight] = api.coord([end, 50]);
      const barHeight = BAR_HEIGHT_PX;
      const y = grid.y + grid.height / 2 - barHeight / 2;
      const width = Math.max(xRight - xLeft, 1);
      return {
        type: 'rect',
        shape: { x: xLeft, y, width, height: barHeight },
        style: { fill },
        // Match the emphasis style to the base so hover doesn't change colors
        // (e.g. introns share the bar's gray fill, so an emphasis-state recolor
        // would visibly disrupt the bar).
        emphasisDisabled: true,
        states: { emphasis: { style: { fill } } },
      };
    },
    tooltip: {
      ...makeTooltipConfig(tooltipBg),
      formatter: tooltipFormatterByIndex(tooltipsByIndex),
    },
    z,
  };
}

export const exonSeriesDefaults = {
  fill: EXON_FILL,
  tooltipBg: TOOLTIP_BACKGROUNDS['exon-intron'],
};

export const intronSeriesDefaults = {
  fill: INTRON_FILL,
  tooltipBg: TOOLTIP_BACKGROUNDS['exon-intron'],
};

export const utrSeriesDefaults = {
  fill: UTR_FILL,
  tooltipBg: TOOLTIP_BACKGROUNDS.utr,
};
