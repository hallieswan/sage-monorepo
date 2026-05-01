import { Component, signal } from '@angular/core';
import {
  ChromosomeTrack,
  GeneStructureTrack,
  LocusBrowserChart,
  LocusBrowserSelection,
} from '@sagebionetworks/explorers/charts';
import { render, screen } from '@testing-library/angular';
import { LocusBrowserDirective } from './locus-browser.directive';

const chromosomeTrack: ChromosomeTrack = {
  chromosome: '11',
  range: { start: 75_000_000, end: 80_000_000 },
  items: [
    { type: 'gene-marker', position: 77_335_000, gene: 'PAK1' },
    { type: 'variant', start: 77_349_250, end: 77_349_252, variantId: 'rs73492057' },
  ],
};

const geneStructureTrack: GeneStructureTrack = {
  gene: 'PAK1',
  strand: 'positive',
  range: { start: 77_322_017, end: 77_455_937 },
  items: [
    { type: 'transcription-start-site', position: 77_322_017 },
    { type: 'utr', utrType: "5'", start: 77_322_017, end: 77_352_015 },
    { type: 'exon', start: 77_340_005, end: 77_349_448 },
    { type: 'variant', start: 77_349_250, end: 77_349_252, variantId: 'rs73492057' },
    { type: 'transcription-end-site', position: 77_455_937 },
  ],
};

const primarySelection: LocusBrowserSelection = { gene: 'PAK1', variantId: 'rs73492057' };

describe('LocusBrowserDirective', () => {
  it('renders no-data placeholder when both tracks are empty', async () => {
    @Component({
      imports: [LocusBrowserDirective],
      template: `
        <div
          sageLocusBrowser
          [chromosomeTrack]="chromosomeTrack"
          [geneStructureTrack]="geneStructureTrack"
          [primarySelection]="primarySelection"
        ></div>
      `,
    })
    class TestComponent {
      chromosomeTrack = { ...chromosomeTrack, items: [] };
      geneStructureTrack = { ...geneStructureTrack, items: [] };
      primarySelection = primarySelection;
    }

    await render(TestComponent);
    expect(screen.getByLabelText('No data is currently available.')).toBeVisible();
  });

  it('renders chart container with aria label when both tracks are populated', async () => {
    @Component({
      imports: [LocusBrowserDirective],
      template: `
        <div
          sageLocusBrowser
          [chromosomeTrack]="chromosomeTrack"
          [geneStructureTrack]="geneStructureTrack"
          [primarySelection]="primarySelection"
        ></div>
      `,
    })
    class TestComponent {
      chromosomeTrack = chromosomeTrack;
      geneStructureTrack = geneStructureTrack;
      primarySelection = primarySelection;
    }

    await render(TestComponent);
    const chart = document.querySelector('[aria-label]');
    expect(chart).not.toBeNull();
    expect(chart?.getAttribute('aria-label')).not.toBe('');
  });

  it('calls setOptions when an input changes', async () => {
    @Component({
      imports: [LocusBrowserDirective],
      template: `
        <div
          sageLocusBrowser
          [chromosomeTrack]="chromosomeTrack"
          [geneStructureTrack]="geneStructureTrack"
          [primarySelection]="primarySelection()"
        ></div>
      `,
    })
    class UpdatingTestComponent {
      chromosomeTrack = chromosomeTrack;
      geneStructureTrack = geneStructureTrack;
      primarySelection = signal<LocusBrowserSelection>(primarySelection);
    }

    const setOptionsSpy = jest.spyOn(LocusBrowserChart.prototype, 'setOptions');
    const { fixture } = await render(UpdatingTestComponent);
    setOptionsSpy.mockClear();

    fixture.componentInstance.primarySelection.set({ gene: 'PAK1', variantId: 'rsOther' });
    fixture.detectChanges();

    expect(setOptionsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        primarySelection: { gene: 'PAK1', variantId: 'rsOther' },
      }),
    );

    setOptionsSpy.mockRestore();
  });
});
