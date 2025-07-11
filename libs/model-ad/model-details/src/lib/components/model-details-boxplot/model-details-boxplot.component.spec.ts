import { modelMock } from '@sagebionetworks/model-ad/testing';
import { render, screen } from '@testing-library/angular';
import { ModelDetailsBoxplotComponent } from './model-details-boxplot.component';

async function setup(model = modelMock) {
  return render(ModelDetailsBoxplotComponent, {
    imports: [],
    componentInputs: {
      modelData: model.biomarkers[0],
      sexes: ['Male', 'Female'],
    },
  });
}

describe('ModelDetailsBoxplotComponent', () => {
  it('should render chart title', async () => {
    await setup();
    expect(screen.getByRole('heading', { level: 2, name: '4 months'})).toBeVisible();
  });
});
