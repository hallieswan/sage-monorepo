import {
  afterNextRender,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import {
  ChromosomeTrack,
  GeneStructureTrack,
  LocusBrowserChart,
  LocusBrowserProps,
  LocusBrowserSelection,
} from '@sagebionetworks/explorers/charts';

@Directive({
  selector: '[sageLocusBrowser]',
  standalone: true,
})
export class LocusBrowserDirective implements OnDestroy {
  private readonly el = inject(ElementRef);

  chromosomeTrack = input.required<ChromosomeTrack>();
  geneStructureTrack = input.required<GeneStructureTrack>();
  primarySelection = input.required<LocusBrowserSelection>();
  secondarySelection = input<LocusBrowserSelection>();
  highlightedGenes = input<string[]>();
  groupingThresholdPx = input<number>();
  noDataStyle = input<'textOnly' | 'grayBackground'>();

  private locusBrowser: LocusBrowserChart | undefined;

  private readonly props = computed<LocusBrowserProps>(() => ({
    chromosomeTrack: this.chromosomeTrack(),
    geneStructureTrack: this.geneStructureTrack(),
    primarySelection: this.primarySelection(),
    secondarySelection: this.secondarySelection(),
    highlightedGenes: this.highlightedGenes(),
    groupingThresholdPx: this.groupingThresholdPx(),
    noDataStyle: this.noDataStyle(),
  }));

  constructor() {
    afterNextRender(() => {
      this.locusBrowser = new LocusBrowserChart(this.el.nativeElement, this.props());
    });

    effect(() => {
      const currentProps = this.props();
      this.locusBrowser?.setOptions(currentProps);
    });
  }

  ngOnDestroy() {
    this.locusBrowser?.destroy();
  }
}
