import { E2ESelectors } from '@grafana/e2e-selectors';
import { DEFAULT_SENTRY_URL } from './constants';

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
      OrgSlug: {
        label: 'Sentry Org',
        placeholder: 'Sentry org slug',
        ariaLabel: `Enter your Sentry Organization slug here`,
        tooltip: `Sentry Org slug. Typically this will be in the url https://sentry.io/organizations/{organization_slug}/`,
      },
      AuthToken: {
        label: 'Sentry Auth Token',
        placeholder: 'Sentry Authentication Token',
        ariaLabel: `Enter your Sentry Auth token here.`,
        tooltip: `Sentry authentication token. Auth tokens can be created from ${DEFAULT_SENTRY_URL}/settings/{organization_slug}/developer-settings`,
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
      placeholder: 'Query type',
    },
    Scope: {
      ProjectIDs: {
        label: 'Projects',
        tooltip: 'Optionally filter results by project IDs',
        placeholder: 'Optional',
      },
      Environments: {
        label: 'Environments',
        tooltip: 'Optionally filter results by environment names',
        placeholder: 'Optional',
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
        placeholder: 'Optional',
      },
      Limit: {
        label: 'Limit',
        tooltip: 'Number of results',
        placeholder: '100',
      },
    },
    StatsV2: {
      Field: {
        label: 'Field',
        tooltip: 'stats field',
        placeholder: 'Required',
      },
      GroupBy: {
        label: 'Group By',
        tooltip: 'group by',
        placeholder: 'Optional. Select the option to group the results',
      },
      Category: {
        label: 'Category Filter',
        tooltip: 'category filter. Required',
        placeholder: 'Required. Select category to filter results',
      },
      Outcome: {
        label: 'Outcome Filter',
        tooltip: 'outcome filter. Optional. Select one or more outcomes',
        placeholder: 'Optional. Select list of outcomes to filter results',
      },
      Reason: {
        label: 'Reason Filter',
        tooltip: 'Comma separated list of reasons to filter',
        placeholder: 'Optional. Comma separated list of reasons',
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
    Team: {
      label: 'Team slug',
      tooltip: 'Select the team slug',
      container: {
        ariaLabel: 'Select the sentry team slug here',
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
