import { expect, test } from '@grafana/plugin-e2e';
import { formatExpectError } from './errors';
import { Components } from '../../src/selectors';

test.describe('Sentry variables', () => {
  test('add and edit variables', async ({ variableEditPage, page }) => {
    await variableEditPage.datasource.set('grafana-sentry-datasource');
    await page.keyboard.press('Enter');
    await page.getByTestId(Components.VariablesEditor.QueryType.selectorTestId).getByRole('combobox').fill(`Projects`);
    await page.keyboard.press('Enter');
    await variableEditPage.runQuery();
    await expect(
      variableEditPage,
      formatExpectError('Expected variable edit page to display certain label names after query execution')
    ).toDisplayPreviews([]);
  });
});
