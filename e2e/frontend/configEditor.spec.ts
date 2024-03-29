import { expect, test } from '@grafana/plugin-e2e';

const SENTRY_ORG_SLUG = 'mock-org-slug';
const SENTRY_AUTH_TOKEN = 'mock-token';

test.describe('Test config editor', () => {
  test('empty configuration should throw valid error', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });

    await expect(configPage.saveAndTest()).not.toBeOK();
    await expect(page.getByTestId('data-testid Alert error')).toHaveText('invalid or empty organization slug');
  });

  test('empty auth token should throw valid error', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });
    await page.getByPlaceholder('Sentry org slug').fill(SENTRY_ORG_SLUG);

    await expect(configPage.saveAndTest()).not.toBeOK();
    await expect(page.getByTestId('data-testid Alert error')).toHaveText('empty or invalid auth token found');
  });

  test('invalid auth token should throw valid error', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });
    await page.getByPlaceholder('Sentry org slug').fill(SENTRY_ORG_SLUG);
    await page.getByPlaceholder('Sentry Authentication Token').fill('invalid-auth-token');

    await expect(configPage.saveAndTest()).not.toBeOK();
    await expect(page.getByTestId('data-testid Alert error')).toHaveText('Get \"https://sentry.io/api/0/organizations/mock-org-slug/projects/\": tls: failed to verify certificate: x509: OSStatus -26276');
  });

  test('valid configuration should return valid health check', async ({ createDataSourceConfigPage, page }) => {
    const configPage = await createDataSourceConfigPage({ type: 'grafana-sentry-datasource' });
    configPage.mockHealthCheckResponse({ status: 200 });
    
    await page.getByPlaceholder('https://sentry.io').fill('https://sentry.io');
    await page.getByPlaceholder('Sentry org slug').fill(SENTRY_ORG_SLUG);
    await page.getByPlaceholder('Sentry Authentication Token').fill(SENTRY_AUTH_TOKEN);

    await expect(configPage.saveAndTest()).toBeOK();
  });
});
