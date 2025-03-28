import { expect, test } from '@playwright/test';
import { baseURL } from '../playwright.config';
import { waitForSpinnerNotVisible } from './helpers/utils';

test.describe('specific viewport block', () => {
  test.slow();
  test.use({ viewport: { width: 1600, height: 1200 } });

  test('invalid gene results in a 404 redirect', async ({ page }) => {
    // go to invalid ENSG page
    await page.goto('/genes/ENSG00000000000');
    await waitForSpinnerNotVisible(page);

    // expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Page not found');

    // expect div for page not found content to be visible
    await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible();
  });

  test('consistency of change section heading is visible when using anchor link', async ({
    page,
  }) => {
    await page.goto('/genes/ENSG00000178209/evidence/rna#consistency-of-change');

    await waitForSpinnerNotVisible(page);

    const header = page.getByRole('heading', { name: 'Consistency of Change in Expression' });
    await expect(header).toBeInViewport();
  });
});

test.describe('legacy url redirects', () => {
  test('redirects to gene details', async ({ page }) => {
    await page.goto('/genes/(genes-router:gene-details/ENSG00000135940)');
    await expect(page).toHaveURL(`${baseURL}/genes/ENSG00000135940`);
  });
});
