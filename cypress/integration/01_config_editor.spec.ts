import { e2e } from '@grafana/e2e';
import { fillSentryConfigurationForm, PROVISIONING_FILENAME, SENTRY_PROJECTS_COUNT } from './00_utils';

describe('config editor', () => {
  beforeEach(() => e2e.flows.login(e2e.env('USERNAME'), e2e.env('PASSWORD')));
  it('empty configuration should throw valid error', () => {
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: 'invalid or empty organization slug',
      form: () => {},
    });
  });
  it('empty auth token should throw invalid configuration error', () => {
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: 'empty or invalid auth token found',
      form: () => {
        fillSentryConfigurationForm('', '', 'fake-org-slug');
      },
    });
  });
  it('invalid auth token should throw 401 unauthorized error', () => {
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: '401 Unauthorized Invalid token',
      form: () => {
        fillSentryConfigurationForm('invalid-auth-token', '', 'fake-org-slug');
      },
    });
  });
  it('valid configuration should return valid health check', () => {
    e2e()
      .readProvisions([PROVISIONING_FILENAME])
      .then(([provision]) => {
        e2e.flows.addDataSource({
          type: 'Sentry',
          expectedAlertMessage: `plugin health check successful. ${SENTRY_PROJECTS_COUNT} projects found.`,
          form: () => {
            fillSentryConfigurationForm(
              provision.datasources[0].secureJsonData.authToken,
              provision.datasources[0].jsonData.url,
              provision.datasources[0].jsonData.orgSlug
            );
          },
        });
      });
  });
});
