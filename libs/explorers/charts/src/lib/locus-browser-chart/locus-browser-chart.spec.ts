import type { LocusBrowserProps } from '../models/locus-browser';
import { initChart, setNoDataOption } from '../utils';
import { LocusBrowserChart, resolveGeneStructureRange } from './locus-browser-chart';

jest.mock('../utils', () => ({
  initChart: jest.fn(),
  setNoDataOption: jest.fn(),
}));

const baseProps: LocusBrowserProps = {
  chromosomeTrack: {
    chromosome: '11',
    range: { start: 75_000_000, end: 80_000_000 },
    items: [
      { type: 'gene-marker', position: 77_335_000, gene: 'PAK1' },
      {
        type: 'variant',
        start: 77_349_250,
        end: 77_349_252,
        variantId: 'rs73492057',
      },
    ],
  },
  geneStructureTrack: {
    gene: 'PAK1',
    strand: 'positive',
    range: { start: 77_322_017, end: 77_455_937 },
    items: [
      { type: 'transcription-start-site', position: 77_322_017 },
      { type: 'utr', utrType: "5'", start: 77_322_017, end: 77_352_015 },
      { type: 'exon', start: 77_340_005, end: 77_349_448 },
      {
        type: 'variant',
        start: 77_349_250,
        end: 77_349_252,
        variantId: 'rs73492057',
      },
      { type: 'transcription-end-site', position: 77_455_937 },
    ],
  },
  primarySelection: { gene: 'PAK1', variantId: 'rs73492057' },
};

describe('resolveGeneStructureRange', () => {
  it('returns the explicit range when provided', () => {
    const range = resolveGeneStructureRange(baseProps.geneStructureTrack);
    expect(range).toEqual({ start: 77_322_017, end: 77_455_937 });
  });

  it('pads the non-variant bounding box by 5% each side when range is omitted', () => {
    const track = {
      ...baseProps.geneStructureTrack,
      range: undefined,
      items: [
        { type: 'exon' as const, start: 100, end: 200 },
        { type: 'exon' as const, start: 300, end: 400 },
      ],
    };
    const range = resolveGeneStructureRange(track);
    // span = 300; 5% pad = 15
    expect(range.start).toBeCloseTo(85, 5);
    expect(range.end).toBeCloseTo(415, 5);
  });

  it('excludes variants from the bounding box used for auto-padding', () => {
    const track = {
      ...baseProps.geneStructureTrack,
      range: undefined,
      items: [
        { type: 'exon' as const, start: 1000, end: 2000 },
        // a variant outside the exon range — must not affect the bounding box
        {
          type: 'variant' as const,
          start: 5000,
          end: 5005,
          variantId: 'rs1',
        },
      ],
    };
    const range = resolveGeneStructureRange(track);
    expect(range.start).toBeLessThan(1000);
    expect(range.end).toBeGreaterThan(2000);
    expect(range.end).toBeLessThan(5000);
  });

  it('uses TSS/TES point positions in the bounding box', () => {
    const track = {
      ...baseProps.geneStructureTrack,
      range: undefined,
      items: [
        { type: 'transcription-start-site' as const, position: 100 },
        { type: 'exon' as const, start: 150, end: 200 },
        { type: 'transcription-end-site' as const, position: 300 },
      ],
    };
    const range = resolveGeneStructureRange(track);
    // span = 200; 5% pad = 10
    expect(range.start).toBeCloseTo(90, 5);
    expect(range.end).toBeCloseTo(310, 5);
  });
});

const mockSetOption = jest.fn();
const mockDispose = jest.fn();
const mockOn = jest.fn();
const mockGetDom = jest.fn(() => ({ clientWidth: 800, clientHeight: 480 }));
const mockChart = {
  setOption: mockSetOption,
  dispose: mockDispose,
  on: mockOn,
  getDom: mockGetDom,
  resize: jest.fn(),
};

function makeChart(props: Partial<LocusBrowserProps> = {}) {
  return new LocusBrowserChart(document.createElement('div'), { ...baseProps, ...props });
}

describe('LocusBrowserChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (initChart as jest.Mock).mockReturnValue(mockChart);
  });

  it('initializes the chart at the configured initial height', () => {
    makeChart();
    // Height = top padding (300) + chrom grid (80) + bracket-zone (62) + gene grid (80) + bottom (30)
    expect(initChart).toHaveBeenCalledWith(expect.anything(), '490px');
  });

  it('disposes the chart on destroy', () => {
    makeChart().destroy();
    expect(mockDispose).toHaveBeenCalled();
  });

  it('subscribes to the chart finished event', () => {
    makeChart();
    expect(mockOn).toHaveBeenCalledWith('finished', expect.any(Function));
  });

  describe('empty-track no-data short-circuit', () => {
    it('renders no-data when chromosome track is empty', () => {
      makeChart({
        chromosomeTrack: { ...baseProps.chromosomeTrack, items: [] },
      });
      expect(setNoDataOption).toHaveBeenCalledWith(mockChart, 'textOnly');
      expect(mockSetOption).not.toHaveBeenCalled();
    });

    it('renders no-data when gene-structure track is empty', () => {
      makeChart({
        geneStructureTrack: { ...baseProps.geneStructureTrack, items: [] },
      });
      expect(setNoDataOption).toHaveBeenCalledWith(mockChart, 'textOnly');
      expect(mockSetOption).not.toHaveBeenCalled();
    });

    it('passes through custom noDataStyle when configured', () => {
      makeChart({
        chromosomeTrack: { ...baseProps.chromosomeTrack, items: [] },
        noDataStyle: 'grayBackground',
      });
      expect(setNoDataOption).toHaveBeenCalledWith(mockChart, 'grayBackground');
    });
  });

  describe('populated tracks', () => {
    it('calls chart.setOption with notMerge=true', () => {
      makeChart();
      expect(mockSetOption).toHaveBeenCalledWith(expect.anything(), true);
    });

    it('configures two grids', () => {
      makeChart();
      const option = mockSetOption.mock.calls[0][0];
      expect(option.grid).toHaveLength(2);
    });

    it('configures two value-type x-axes with the configured ranges', () => {
      makeChart();
      const option = mockSetOption.mock.calls[0][0];
      expect(option.xAxis[0]).toEqual(
        expect.objectContaining({
          min: baseProps.chromosomeTrack.range.start,
          max: baseProps.chromosomeTrack.range.end,
          gridIndex: 0,
        }),
      );
      expect(option.xAxis[1]).toEqual(
        expect.objectContaining({
          min: baseProps.geneStructureTrack.range?.start,
          max: baseProps.geneStructureTrack.range?.end,
          gridIndex: 1,
        }),
      );
    });

    it('renders 12 series (full per-track sequence)', () => {
      makeChart();
      const option = mockSetOption.mock.calls[0][0];
      expect(option.series).toHaveLength(12);
    });

    it('includes the three plan-specified track labels in the graphic component', () => {
      makeChart();
      const option = mockSetOption.mock.calls[0][0];
      const elements = option.graphic.elements;
      const texts = elements
        .filter((e: { type: string }) => e.type === 'text')
        .map((e: { style: { text: string } }) => e.style.text);
      // Chromosome track has both a sub-label ("Base pairs ...") and main label
      // ("Chromosome {chromosome}"). Gene-structure track has only the literal
      // "Gene Structure" main label per the plan's track-label table.
      expect(texts).toContain('Chromosome 11');
      expect(texts).toContain('Gene Structure');
      expect(texts).not.toContain('PAK1');
      expect(texts.some((t: string) => t.startsWith('Base pairs'))).toBe(true);
    });
  });
});
