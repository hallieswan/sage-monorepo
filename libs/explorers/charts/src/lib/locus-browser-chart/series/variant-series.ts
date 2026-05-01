import type { CustomSeriesOption } from 'echarts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import {
  BAR_HEIGHT_PX,
  FONT_FAMILY,
  TOOLTIP_BACKGROUNDS,
  VARIANT_GROUP_BUBBLE_STYLE,
  VARIANT_STYLES,
  makeTooltipConfig,
} from '../constants';
import type { LocusBrowserSelection, Variant } from '../../models/locus-browser';
import type { GridCoordSys } from '../../types';
import type { VariantGroup } from '../grouping-utils';

export type VariantSelectionState = keyof typeof VARIANT_STYLES;

export function resolveVariantState(
  variantId: string,
  primary: LocusBrowserSelection,
  secondary?: LocusBrowserSelection,
): VariantSelectionState {
  if (variantId === primary.variantId) return 'primary';
  if (variantId === secondary?.variantId) return 'secondary';
  return 'default';
}

export interface VariantLineSeriesOptions {
  variants: Variant[];
  primary: LocusBrowserSelection;
  secondary?: LocusBrowserSelection;
  tooltipFormatter: (variant: Variant) => string;
  xAxisIndex: number;
  yAxisIndex: number;
  z: number;
  /**
   * Tick height in pixels. Defaults to the bar height. Chromosome-track variants
   * pass a larger value so the ticks extend beyond the bar visually.
   */
  tickHeightPx?: number;
  /**
   * Tick width in pixels for variants whose bp range is sub-pixel. Defaults to
   * the per-state line width. Tracks override this so chromosome variants render
   * at 3px, gene-structure at 2px.
   */
  lineWidthPx?: number;
}

/**
 * Renders ungrouped variants as vertical lines spanning the bar height ± 10%. Color and
 * stroke width are state-driven (default / primary-selected / secondary-selected).
 *
 * Single-bp variants render as a 1px-wide line with a 0.5px offset to crisp to a single
 * pixel column.
 */
export function variantLineSeries(opts: VariantLineSeriesOptions): CustomSeriesOption {
  const {
    variants,
    primary,
    secondary,
    tooltipFormatter,
    xAxisIndex,
    yAxisIndex,
    z,
    tickHeightPx = BAR_HEIGHT_PX,
    lineWidthPx,
  } = opts;
  const states = variants.map((v) => resolveVariantState(v.variantId, primary, secondary));
  const tooltipsByIndex = variants.map((v) => tooltipFormatter(v));

  return {
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    xAxisIndex,
    yAxisIndex,
    data: variants.map((variant) => [variant.start, 50, variant.end]),
    renderItem: (params, api) => {
      const grid = params.coordSys as unknown as GridCoordSys;
      const state = states[params.dataIndex] ?? 'default';
      const style = VARIANT_STYLES[state];
      const [xLeft] = api.coord([api.value(0) as number, 50]);
      const [xRight] = api.coord([api.value(2) as number, 50]);

      const minWidth = lineWidthPx ?? style.lineWidth;
      let x = xLeft;
      let width = xRight - xLeft;
      if (width < minWidth) {
        width = minWidth;
        x = Math.round(xLeft) + 0.5 - minWidth / 2;
      }

      const y = grid.y + grid.height / 2 - tickHeightPx / 2;
      return {
        type: 'rect',
        shape: { x, y, width, height: tickHeightPx },
        style: { fill: style.color },
        emphasisDisabled: true,
        states: { emphasis: { style: { fill: style.color } } },
      };
    },
    tooltip: {
      ...makeTooltipConfig(TOOLTIP_BACKGROUNDS.variant),
      formatter: (rawParams) => {
        const params = rawParams as CallbackDataParams;
        return tooltipsByIndex[params.dataIndex] ?? '';
      },
    },
    z,
  };
}

export interface VariantGroupSeriesOptions {
  groups: VariantGroup[];
  tooltipFormatter: (group: VariantGroup) => string;
  xAxisIndex: number;
  yAxisIndex: number;
  z: number;
}

/**
 * Renders variant-group bubbles -- numbered rounded rectangles positioned just above the
 * bar (center -35%). Singleton groups (1 member) are skipped here -- callers route those
 * through `variantLineSeries` instead.
 */
export function variantGroupSeries(opts: VariantGroupSeriesOptions): CustomSeriesOption {
  const { groups, tooltipFormatter, xAxisIndex, yAxisIndex, z } = opts;
  const renderable = groups.filter((g) => g.members.length >= 2);
  const counts = renderable.map((g) => g.members.length);
  const tooltipsByIndex = renderable.map((g) => tooltipFormatter(g));
  const bubble = VARIANT_GROUP_BUBBLE_STYLE;

  return {
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    xAxisIndex,
    yAxisIndex,
    data: renderable.map((group) => [group.midpointBp, 50]),
    renderItem: (params, api) => {
      const grid = params.coordSys as unknown as GridCoordSys;
      const count = counts[params.dataIndex] ?? 0;
      const text = String(count);

      const [xCenter] = api.coord([api.value(0) as number, 50]);
      // Bubbles sit on the bar, centered vertically at the bar's center.
      const yCenter = grid.y + grid.height / 2;

      const textWidth = text.length * 8;
      const width = Math.max(bubble.height, textWidth + bubble.paddingX * 2);
      const height = bubble.height;
      const x = xCenter - width / 2;
      const y = yCenter - height / 2;

      return {
        type: 'group',
        emphasisDisabled: true,
        children: [
          {
            type: 'rect',
            shape: { x, y, width, height, r: bubble.cornerRadius },
            style: { fill: bubble.bgColor },
            emphasisDisabled: true,
            states: { emphasis: { style: { fill: bubble.bgColor } } },
          },
          {
            type: 'text',
            emphasisDisabled: true,
            style: {
              text,
              x: xCenter,
              y: yCenter,
              fill: bubble.textColor,
              fontSize: bubble.fontSize,
              fontWeight: bubble.fontWeight,
              fontFamily: FONT_FAMILY,
              textAlign: 'center',
              textVerticalAlign: 'middle',
            },
          },
        ],
      };
    },
    tooltip: {
      ...makeTooltipConfig(TOOLTIP_BACKGROUNDS.variant),
      formatter: (rawParams) => {
        const params = rawParams as CallbackDataParams;
        return tooltipsByIndex[params.dataIndex] ?? '';
      },
    },
    // Higher zlevel paints the bubble on a canvas above the default zlevel that
    // graphic.elements sit on, so the bubble renders ON TOP of variant badges
    // (which are graphic elements). Without this, badges occlude the count.
    zlevel: 1,
    z,
  };
}
