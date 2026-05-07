import type { CallbackDataParams } from 'echarts/types/dist/shared';
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

type GeneStructureTooltipItem =
  | TranscriptionStartSite
  | TranscriptionEndSite
  | Utr
  | Exon
  | Intron
  | Variant;

const GENE_STRUCTURE_LABELS: Record<GeneStructureTooltipItem['type'], string> = {
  'transcription-start-site': 'Transcription Start Site',
  'transcription-end-site': 'Transcription End Site',
  utr: 'UTR', // overridden below to include utrType prefix
  exon: 'Exon',
  intron: 'Intron',
  variant: 'Variant',
};

/**
 * Tooltip lines for any item shown on the gene-structure track. Every such
 * tooltip shares the same shape -- header line, type label, strand line, then
 * either a single `Loc:` line (for items with a `position`) or `Start:`/`End:`
 * lines (for items with a bp range).
 */
function geneStructureLines(
  item: GeneStructureTooltipItem,
  header: string,
  strand: Strand,
): string[] {
  const typeLabel = item.type === 'utr' ? `${item.utrType} UTR` : GENE_STRUCTURE_LABELS[item.type];
  const positionLines =
    'position' in item
      ? [`Loc: ${formatBp(item.position)}`]
      : [`Start: ${formatBp(item.start)}`, `End: ${formatBp(item.end)}`];
  return [header, typeLabel, `Strand: ${formatStrand(strand)}`, ...positionLines];
}

function variantLines(variant: Variant, context: TooltipContext): string[] {
  if (context.track === 'chromosome') {
    return [
      variant.variantId,
      `Chromosome ${context.chromosome}`,
      `Loc: ${formatBp(variant.start)}-${formatBp(variant.end)}`,
    ];
  }
  return geneStructureLines(variant, variant.variantId, context.strand);
}

export function formatIntronTooltip(intron: Intron, gene: string, strand: Strand): string {
  return geneStructureLines(intron, gene, strand).join('<br>');
}

export function formatGeneStructureItemTooltip(
  item: Exclude<GeneStructureItem, Variant>,
  gene: string,
  strand: Strand,
): string {
  return geneStructureLines(item, gene, strand).join('<br>');
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

/**
 * ECharts tooltip formatter that returns a precomputed HTML string by
 * `dataIndex`. Series builders precompute the array because the tooltip
 * formatter runs in an ECharts callback that doesn't carry the source item.
 */
export function tooltipFormatterByIndex(htmlByIndex: string[]) {
  return (rawParams: unknown): string => {
    const params = rawParams as CallbackDataParams;
    return htmlByIndex[params.dataIndex] ?? '';
  };
}
