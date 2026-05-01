import type { Variant } from '../models/locus-browser';

export interface VariantGroup {
  members: Variant[];
  midpointBp: number;
}

/**
 * Converts a list of variants to pixel-clustered groups. Members are clustered together
 * if their midpoint pixel distance falls within `thresholdPx`. Singletons (groups with
 * one member) are returned as well — callers split the resulting groups into "render as
 * singleton variant line" vs "render as numbered bubble".
 */
export function computeVariantGroups(
  variants: Variant[],
  bpToPixel: (bp: number) => number,
  thresholdPx: number,
): VariantGroup[] {
  if (!variants.length) return [];

  const sorted = [...variants].sort((a, b) => midpoint(a) - midpoint(b));
  const groups: VariantGroup[] = [];
  let current: Variant[] = [sorted[0]];
  let currentLastPx = bpToPixel(midpoint(sorted[0]));

  for (let i = 1; i < sorted.length; i++) {
    const variant = sorted[i];
    const px = bpToPixel(midpoint(variant));

    if (Math.abs(px - currentLastPx) <= thresholdPx) {
      current.push(variant);
    } else {
      groups.push(toGroup(current));
      current = [variant];
    }
    currentLastPx = px;
  }
  groups.push(toGroup(current));

  return groups;
}

export function midpoint(variant: Variant): number {
  return (variant.start + variant.end) / 2;
}

function toGroup(members: Variant[]): VariantGroup {
  const avg = members.reduce((acc, v) => acc + midpoint(v), 0) / members.length;
  return { members, midpointBp: avg };
}
