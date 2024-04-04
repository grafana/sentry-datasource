import { expect, test } from '@grafana/plugin-e2e';

const SENTRY_LABELS = [];

test.describe('Sentry variables', () => {
    test('add and edit variables', async ({ variableEditPage, page }) => {
        variableEditPage.mockResourceResponse('api/v1/labels?*', SENTRY_LABELS);
        await variableEditPage.datasource.set('grafana-sentry-datasource');
        await variableEditPage.getByTestIdOrAriaLabel('Select your sentry variable query type here').click();
        await page.keyboard.press('Tab');
        await variableEditPage.runQuery();
    });
});

// sample test:

//   variableEditPage.mockResourceResponse('api/v1/labels?*', prometheusLabels);
//   await variableEditPage.datasource.set('gdev-prometheus');
//   await variableEditPage.getByTestIdOrAriaLabel('Query type').fill('Label names');
//   await page.keyboard.press('Tab');
//   await variableEditPage.runQuery();
//   await expect(
//     variableEditPage,
//     formatExpectError('Expected variable edit page to display certain label names after query execution')
//   ).toDisplayPreviews(prometheusLabels.data);

