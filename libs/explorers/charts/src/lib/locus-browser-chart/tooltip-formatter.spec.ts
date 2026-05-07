import type {
  Exon,
  Intron,
  TranscriptionEndSite,
  TranscriptionStartSite,
  Utr,
  Variant,
} from '../models/locus-browser';
import {
  formatBp,
  formatGeneStructureItemTooltip,
  formatIntronTooltip,
  formatVariantGroupTooltip,
  formatVariantTooltip,
} from './tooltip-formatter';

describe('formatBp', () => {
  it('formats numbers with thousands separators', () => {
    expect(formatBp(78681195)).toBe('78,681,195');
    expect(formatBp(1000)).toBe('1,000');
    expect(formatBp(0)).toBe('0');
  });
});

describe('formatVariantTooltip', () => {
  const variant: Variant = {
    type: 'variant',
    start: 77349250,
    end: 77349252,
    variantId: 'rs73492057',
  };

  it('uses the chromosome template on the chromosome track', () => {
    const html = formatVariantTooltip(variant, { track: 'chromosome', chromosome: '11' });
    expect(html).toBe(['rs73492057', 'Chromosome 11', 'Loc: 77,349,250-77,349,252'].join('<br>'));
  });

  it('uses the gene-structure template on the gene-structure track', () => {
    const html = formatVariantTooltip(variant, {
      track: 'gene-structure',
      gene: 'PAK1',
      strand: 'positive',
    });
    expect(html).toBe(
      ['rs73492057', 'Variant', 'Strand: Positive', 'Start: 77,349,250', 'End: 77,349,252'].join(
        '<br>',
      ),
    );
  });
});

describe('formatVariantGroupTooltip', () => {
  const a: Variant = { type: 'variant', start: 100, end: 200, variantId: 'rs1' };
  const b: Variant = { type: 'variant', start: 300, end: 400, variantId: 'rs2' };

  it('returns empty string for no members', () => {
    expect(formatVariantGroupTooltip([], { track: 'chromosome', chromosome: '11' })).toBe('');
  });

  it('falls back to a single tooltip when given one member', () => {
    expect(formatVariantGroupTooltip([a], { track: 'chromosome', chromosome: '11' })).toBe(
      formatVariantTooltip(a, { track: 'chromosome', chromosome: '11' }),
    );
  });

  it('repeats the full template for each member on the chromosome track', () => {
    const html = formatVariantGroupTooltip([a, b], { track: 'chromosome', chromosome: '11' });
    // Shared header repeats per member -- no deduplication.
    expect(html.match(/Chromosome 11/g)).toHaveLength(2);
    expect(html).toContain('rs1');
    expect(html).toContain('rs2');
    expect(html).toContain('Loc: 100-200');
    expect(html).toContain('Loc: 300-400');
    // Members separated by a blank line (two consecutive <br>s).
    expect(html).toContain('<br><br>');
  });

  it('repeats the full template for each member on the gene-structure track', () => {
    const html = formatVariantGroupTooltip([a, b], {
      track: 'gene-structure',
      gene: 'PAK1',
      strand: 'positive',
    });
    // "Variant" header repeats per member.
    expect(html.match(/Variant/g)).toHaveLength(2);
    expect(html).toContain('rs1');
    expect(html).toContain('rs2');
    expect(html).toContain('Start: 100');
    expect(html).toContain('Start: 300');
  });
});

describe('formatGeneStructureItemTooltip', () => {
  it('formats a TSS', () => {
    const tss: TranscriptionStartSite = { type: 'transcription-start-site', position: 77322017 };
    expect(formatGeneStructureItemTooltip(tss, 'PAK1', 'positive')).toBe(
      ['PAK1', 'Transcription Start Site', 'Strand: Positive', 'Loc: 77,322,017'].join('<br>'),
    );
  });

  it('formats a TES', () => {
    const tes: TranscriptionEndSite = { type: 'transcription-end-site', position: 77455937 };
    expect(formatGeneStructureItemTooltip(tes, 'PAK1', 'positive')).toBe(
      ['PAK1', 'Transcription End Site', 'Strand: Positive', 'Loc: 77,455,937'].join('<br>'),
    );
  });

  it('formats a UTR with utrType and strand', () => {
    const utr: Utr = { type: 'utr', utrType: "5'", start: 77322017, end: 77352015 };
    expect(formatGeneStructureItemTooltip(utr, 'PAK1', 'positive')).toBe(
      ['PAK1', "5' UTR", 'Strand: Positive', 'Start: 77,322,017', 'End: 77,352,015'].join('<br>'),
    );
  });

  it('formats an exon', () => {
    const exon: Exon = { type: 'exon', start: 77340005, end: 77349448 };
    expect(formatGeneStructureItemTooltip(exon, 'PAK1', 'positive')).toBe(
      ['PAK1', 'Exon', 'Strand: Positive', 'Start: 77,340,005', 'End: 77,349,448'].join('<br>'),
    );
  });
});

describe('formatIntronTooltip', () => {
  it('formats an intron with strand', () => {
    const intron: Intron = { type: 'intron', start: 77349448, end: 77440148 };
    expect(formatIntronTooltip(intron, 'PAK1', 'positive')).toBe(
      ['PAK1', 'Intron', 'Strand: Positive', 'Start: 77,349,448', 'End: 77,440,148'].join('<br>'),
    );
  });
});
