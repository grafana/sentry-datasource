import { e2e } from '@grafana/e2e';
import { selectors } from './../../src/selectors';

const e2eSelectors = e2e.getSelectors(selectors.components);
const PROVISIONING_FILENAME = 'datasources/grafana-sentry-datasource.yaml';
const SENTRY_ORGANIZATIONS_COUNT = 3;
const SENTRY_E2E_ORGANIZATION_NAME = 'E2E Organization';
const SENTRY_E2E_PROJECT_NAME = 'e2e-project';

const selectDropdown = (container: Cypress.Chainable<JQuery<HTMLElement>>, text: string) => {
  container.within(() => {
    e2e.components.Select.input().first().should('be.empty').focus().type(`${text}{enter}`);
  });
};

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
    // Empty config should throw error
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: 'empty or invalid auth token found',
      form: () => {},
    });
    // Invalid auth token should throw error
    e2e.flows.addDataSource({
      type: 'Sentry',
      expectedAlertMessage: '401 Unauthorized',
      form: () => {
        fillConfigurationForm('invalid-auth-token');
      },
    });
    // Valid configuration and variable editor
    e2e()
      .readProvisions([PROVISIONING_FILENAME])
      .then(([provision]) => {
        e2e.flows
          .addDataSource({
            type: 'Sentry',
            expectedAlertMessage: `plugin health check successful. ${SENTRY_ORGANIZATIONS_COUNT} organizations found.`,
            form: () => {
              fillConfigurationForm(provision.datasources[0].secureJsonData.authToken, provision.datasources[0].jsonData.url);
            },
          })
          .then((ds) => {
            e2e.flows.addDashboard().then(() => {
              e2e.components.PageToolbar.item('Dashboard settings').click();
              e2e.pages.Dashboard.Settings.General.sectionItems('Variables').click();
              e2e.pages.Dashboard.Settings.Variables.List.addVariableCTA().click();
              e2e.pages.Dashboard.Settings.Variables.Edit.General.generalTypeSelect()
                .should('be.visible')
                .within(() => {
                  e2e.components.Select.singleValue().should('have.text', 'Query').click();
                });
              e2e.pages.Dashboard.Settings.Variables.Edit.General.generalNameInput().clear().type('something');
              e2e.pages.Dashboard.Settings.Variables.Edit.QueryVariable.queryOptionsDataSourceSelect()
                .click()
                .within(() => {
                  e2e.components.Select.input().should('be.visible').type(`${ds.config.name}{enter}`);
                });
              selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Organizations');
              cy.wait(2 * 1000);
              e2e.pages.Dashboard.Settings.Variables.Edit.General.previewOfValuesOption()
                .should('exist')
                .within((previewOfValues) => {
                  expect(previewOfValues.text()).contains(SENTRY_E2E_ORGANIZATION_NAME);
                });
              selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Projects');
              cy.wait(2 * 1000);
              selectDropdown(e2eSelectors.VariablesEditor.Organization.container.ariaLabel(), SENTRY_E2E_ORGANIZATION_NAME);
              cy.wait(2 * 1000);
              e2e.pages.Dashboard.Settings.Variables.Edit.General.previewOfValuesOption()
                .should('exist')
                .within((previewOfValues) => {
                  expect(previewOfValues.text()).contains(SENTRY_E2E_PROJECT_NAME);
                });
            });
          });
      });
  },
});
