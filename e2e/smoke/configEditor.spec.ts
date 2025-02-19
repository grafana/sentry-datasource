import { expect, test } from '@grafana/plugin-e2e';
import { Components } from '../../src/selectors';

test.describe('Create Sentry datasource - smoke', () => {
  test('renders the config editor', async ({ createDataSourceConfigPage, page, readProvisionedDataSource }) => {
    const configPage = await createDataSourceConfigPage({
      type: 'grafana-sentry-datasource',
    });

    await expect(page.getByTestId(Components.ConfigEditor.SentrySettings.URL.placeholder)).toBeVisible();
    await expect(page.getByTestId(Components.ConfigEditor.SentrySettings.OrgSlug.placeholder)).toBeVisible();
    await expect(page.getByTestId(Components.ConfigEditor.SentrySettings.AuthToken.placeholder)).toBeVisible();
  });
});
