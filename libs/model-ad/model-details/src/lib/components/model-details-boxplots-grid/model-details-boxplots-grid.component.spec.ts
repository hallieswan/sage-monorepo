import { modelMock } from '@sagebionetworks/model-ad/testing';
import { render, screen } from '@testing-library/angular';
import { ModelDetailsBoxplotsGridComponent } from './model-details-boxplots-grid.component';

const mockTitle = 'My Title';

async function setup(model = modelMock) {
  return render(ModelDetailsBoxplotsGridComponent, {
    imports: [],
    componentInputs: {
      modelDataList: [model.biomarkers[0], model.biomarkers[1], model.biomarkers[2]],
      sexes: ['Male', 'Female'],
      title: mockTitle,
    },
  });
}

describe('ModelDetailsBoxplotsGridComponent', () => {
  it('should render title', async () => {
    await setup();
    expect(screen.getByRole('heading', { level: 2, name: mockTitle })).toBeVisible();
  });
});
