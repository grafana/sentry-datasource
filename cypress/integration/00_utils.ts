import { e2e } from '@grafana/e2e';
import { selectors } from '../../src/selectors';

export const e2eSelectors = e2e.getSelectors(selectors.components);

export const PROVISIONING_FILENAME = 'datasources/grafana-sentry-datasource.yaml';
export const SENTRY_PROJECTS_COUNT = 6;
export const SENTRY_E2E_PROJECT_NAME = 'project-e2e';
export const SENTRY_E2E_PROJECT_ID = '5988308';
export const SENTRY_E2E_PRODUCTION_PROJECT_NAME = 'project-node';
export const SENTRY_E2E_ENVIRONMENT_NAME = 'e2e-only-environment';
export const SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME = `node-only-environment`;

export const openDashboardSettings = (sectionName = 'Variables') => {
  e2e.components.PageToolbar.item('Dashboard settings').click();
  cy.get('.dashboard-settings__aside').within(() => {
    cy.contains(sectionName).should('be.visible').click();
  });
};

export const selectDropdown = (container: Cypress.Chainable<JQuery<HTMLElement>>, text: string, wait = 0) => {
  container.within(() => e2e().get('[class$="-input-suffix"]').click());
  e2e.components.Select.option().should('be.visible').contains(text).click();
  if (wait > 0) {
    e2e().wait(wait);
  }
};

export const fillSentryConfigurationForm = (password: string, url?: string, orgSlug?: string) => {
  if (url) {
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().clear();
    e2eSelectors.ConfigEditor.SentrySettings.URL.ariaLabel().type(url);
  }
  if (orgSlug) {
    e2eSelectors.ConfigEditor.SentrySettings.OrgSlug.ariaLabel().clear();
    e2eSelectors.ConfigEditor.SentrySettings.OrgSlug.ariaLabel().type(orgSlug);
  }
  if (password) {
    e2eSelectors.ConfigEditor.SentrySettings.AuthToken.ariaLabel().type(password);
  }
};

export const variableEditorPreviewValuesCheck = (stringsShouldPresent: string[] = [], stringsShouldNotPresent: string[] = []) => {
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
