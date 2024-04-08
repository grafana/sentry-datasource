import { expect, test } from '@grafana/plugin-e2e';
import { formatExpectError } from './errors';

const SENTRY_E2E_PROJECT_NAME = "project-002";
const SENTRY_E2E_PROJECT_ID = "proj002";

test.describe('Sentry variables', () => {
    test('add and edit variables', async ({ variableEditPage, page }) => {
        await variableEditPage.getByTestIdOrAriaLabel('Select a data source').fill("sentry");
        await page.keyboard.press('Enter');
        // await variableEditPage.datasource.set('Sentry');
        // await variableEditPage.getByTestIdOrAriaLabel('Select your sentry variable query type here').click();
        // await page.keyboard.press('Tab');
        // await variableEditPage.runQuery();
        // await expect(
        //     variableEditPage,
        //     formatExpectError('Expected variable edit page to display certain label names after query execution')
        // ).toDisplayPreviews([`${SENTRY_E2E_PROJECT_NAME} (${SENTRY_E2E_PROJECT_ID})`]);
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

