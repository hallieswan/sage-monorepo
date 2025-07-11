import { modelMock } from '@sagebionetworks/model-ad/testing';
import { render, screen } from '@testing-library/angular';
import { ModelDetailsBoxplotsSelectorComponent } from './model-details-boxplots-selector.component';

async function setup(model = modelMock) {
  return render(ModelDetailsBoxplotsSelectorComponent, {
    imports: [],
    componentInputs: {
      model: model
    },
  });
}

describe('ModelDetailsBoxplotsSelectorComponent', () => {
  it('should render chart title', async () => {
    await setup();
    expect(screen.getByRole('heading', { level: 2, name: '4 months'})).toBeVisible();
  });
});
