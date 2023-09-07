import { e2e } from '@grafana/e2e';
import {
  selectDropdown,
  fillSentryConfigurationForm,
  variableEditorPreviewValuesCheck,
  e2eSelectors,
  PLUGIN_NAME,
  SENTRY_ORG_SLUG,
  SENTRY_AUTH_TOKEN,
  SENTRY_PROJECTS_COUNT,
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
    e2e.flows
      .addDataSource({
        type: PLUGIN_NAME,
        expectedAlertMessage: `plugin health check successful. ${SENTRY_PROJECTS_COUNT} projects found.`,
        form: () => fillSentryConfigurationForm(SENTRY_AUTH_TOKEN, 'https://sentry.io', SENTRY_ORG_SLUG),
      })
      .then((ds) => {
        e2e.flows.addDashboard().then(() => {
          e2e.components.PageToolbar.item('Dashboard settings').click();
          e2e.components.Tab.title('Variables').click();
          e2e.pages.Dashboard.Settings.Variables.List.addVariableCTAV2().click();
          e2e.pages.Dashboard.Settings.Variables.Edit.General.generalNameInput().clear().type('variable1');
          cy.wait(6 * 1000); // When clearing the variable name, the validation popup comes and hides the datasource picker. so wait sometime till the popup closes.
          selectDropdown(
            e2e.pages.Dashboard.Settings.Variables.Edit.QueryVariable.queryOptionsDataSourceSelect(),
            ds.config.name
          );
          // Get list of projects
          selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Projects');
          cy.wait(2 * 1000);
          variableEditorPreviewValuesCheck([`${SENTRY_E2E_PROJECT_NAME} (${SENTRY_E2E_PROJECT_ID})`]);
          // Get list of environments
          selectDropdown(e2eSelectors.VariablesEditor.QueryType.container.ariaLabel(), 'Environments');
          cy.wait(2 * 1000);
          variableEditorPreviewValuesCheck([SENTRY_E2E_ENVIRONMENT_NAME, SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME]);
          selectDropdown(e2eSelectors.VariablesEditor.Project.container.ariaLabel(), SENTRY_E2E_PROJECT_NAME);
          cy.wait(2 * 1000);
          variableEditorPreviewValuesCheck([SENTRY_E2E_ENVIRONMENT_NAME], [SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME]);
          selectDropdown(
            e2eSelectors.VariablesEditor.Project.container.ariaLabel(),
            SENTRY_E2E_PRODUCTION_PROJECT_NAME
          );
          cy.wait(2 * 1000);
          variableEditorPreviewValuesCheck([SENTRY_E2E_ENVIRONMENT_NAME, SENTRY_E2E_NODE_ONLY_ENVIRONMENT_NAME]);
        });
      });
  },
});
