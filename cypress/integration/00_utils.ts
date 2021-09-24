import { e2e } from '@grafana/e2e';
import { selectors } from '../../src/selectors';

export const e2eSelectors = e2e.getSelectors(selectors.components);

export const PROVISIONING_FILENAME = 'datasources/grafana-sentry-datasource.yaml';
export const SENTRY_ORGANIZATIONS_COUNT = 3;
export const SENTRY_E2E_ORGANIZATION_NAME = 'E2E Organization';
export const SENTRY_E2E_PROJECT_NAME = 'e2e-project';
export const SENTRY_E2E_ENVIRONMENT_NAME = 'production';

export const selectDropdown = (container: Cypress.Chainable<JQuery<HTMLElement>>, text: string) => {
  container.within(() => {
    e2e.components.Select.input().first().should('be.empty').focus().type(`${text}{enter}`);
  });
};

export const fillSentryConfigurationForm = (password: string, url?: string) => {
  if (url) {
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().clear();
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().type(url);
  }
  e2eSelectors.ConfigEditor.SentrySettings.AuthToken.ariaLabel().type(password);
};
