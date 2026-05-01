import {
  LocusBrowserProps,
  pak1LocusBrowserProps,
  tp53LocusBrowserProps,
} from '@sagebionetworks/explorers/charts';
import { Meta, StoryObj } from '@storybook/angular';
import { LocusBrowserDirective } from './locus-browser.directive';

const meta: Meta<LocusBrowserDirective> = {
  component: LocusBrowserDirective,
  title: 'directives/sageLocusBrowser',
  render: (args: LocusBrowserProps) => ({
    props: args,
    template: `<div
      sageLocusBrowser
      [chromosomeTrack]="chromosomeTrack"
      [geneStructureTrack]="geneStructureTrack"
      [primarySelection]="primarySelection"
      [secondarySelection]="secondarySelection"
      [highlightedGenes]="highlightedGenes"
      [groupingThresholdPx]="groupingThresholdPx"
      [noDataStyle]="noDataStyle"
    ></div>`,
  }),
};
export default meta;
type Story = StoryObj<LocusBrowserDirective>;

export const Pak1: Story = {
  args: pak1LocusBrowserProps,
};

export const Tp53NegativeStrand: Story = {
  args: tp53LocusBrowserProps,
};

export const NoData: Story = {
  args: {
    ...pak1LocusBrowserProps,
    chromosomeTrack: { ...pak1LocusBrowserProps.chromosomeTrack, items: [] },
    geneStructureTrack: { ...pak1LocusBrowserProps.geneStructureTrack, items: [] },
  },
};
