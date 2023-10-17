import { e2e } from '@grafana/e2e';
import { selectors } from '../../src/selectors';

export const e2eSelectors = e2e.getSelectors(selectors.components);

export const PLUGIN_NAME = 'Sentry';
export const SENTRY_ORG_SLUG = 'mock-org-slug';
export const SENTRY_AUTH_TOKEN = 'mock-token';
export const SENTRY_PROJECTS_COUNT = 6;
export const SENTRY_E2E_PROJECT_NAME = 'project-002';
export const SENTRY_E2E_PROJECT_ID = 'proj002';
export const SENTRY_E2E_PRODUCTION_PROJECT_NAME = 'project-004';
export const SENTRY_E2E_ENVIRONMENT_NAME = 'e2e-only-environment';
export const SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME = `node-only-environment`;

export const openDashboardSettings = (sectionName = 'Variables') => {
  e2e.components.PageToolbar.item('Dashboard settings').click();
  cy.get('.dashboard-settings__aside').within(() => {
    cy.contains(sectionName).should('be.visible').click();
  });
};

export const selectDropdown = (container: Cypress.Chainable<JQuery<HTMLElement>>, text: string, wait = 0) => {
  container.find('input').click();
  e2e.components.Select.option().should('be.visible').contains(text).click();
  if (wait > 0) {
    e2e().wait(wait);
  }
};

export const fillSentryConfigurationForm = (password: string, url?: string, orgSlug?: string) => {
  if (url) {
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().clear();
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().type(url).blur();
  }
  if (orgSlug) {
    e2eSelectors.ConfigEditor.SentrySettings.OrgSlug.ariaLabel().clear();
    e2eSelectors.ConfigEditor.SentrySettings.OrgSlug.ariaLabel().type(orgSlug).blur();
  }
  if (password) {
    e2eSelectors.ConfigEditor.SentrySettings.AuthToken.ariaLabel().type(password).blur();
  }
};

export const variableEditorPreviewValuesCheck = (
  stringsShouldPresent: string[] = [],
  stringsShouldNotPresent: string[] = []
) => {
  e2e.pages.Dashboard.Settings.Variables.Edit.General.previewOfValuesOption()
    .should('exist')
    .within((previewOfValues) => {
      stringsShouldPresent.forEach((s) => {
        expect(previewOfValues.text()).contains(s);
      });
      stringsShouldNotPresent.forEach((s) => {
        expect(previewOfValues.text()).not.contains(s);
      });
    });
};
