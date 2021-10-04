import { E2ESelectors } from '@grafana/e2e-selectors';
import { DEFAULT_SENTRY_URL } from './types';

export const Components = {
  Common: {},
  ConfigEditor: {
    SentrySettings: {
      GroupTitle: 'Sentry Settings',
      URL: {
        label: 'Sentry URL',
        placeholder: DEFAULT_SENTRY_URL,
        ariaLabel: `Enter your Sentry URL here. Defaults to ${DEFAULT_SENTRY_URL}`,
        tooltip: `Sentry URL to be used. If left blank, ${DEFAULT_SENTRY_URL} will be used`,
      },
      AuthToken: {
        label: 'Sentry Auth Token',
        placeholder: 'Sentry Authentication Token',
        ariaLabel: `Enter your Sentry Auth token here.`,
        tooltip: `Sentry authentication token. Auth tokens can be created from ${DEFAULT_SENTRY_URL}/settings/account/api/auth-tokens/new-token/`,
        Reset: {
          label: `Reset`,
        },
      },
    },
  },
  QueryEditor: {
    QueryType: {
      label: 'Query Type',
      tooltip: 'Choose query type',
    },
    Scope: {
      Organization: {
        label: 'Organization',
        tooltip: 'Choose the sentry organization',
      },
      ProjectIDs: {
        label: 'Project IDs',
        tooltip: 'Optionally filter results by project IDs',
        placeholder: 'optional',
      },
      Environments: {
        label: 'Environments',
        tooltip: 'Optionally filter results by environment names',
        placeholder: 'optional',
      },
    },
    Issues: {
      Query: {
        label: 'Query',
        tooltip: 'Sentry query to filter the results',
        placeholder: 'is:unresolved',
      },
      Sort: {
        label: 'Sort By',
        tooltip: 'Sort results',
        placeholder: 'optional',
      },
      Limit: {
        label: 'Limit',
        tooltip: 'Number of results',
        placeholder: '100',
      },
    },
    Preview: {
      label: 'Query Preview',
      tooltip: 'JSON preview of the generated query schema',
    },
  },
  VariablesEditor: {
    QueryType: {
      label: 'Query Type',
      tooltip: 'Choose query type to get the relevant filters and results',
      container: {
        ariaLabel: 'Select your sentry variable query type here',
      },
    },
    Organization: {
      label: 'Organization',
      tooltip: 'Select the organization slug',
      container: {
        ariaLabel: 'Select the sentry organization here to see its projects',
      },
    },
    Project: {
      label: 'Project ID',
      tooltip: 'Select the project id',
      container: {
        ariaLabel: 'Select the sentry project here',
      },
    },
  },
};

export const selectors: { components: E2ESelectors<typeof Components> } = {
  components: Components,
};
