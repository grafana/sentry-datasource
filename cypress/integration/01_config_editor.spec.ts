import { e2e } from '@grafana/e2e';
import { fillSentryConfigurationForm, PLUGIN_NAME, SENTRY_ORG_SLUG, SENTRY_AUTH_TOKEN, SENTRY_PROJECTS_COUNT } from './00_utils';

describe('config editor', () => {
  beforeEach(() => e2e.flows.login(e2e.env('USERNAME'), e2e.env('PASSWORD')));
  it('empty configuration should throw valid error', () => {
    e2e.flows.addDataSource({
      type: PLUGIN_NAME,
      expectedAlertMessage: 'invalid or empty organization slug',
      form: () => {},
    });
  });
  it('empty auth token should throw invalid configuration error', () => {
    e2e.flows.addDataSource({
      type: PLUGIN_NAME,
      expectedAlertMessage: 'empty or invalid auth token found',
      form: () => fillSentryConfigurationForm('', '', SENTRY_ORG_SLUG),
    });
  });
  it('invalid auth token should throw 401 unauthorized error', () => {
    e2e.flows.addDataSource({
      type: PLUGIN_NAME,
      expectedAlertMessage: '401 Unauthorized Invalid token',
      form: () => fillSentryConfigurationForm('invalid-auth-token', '', SENTRY_ORG_SLUG),
    });
  });
  it('valid configuration should return valid health check', () => {
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: `plugin health check successful. ${SENTRY_PROJECTS_COUNT} projects found.`,
      form: () => fillSentryConfigurationForm(SENTRY_AUTH_TOKEN, 'https://sentry.io', SENTRY_ORG_SLUG),
    });
  });
});
