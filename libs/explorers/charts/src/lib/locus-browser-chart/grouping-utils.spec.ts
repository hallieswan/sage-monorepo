import type { Variant } from '../models/locus-browser';
import { computeVariantGroups, midpoint } from './grouping-utils';

function v(id: string, start: number, end = start): Variant {
  return { type: 'variant', start, end, variantId: id };
}

describe('midpoint', () => {
  it('returns the midpoint of start and end', () => {
    expect(midpoint(v('rs1', 100, 200))).toBe(150);
  });

  it('handles single-bp variants', () => {
    expect(midpoint(v('rs1', 100, 100))).toBe(100);
  });
});

describe('computeVariantGroups', () => {
  // Identity bp-to-pixel mapping makes the threshold work in bp units.
  const identity = (bp: number) => bp;

  it('returns empty array for no variants', () => {
    expect(computeVariantGroups([], identity, 16)).toEqual([]);
  });

  it('returns a single singleton group for one variant', () => {
    const variants = [v('rs1', 100)];
    const groups = computeVariantGroups(variants, identity, 16);
    expect(groups).toHaveLength(1);
    expect(groups[0].members).toEqual(variants);
    expect(groups[0].midpointBp).toBe(100);
  });

  it('clusters variants whose pixel distance is within the threshold', () => {
    const variants = [v('a', 100), v('b', 110), v('c', 120)];
    const groups = computeVariantGroups(variants, identity, 16);
    expect(groups).toHaveLength(1);
    expect(groups[0].members.map((m) => m.variantId)).toEqual(['a', 'b', 'c']);
  });

  it('separates variants whose pixel distance exceeds the threshold', () => {
    const variants = [v('a', 100), v('b', 200)];
    const groups = computeVariantGroups(variants, identity, 16);
    expect(groups).toHaveLength(2);
    expect(groups[0].members.map((m) => m.variantId)).toEqual(['a']);
    expect(groups[1].members.map((m) => m.variantId)).toEqual(['b']);
  });

  it('uses the bpToPixel transform to determine clustering', () => {
    // Compressing bp space (200px per million bp) keeps adjacent variants within 20px,
    // so they cluster under the 25px threshold. Without using the transform, they'd be
    // 100,000 bp apart and never cluster.
    const compress = (bp: number) => bp * (200 / 1_000_000);
    const variants = [v('a', 100_000), v('b', 200_000), v('c', 300_000)];
    const groups = computeVariantGroups(variants, compress, 25);
    expect(groups).toHaveLength(1);
    expect(groups[0].members).toHaveLength(3);
  });

  it('keeps groups separated even when a later variant falls within the threshold of the previous group', () => {
    // Tests the chaining behavior: distance is to the *last* variant in the running group,
    // not to the first. So a, b cluster; c is too far from b → new group.
    const variants = [v('a', 100), v('b', 110), v('c', 130)];
    const groups = computeVariantGroups(variants, identity, 15);
    expect(groups).toHaveLength(2);
    expect(groups[0].members.map((m) => m.variantId)).toEqual(['a', 'b']);
    expect(groups[1].members.map((m) => m.variantId)).toEqual(['c']);
  });

  it('does not require pre-sorted input', () => {
    const variants = [v('c', 300), v('a', 100), v('b', 200)];
    const groups = computeVariantGroups(variants, identity, 150);
    // After sorting by midpoint: a, b, c. b is within 150 of a (within threshold) → group 1.
    // c is within 150 of b → group 1 grows.
    expect(groups).toHaveLength(1);
    expect(groups[0].members.map((m) => m.variantId)).toEqual(['a', 'b', 'c']);
  });

  it('computes group midpoint as the average of member midpoints', () => {
    const variants = [v('a', 100, 200), v('b', 200, 300)];
    const groups = computeVariantGroups(variants, identity, 1000);
    expect(groups[0].midpointBp).toBe(200);
  });
});
