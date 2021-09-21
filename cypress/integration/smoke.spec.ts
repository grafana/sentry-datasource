import { e2e } from '@grafana/e2e';
import { selectors } from './../../src/selectors';

const e2eSelectors = e2e.getSelectors(selectors.components);
const PROVISIONING_FILENAME = 'datasources/grafana-sentry-datasource.yaml';

const fillConfigurationForm = (password: string, url?: string) => {
  if (url) {
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().clear();
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().type(url);
  }
  e2eSelectors.ConfigEditor.SentrySettings.AuthToken.ariaLabel().type(password);
};

e2e.scenario({
  describeName: 'Smoke tests',
  itName: 'Smoke tests',
  scenario: () => {
    e2e()
      .readProvisions([PROVISIONING_FILENAME])
      .then(([provision]) => {
        e2e.flows.addDataSource({
          type: 'Sentry',
          expectedAlertMessage: 'plugin health check successful',
          form: () => {
            fillConfigurationForm(provision.datasources[0].secureJsonData.authToken, provision.datasources[0].jsonData.url);
          },
        });
      });
  },
});

e2e.scenario({
  describeName: 'Invalid Configuration',
  itName: 'Invalid Configuration',
  scenario: () => {
    // Empty config should throw error
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: 'empty or invalid auth token found',
      form: () => {},
    });
    // TODO: This needs to be fixed after the implementation
    // Invalid auth token should throw error
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: 'plugin health check successful', // TODO: This needs to be fixed after the implementation
      form: () => {
        fillConfigurationForm('invalid-auth-token');
      },
    });
  },
});
