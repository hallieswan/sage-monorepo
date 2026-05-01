import type { LocusBrowserProps } from '../models/locus-browser';

// Gene markers in default state are spread across the chr11 view for visual
// density. PAK1 and LRRC32 are real chr11 genes; the other names are commonly
// used genomic illustrative genes whose real chromosomes differ from chr11
// (BRCA1/TP53 chr17, APOE chr19, AKT1 chr14, MTHFR/GBA chr1, VEGFA/HLA-DRB1
// chr6, PTEN/SIRT1 chr10, CDK2/KRAS chr12, MYC chr8, JAK2 chr9, MAPK1/COMT
// chr22, TNF chr6, BRAF chr7) -- positions here are mock display coordinates.

export const pak1LocusBrowserProps: LocusBrowserProps = {
  chromosomeTrack: {
    chromosome: '11',
    range: { start: 75_000_000, end: 80_000_000 },
    items: [
      { type: 'gene-marker', position: 75_150_000, gene: 'LRRC32' },
      { type: 'gene-marker', position: 75_400_000, gene: 'BRCA1' },
      { type: 'gene-marker', position: 75_650_000, gene: 'TP53' },
      { type: 'gene-marker', position: 75_900_000, gene: 'APOE' },
      { type: 'gene-marker', position: 76_150_000, gene: 'AKT1' },
      { type: 'gene-marker', position: 76_350_000, gene: 'MTHFR' },
      { type: 'gene-marker', position: 76_500_000, gene: 'TNF' },
      { type: 'gene-marker', position: 76_750_000, gene: 'VEGFA' },
      { type: 'gene-marker', position: 76_950_000, gene: 'PTEN' },
      { type: 'gene-marker', position: 77_150_000, gene: 'CDK2' },
      { type: 'gene-marker', position: 77_335_000, gene: 'PAK1' },
      { type: 'gene-marker', position: 77_550_000, gene: 'MYC' },
      { type: 'gene-marker', position: 77_800_000, gene: 'KRAS' },
      { type: 'gene-marker', position: 78_050_000, gene: 'JAK2' },
      { type: 'gene-marker', position: 78_300_000, gene: 'MAPK1' },
      { type: 'gene-marker', position: 78_550_000, gene: 'HLA-DRB1' },
      { type: 'gene-marker', position: 78_800_000, gene: 'SIRT1' },
      { type: 'gene-marker', position: 78_900_000, gene: 'BRAF' },
      // MET sits close to BRAF in bp space. Because the chart spreads labels
      // evenly along the chromosome, MET's label still gets its own slot at
      // the top -- the leader's diagonal angle bends sharply to reach it.
      { type: 'gene-marker', position: 78_960_000, gene: 'MET' },
      { type: 'gene-marker', position: 79_150_000, gene: 'COMT' },
      { type: 'gene-marker', position: 79_500_000, gene: 'GBA' },
      // Chromosome-wide variants outside PAK1 -- spread far apart so they render
      // as singletons rather than collapsing into the PAK1-region cluster.
      { type: 'variant', start: 75_280_000, end: 75_280_002, variantId: 'rs11111111' },
      { type: 'variant', start: 76_180_000, end: 76_180_005, variantId: 'rs22222222' },
      { type: 'variant', start: 78_400_000, end: 78_400_010, variantId: 'rs33333333' },
      { type: 'variant', start: 79_400_000, end: 79_400_005, variantId: 'rs44444444' },
      // PAK1-region variants (also appear on the gene-structure track).
      { type: 'variant', start: 77_318_500, end: 77_318_502, variantId: 'rs55512345' },
      { type: 'variant', start: 77_349_250, end: 77_349_252, variantId: 'rs73492057' },
      { type: 'variant', start: 77_355_000, end: 77_355_005, variantId: 'rs10000001' },
      { type: 'variant', start: 77_355_300, end: 77_355_305, variantId: 'rs10000002' },
      { type: 'variant', start: 77_355_600, end: 77_355_605, variantId: 'rs10000003' },
      { type: 'variant', start: 77_431_500, end: 77_431_510, variantId: 'rs8974679' },
    ],
  },
  // `range` omitted so the chart auto-pads the bounding box of structural
  // features by 5% each side. The rs55512345 variant sits in the regulatory
  // zone upstream of the TSS, demonstrating the buffer at the bar edges.
  geneStructureTrack: {
    gene: 'PAK1',
    strand: 'positive',
    items: [
      { type: 'transcription-start-site', position: 77_322_017 },
      { type: 'utr', utrType: "5'", start: 77_322_017, end: 77_340_005 },
      // Multiple exons across the gene body. Introns between them are computed
      // automatically from the gaps. The first exon spans the largest range
      // (covers the rs73492057 primary-selected variant); the rest are small
      // exons typical of a mid-sized human gene.
      { type: 'exon', start: 77_340_005, end: 77_349_448 },
      { type: 'exon', start: 77_354_000, end: 77_357_500 },
      { type: 'exon', start: 77_366_500, end: 77_370_000 },
      { type: 'exon', start: 77_383_500, end: 77_387_000 },
      { type: 'exon', start: 77_400_500, end: 77_404_000 },
      { type: 'exon', start: 77_416_500, end: 77_420_000 },
      { type: 'exon', start: 77_432_000, end: 77_435_500 },
      { type: 'variant', start: 77_318_500, end: 77_318_502, variantId: 'rs55512345' },
      { type: 'variant', start: 77_349_250, end: 77_349_252, variantId: 'rs73492057' },
      { type: 'variant', start: 77_355_000, end: 77_355_005, variantId: 'rs10000001' },
      { type: 'variant', start: 77_355_300, end: 77_355_305, variantId: 'rs10000002' },
      { type: 'variant', start: 77_355_600, end: 77_355_605, variantId: 'rs10000003' },
      { type: 'variant', start: 77_431_500, end: 77_431_510, variantId: 'rs8974679' },
      { type: 'utr', utrType: "3'", start: 77_440_148, end: 77_455_937 },
      { type: 'transcription-end-site', position: 77_455_937 },
    ],
  },
  primarySelection: { gene: 'PAK1', variantId: 'rs73492057' },
  secondarySelection: { gene: 'TNF', variantId: 'rs8974679' },
  highlightedGenes: ['BRAF'],
};

export const tp53LocusBrowserProps: LocusBrowserProps = {
  chromosomeTrack: {
    chromosome: '17',
    range: { start: 7_500_000, end: 7_900_000 },
    items: [
      { type: 'gene-marker', position: 7_680_000, gene: 'TP53' },
      { type: 'variant', start: 7_685_000, end: 7_685_005, variantId: 'rs17880604' },
    ],
  },
  geneStructureTrack: {
    gene: 'TP53',
    strand: 'negative',
    range: { start: 7_660_000, end: 7_700_000 },
    items: [
      { type: 'transcription-end-site', position: 7_660_000 },
      { type: 'utr', utrType: "3'", start: 7_660_000, end: 7_670_000 },
      { type: 'exon', start: 7_675_000, end: 7_690_000 },
      { type: 'variant', start: 7_685_000, end: 7_685_005, variantId: 'rs17880604' },
      { type: 'utr', utrType: "5'", start: 7_695_000, end: 7_700_000 },
      { type: 'transcription-start-site', position: 7_700_000 },
    ],
  },
  primarySelection: { gene: 'TP53', variantId: 'rs17880604' },
};
