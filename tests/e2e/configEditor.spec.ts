import { expect, test } from '@grafana/plugin-e2e';
import { formatExpectError } from './errors';
import { PLUGIN_ID, PROVISIONED_UID, sentryCredentialsConfigured } from './helpers';
import { Components } from '../../src/selectors';
import { SentryConfig, SentrySecureConfig } from '../../src/types';

const { URL, OrgSlug, AuthToken, GroupTitle } = Components.ConfigEditor.SentrySettings;

const HEALTH_CHECK_OK = /plugin health check successful/;

test.describe('Config editor', () => {
  test.describe('rendering', () => {
    test('smoke: should render config editor', { tag: '@plugins' }, async ({ createDataSourceConfigPage, page }) => {
      await createDataSourceConfigPage({ type: PLUGIN_ID });

      await expect(page.getByPlaceholder(URL.placeholder)).toBeVisible();
      await expect(page.getByPlaceholder(OrgSlug.placeholder)).toBeVisible();
      await expect(page.getByPlaceholder(AuthToken.placeholder)).toBeVisible();
    });

    test('should render the Sentry Settings section', async ({ createDataSourceConfigPage, page }) => {
      await createDataSourceConfigPage({ type: PLUGIN_ID });

      await expect(page.getByRole('heading', { name: GroupTitle })).toBeVisible();
      await expect(page.getByText(`${URL.label} *`, { exact: true })).toBeVisible();
      await expect(page.getByText(`${OrgSlug.label} *`, { exact: true })).toBeVisible();
      await expect(page.getByText(`${AuthToken.label} *`, { exact: true })).toBeVisible();
    });

    test('should render the additional settings section', async ({ createDataSourceConfigPage, page }) => {
      await createDataSourceConfigPage({ type: PLUGIN_ID });

      await expect(page.getByRole('heading', { name: 'Additional settings' })).toBeVisible();
      await expect(page.getByText(Components.ConfigEditor.TLSSkipVerify.label).first()).toBeVisible();
    });
  });

  test.describe('provisioned datasource', () => {
    test('should load the provisioned connection settings', async ({
      readProvisionedDataSource,
      gotoDataSourceConfigPage,
      page,
    }) => {
      const datasource = await readProvisionedDataSource<SentryConfig, SentrySecureConfig>({
        fileName: 'sentry.yaml',
      });
      await gotoDataSourceConfigPage(datasource.uid);

      await expect(page.getByPlaceholder(URL.placeholder)).toHaveValue(datasource.jsonData.url);
      // The org slug and auth token are provisioned from environment variables, so only assert
      // that the fields rendered: the token field shows a Reset button once a token has been
      // provisioned, and the plain input otherwise.
      await expect(page.getByPlaceholder(OrgSlug.placeholder)).toBeVisible();
      await expect(
        page.getByRole('button', { name: AuthToken.Reset.label }).or(page.getByPlaceholder(AuthToken.placeholder))
      ).toBeVisible();
    });
  });

  test.describe('save & test', () => {
    test('should pass the health check for the provisioned datasource', async ({
      gotoDataSourceConfigPage,
      page,
      request,
    }) => {
      test.skip(
        !(await sentryCredentialsConfigured(request)),
        'Sentry credentials are not configured for the provisioned datasource'
      );
      await gotoDataSourceConfigPage(PROVISIONED_UID);

      // Match either label so the test works whether the datasource is provisioned with
      // editable true (Save & test) or false (Test).
      await page.getByRole('button', { name: /^(Save & test|Test)$/ }).click();
      await expect(
        page.getByText(HEALTH_CHECK_OK),
        formatExpectError('Expected the provisioned datasource to pass its health check')
      ).toBeVisible();
    });

    test('should show an error when the organization slug is missing', async ({
      createDataSourceConfigPage,
      page,
    }) => {
      const configPage = await createDataSourceConfigPage({ type: PLUGIN_ID });

      await expect(configPage.saveAndTest()).not.toBeOK();
      await expect(page.getByTestId('data-testid Alert error')).toHaveText('invalid or empty organization slug');
    });

    test('should show an error when the auth token is missing', async ({ createDataSourceConfigPage, page }) => {
      const configPage = await createDataSourceConfigPage({ type: PLUGIN_ID });
      await page.getByPlaceholder(OrgSlug.placeholder).fill('some-org');

      await expect(configPage.saveAndTest()).not.toBeOK();
      await expect(page.getByTestId('data-testid Alert error')).toHaveText('empty or invalid auth token found');
    });

    test('should show an error alert when the health check fails', async ({ createDataSourceConfigPage, page }) => {
      const configPage = await createDataSourceConfigPage({ type: PLUGIN_ID });
      await page.getByPlaceholder(OrgSlug.placeholder).fill('some-org');
      await page.getByPlaceholder(AuthToken.placeholder).fill('some-token');
      await configPage.mockHealthCheckResponse({ status: 'ERROR', message: 'mocked health check failure' }, 400);

      await expect(configPage.saveAndTest()).not.toBeOK();
      await expect(page.getByTestId('data-testid Alert error')).toHaveText('mocked health check failure');
    });

    test('should show an error alert when the Sentry API is unreachable', async ({
      createDataSourceConfigPage,
      page,
    }) => {
      const configPage = await createDataSourceConfigPage({ type: PLUGIN_ID });
      await page.getByPlaceholder(URL.placeholder).fill('http://127.0.0.1:1');
      await page.getByPlaceholder(OrgSlug.placeholder).fill('some-org');
      await page.getByPlaceholder(AuthToken.placeholder).fill('some-token');

      await expect(configPage.saveAndTest()).not.toBeOK();
      await expect(page.getByTestId('data-testid Alert error')).toBeVisible();
    });
  });
});
