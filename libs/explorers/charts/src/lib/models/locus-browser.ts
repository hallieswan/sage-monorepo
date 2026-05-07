interface RangeItem {
  tooltipHtml?: string;
  start: number;
  end: number;
}

interface PointItem {
  tooltipHtml?: string;
  position: number;
}

export interface Variant extends RangeItem {
  type: 'variant';
  variantId: string;
}

export interface Exon extends RangeItem {
  type: 'exon';
}

export interface Utr extends RangeItem {
  type: 'utr';
  utrType: "5'" | "3'";
}

export interface Intron extends RangeItem {
  type: 'intron';
}

export interface TranscriptionStartSite extends PointItem {
  type: 'transcription-start-site';
}

export interface TranscriptionEndSite extends PointItem {
  type: 'transcription-end-site';
}

export interface GeneMarker extends PointItem {
  type: 'gene-marker';
  gene: string;
  label?: string;
}

export type ChromosomeTrackItem = Variant | GeneMarker;
export type GeneStructureItem =
  | Exon
  | Utr
  | Variant
  | TranscriptionStartSite
  | TranscriptionEndSite;

export type Strand = 'positive' | 'negative';

export interface LocusBrowserSelection {
  gene: string;
  variantId: string;
}

export interface ChromosomeTrack {
  items: ChromosomeTrackItem[];
  range: { start: number; end: number };
  chromosome: string | number;
}

export interface GeneStructureTrack {
  items: GeneStructureItem[];
  range?: { start: number; end: number };
  strand: Strand;
  gene: string;
}

export interface LocusBrowserProps {
  chromosomeTrack: ChromosomeTrack;
  geneStructureTrack: GeneStructureTrack;
  primarySelection: LocusBrowserSelection;
  secondarySelection?: LocusBrowserSelection;
  highlightedGenes?: string[];
  groupingThresholdPx?: number;
  noDataStyle?: 'textOnly' | 'grayBackground';
}
