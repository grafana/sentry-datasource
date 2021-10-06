import { e2e } from '@grafana/e2e';
import {
  selectDropdown,
  fillSentryConfigurationForm,
  variableEditorPreviewValuesCheck,
  e2eSelectors,
  PROVISIONING_FILENAME,
  SENTRY_ORGANIZATIONS_COUNT,
  SENTRY_E2E_ORGANIZATION_NAME,
  SENTRY_E2E_PROJECT_NAME,
  SENTRY_E2E_PRODUCTION_PROJECT_NAME,
  SENTRY_E2E_ENVIRONMENT_NAME,
  SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME,
  SENTRY_E2E_PROJECT_ID,
} from './00_utils';

e2e.scenario({
  describeName: 'Variables editor',
  itName: 'add and edit sentry variables',
  scenario: () => {
    e2e()
      .readProvisions([PROVISIONING_FILENAME])
      .then(([provision]) => {
        e2e.flows
          .addDataSource({
            type: 'Sentry',
            expectedAlertMessage: `plugin health check successful. ${SENTRY_ORGANIZATIONS_COUNT} organizations found.`,
            form: () => {
              fillSentryConfigurationForm(provision.datasources[0].secureJsonData.authToken, provision.datasources[0].jsonData.url);
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
              e2e.pages.Dashboard.Settings.Variables.Edit.General.generalNameInput().clear().type('variable1');
              e2e.pages.Dashboard.Settings.Variables.Edit.QueryVariable.queryOptionsDataSourceSelect()
                .click()
                .within(() => {
                  e2e.components.Select.input().should('be.visible').type(`${ds.config.name}{enter}`);
                });
              // Get list of organization
              selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Organizations');
              cy.wait(2 * 1000);
              variableEditorPreviewValuesCheck([SENTRY_E2E_ORGANIZATION_NAME]);
              // Get list of projects
              selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Projects');
              cy.wait(2 * 1000);
              selectDropdown(e2eSelectors.VariablesEditor.Organization.container.ariaLabel(), SENTRY_E2E_ORGANIZATION_NAME);
              cy.wait(2 * 1000);
              variableEditorPreviewValuesCheck([`${SENTRY_E2E_PROJECT_NAME} (${SENTRY_E2E_PROJECT_ID})`]);
              // Get list of environments
              selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Environments');
              cy.wait(2 * 1000);
              selectDropdown(e2eSelectors.VariablesEditor.Organization.container.ariaLabel(), SENTRY_E2E_ORGANIZATION_NAME);
              cy.wait(2 * 1000);
              variableEditorPreviewValuesCheck([SENTRY_E2E_ENVIRONMENT_NAME, SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME]);
              selectDropdown(e2eSelectors.VariablesEditor.Project.container.ariaLabel(), SENTRY_E2E_PROJECT_NAME);
              cy.wait(2 * 1000);
              variableEditorPreviewValuesCheck([SENTRY_E2E_ENVIRONMENT_NAME], [SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME]);
              selectDropdown(e2eSelectors.VariablesEditor.Project.container.ariaLabel(), SENTRY_E2E_PRODUCTION_PROJECT_NAME);
              cy.wait(2 * 1000);
              variableEditorPreviewValuesCheck([SENTRY_E2E_ENVIRONMENT_NAME, SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME]);
            });
          });
      });
  },
});
