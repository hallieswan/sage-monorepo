import type {
  Exon,
  GeneStructureItem,
  Intron,
  Strand,
  TranscriptionEndSite,
  TranscriptionStartSite,
  Utr,
  Variant,
} from '../models/locus-browser';

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatBp(value: number): string {
  return numberFormatter.format(value);
}

function formatStrand(strand: Strand): string {
  return strand.charAt(0).toUpperCase() + strand.slice(1);
}

export interface ChromosomeTooltipContext {
  track: 'chromosome';
  chromosome: string | number;
}

export interface GeneStructureTooltipContext {
  track: 'gene-structure';
  gene: string;
  strand: Strand;
}

export type TooltipContext = ChromosomeTooltipContext | GeneStructureTooltipContext;

function variantLines(variant: Variant, context: TooltipContext): string[] {
  if (context.track === 'chromosome') {
    return [
      variant.variantId,
      `Chromosome ${context.chromosome}`,
      `Loc: ${formatBp(variant.start)}-${formatBp(variant.end)}`,
    ];
  }
  return [
    variant.variantId,
    'Variant',
    `Start: ${formatBp(variant.start)}`,
    `End: ${formatBp(variant.end)}`,
  ];
}

function tssLines(tss: TranscriptionStartSite, gene: string, strand: Strand): string[] {
  return [
    gene,
    'Transcription Start Site',
    `Strand: ${formatStrand(strand)}`,
    `Loc: ${formatBp(tss.position)}`,
  ];
}

function tesLines(tes: TranscriptionEndSite, gene: string, strand: Strand): string[] {
  return [
    gene,
    'Transcription End Site',
    `Strand: ${formatStrand(strand)}`,
    `Loc: ${formatBp(tes.position)}`,
  ];
}

function utrLines(utr: Utr, gene: string): string[] {
  return [gene, `${utr.utrType} UTR`, `Start: ${formatBp(utr.start)}`, `End: ${formatBp(utr.end)}`];
}

function exonLines(exon: Exon, gene: string, strand: Strand): string[] {
  return [
    gene,
    'Exon',
    `Strand: ${formatStrand(strand)}`,
    `Start: ${formatBp(exon.start)}`,
    `End: ${formatBp(exon.end)}`,
  ];
}

function intronLines(intron: Intron, gene: string, strand: Strand): string[] {
  return [
    gene,
    'Intron',
    `Strand: ${formatStrand(strand)}`,
    `Start: ${formatBp(intron.start)}`,
    `End: ${formatBp(intron.end)}`,
  ];
}

/**
 * Returns the tooltip lines for a single non-variant gene-structure item. (Variants use
 * `formatVariantTooltip` since the chromosome / gene-structure templates differ.)
 */
export function formatGeneStructureItemLines(
  item: Exclude<GeneStructureItem, Variant>,
  gene: string,
  strand: Strand,
): string[] {
  switch (item.type) {
    case 'transcription-start-site':
      return tssLines(item, gene, strand);
    case 'transcription-end-site':
      return tesLines(item, gene, strand);
    case 'utr':
      return utrLines(item, gene);
    case 'exon':
      return exonLines(item, gene, strand);
  }
}

export function formatIntronTooltip(intron: Intron, gene: string, strand: Strand): string {
  return intronLines(intron, gene, strand).join('<br>');
}

export function formatGeneStructureItemTooltip(
  item: Exclude<GeneStructureItem, Variant>,
  gene: string,
  strand: Strand,
): string {
  return formatGeneStructureItemLines(item, gene, strand).join('<br>');
}

export function formatVariantTooltip(variant: Variant, context: TooltipContext): string {
  return variantLines(variant, context).join('<br>');
}

/**
 * Joins multiple variant tooltips (for a clustered group) with a blank line
 * between members. Each member shows the full per-variant template; no shared
 * header dedup -- the goal is consistency across members rather than brevity.
 */
export function formatVariantGroupTooltip(variants: Variant[], context: TooltipContext): string {
  return variants.map((v) => formatVariantTooltip(v, context)).join('<br><br>');
}
