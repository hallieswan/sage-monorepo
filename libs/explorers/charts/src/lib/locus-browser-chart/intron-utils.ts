import type { GeneStructureItem, Intron } from '../models/locus-browser';

/**
 * Computes intron segments as the gaps between adjacent UTR/exon segments.
 *
 * Returns segments in the order they appear along the genome (by start). Edge-touching
 * segments produce no intron (gap of zero is filtered out). Variants and transcription
 * sites are ignored — only UTR + exon define gene structure for intron purposes.
 */
export function computeIntrons(items: GeneStructureItem[]): Intron[] {
  const structural = items
    .filter((i) => i.type === 'utr' || i.type === 'exon')
    .map((i) => ({ start: i.start, end: i.end }))
    .sort((a, b) => a.start - b.start);

  if (structural.length < 2) return [];

  const introns: Intron[] = [];
  let cursor = structural[0].end;

  for (let i = 1; i < structural.length; i++) {
    const segment = structural[i];
    if (segment.start > cursor) {
      introns.push({ type: 'intron', start: cursor, end: segment.start });
    }
    if (segment.end > cursor) cursor = segment.end;
  }

  return introns;
}
