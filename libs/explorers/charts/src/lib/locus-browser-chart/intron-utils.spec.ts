import type { GeneStructureItem } from '../models/locus-browser';
import { computeIntrons } from './intron-utils';

describe('computeIntrons', () => {
  it('returns empty array when there are no structural items', () => {
    expect(computeIntrons([])).toEqual([]);
  });

  it('returns empty array with only one structural item', () => {
    const items: GeneStructureItem[] = [{ type: 'exon', start: 100, end: 200 }];
    expect(computeIntrons(items)).toEqual([]);
  });

  it('produces an intron between two non-touching exons', () => {
    const items: GeneStructureItem[] = [
      { type: 'exon', start: 100, end: 200 },
      { type: 'exon', start: 300, end: 400 },
    ];
    expect(computeIntrons(items)).toEqual([{ type: 'intron', start: 200, end: 300 }]);
  });

  it('produces no intron between edge-touching segments', () => {
    const items: GeneStructureItem[] = [
      { type: 'exon', start: 100, end: 200 },
      { type: 'utr', utrType: "3'", start: 200, end: 300 },
    ];
    expect(computeIntrons(items)).toEqual([]);
  });

  it('mixes UTR and exon when computing gaps', () => {
    const items: GeneStructureItem[] = [
      { type: 'utr', utrType: "5'", start: 0, end: 100 },
      { type: 'exon', start: 200, end: 300 },
      { type: 'utr', utrType: "3'", start: 400, end: 500 },
    ];
    expect(computeIntrons(items)).toEqual([
      { type: 'intron', start: 100, end: 200 },
      { type: 'intron', start: 300, end: 400 },
    ]);
  });

  it('ignores variants and transcription-start/end sites', () => {
    const items: GeneStructureItem[] = [
      { type: 'transcription-start-site', position: 100 },
      { type: 'exon', start: 100, end: 200 },
      { type: 'variant', start: 250, end: 252, variantId: 'rs1' },
      { type: 'exon', start: 300, end: 400 },
      { type: 'transcription-end-site', position: 400 },
    ];
    expect(computeIntrons(items)).toEqual([{ type: 'intron', start: 200, end: 300 }]);
  });

  it('handles overlapping segments by using the running max end as the cursor', () => {
    const items: GeneStructureItem[] = [
      { type: 'exon', start: 100, end: 350 },
      { type: 'exon', start: 200, end: 300 },
      { type: 'exon', start: 400, end: 500 },
    ];
    expect(computeIntrons(items)).toEqual([{ type: 'intron', start: 350, end: 400 }]);
  });

  it('does not require items to be pre-sorted', () => {
    const items: GeneStructureItem[] = [
      { type: 'exon', start: 300, end: 400 },
      { type: 'exon', start: 100, end: 200 },
    ];
    expect(computeIntrons(items)).toEqual([{ type: 'intron', start: 200, end: 300 }]);
  });
});
