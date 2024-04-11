import { expect, test } from '@grafana/plugin-e2e';
import { formatExpectError } from './errors';
import { Components } from '../../src/selectors';

const SENTRY_ORG_SLUG = 'org-slug';
const SENTRY_AUTH_TOKEN = 'token';

test.describe('Test config editor', () => {
  test('empty configuration should throw valid error', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });

    await expect(configPage.saveAndTest()).not.toBeOK();
    await expect(page.getByTestId('data-testid Alert error')).toHaveText('invalid or empty organization slug');
  });

  test('empty auth token should throw valid error', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });
    await page.getByPlaceholder(Components.ConfigEditor.SentrySettings.OrgSlug.placeholder).fill(SENTRY_ORG_SLUG);

    await expect(configPage.saveAndTest()).not.toBeOK();
    await expect(page.getByTestId('data-testid Alert error')).toHaveText('empty or invalid auth token found');
});

  test('invalid auth token should throw valid error', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource', name: 'test-sentry-datasource' });
    await page.getByPlaceholder(Components.ConfigEditor.SentrySettings.OrgSlug.placeholder).fill(SENTRY_ORG_SLUG);
    await page.getByPlaceholder(Components.ConfigEditor.SentrySettings.AuthToken.placeholder).fill('invalid-auth-token');

    await expect(configPage.saveAndTest()).not.toBeOK();
  });

  test('valid configuration should return valid health check', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });
    configPage.mockHealthCheckResponse({ status: 200 });

    await page.getByPlaceholder(Components.ConfigEditor.SentrySettings.URL.placeholder).fill('https://sentry.io');
    await page.getByPlaceholder(Components.ConfigEditor.SentrySettings.OrgSlug.placeholder).fill(SENTRY_ORG_SLUG);
    await page.getByPlaceholder(Components.ConfigEditor.SentrySettings.AuthToken.placeholder).fill(SENTRY_AUTH_TOKEN);

    await expect(
        configPage.saveAndTest(),
        formatExpectError('Expected data source config to be successfully saved')
      ).toBeOK();
  });
});
