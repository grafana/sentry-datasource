import { expect, test } from '@grafana/plugin-e2e';
import { formatExpectError } from './errors';
import { sentryCredentialsConfigured } from './helpers';
import { Components } from '../../src/selectors';
import { SentryConfig, SentrySecureConfig } from '../../src/types';

test.describe('Sentry variables', () => {
  test('add and edit variables', async ({ variableEditPage, page, readProvisionedDataSource, request }) => {
    // The Projects variable query hits the live Sentry API, so it needs working credentials.
    test.skip(
      !(await sentryCredentialsConfigured(request)),
      'Sentry credentials are not configured for the provisioned datasource'
    );
    const datasource = await readProvisionedDataSource<SentryConfig, SentrySecureConfig>({
      fileName: 'sentry.yaml',
    });
    await variableEditPage.datasource.set(datasource.name);
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
