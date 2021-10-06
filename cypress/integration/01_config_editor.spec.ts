import { e2e } from '@grafana/e2e';
import { fillSentryConfigurationForm, PROVISIONING_FILENAME, SENTRY_ORGANIZATIONS_COUNT } from './00_utils';

describe('config editor', () => {
  beforeEach(() => e2e.flows.login(e2e.env('USERNAME'), e2e.env('PASSWORD')));
  it('empty configuration should throw valid error', () => {
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: 'empty or invalid auth token found',
      form: () => {},
    });
  });
  it('invalid configuration should throw valid error', () => {
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: '401 Unauthorized',
      form: () => {
        fillSentryConfigurationForm('invalid-auth-token');
      },
    });
  });
  it('valid configuration should return valid health check', () => {
    e2e()
      .readProvisions([PROVISIONING_FILENAME])
      .then(([provision]) => {
        e2e.flows.addDataSource({
          type: 'Sentry',
          expectedAlertMessage: `plugin health check successful. ${SENTRY_ORGANIZATIONS_COUNT} organizations found.`,
          form: () => {
            fillSentryConfigurationForm(provision.datasources[0].secureJsonData.authToken, provision.datasources[0].jsonData.url);
          },
        });
      });
  });
});
