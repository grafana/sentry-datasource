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
        tooltip: `Sentry Org slug. Typically this will be the last segment of the URL: https://sentry.io/organizations/{organization_slug}/ - only the slug should be entered here`,
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
    SecureSocksProxy: {
      label: 'Enable Secure Socks Proxy',
      tooltip: 'Enable proxying the datasource connection through the secure socks proxy to a different network.',
    },
  },
  QueryEditor: {
    QueryType: {
      label: 'Query Type',
      tooltip: 'Choose query type',
      placeholder: 'Required. Select query type',
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
        placeholder: 'Enter a Sentry query (run with Shift+Enter)',
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
    Events: {
      Query: {
        label: 'Query',
        tooltip: 'Sentry query to filter the results',
        placeholder: 'Enter a Sentry query (run with Shift+Enter)',
      },
      Sort: {
        label: 'Sort By',
        tooltip: 'Sort results',
        placeholder: 'Optional',
      },
      Limit: {
        label: 'Limit',
        tooltip: 'Number of results (100 max)',
        placeholder: '100',
      },
    },
    EventsStats: {
      Query: {
        label: 'Query',
        tooltip: 'Sentry query to filter the results',
        placeholder: 'Enter a Sentry query (run with Shift+Enter)',
      },
      YAxis: {
        label: 'Y-axis',
        tooltip: 'Choose what to plot in the y-axis. Required',
        placeholder: 'Required. Enter one or more fields to see the events (enter key to add)',
      },
      Groups: {
        label: 'Group',
        tooltip: 'Group your results by field or tag',
        placeholder: 'Optional. Enter one or more fields to group values (enter key to add)',
      },
      Sort: {
        label: 'Sort By',
        tooltip: 'Sort results',
        placeholder: 'Optional',
      },
      Limit: {
        label: 'Limit',
        tooltip: 'Number of results (10 max)',
        placeholder: '10',
      },
    },
    Metrics: {
      Field: {
        label: 'Field',
        tooltip: 'metrics field',
        placeholder: 'Required. Select one or more fields to see the metric',
      },
      Query: {
        label: 'Query',
        tooltip: 'Sentry query to filter the results',
        placeholder: 'Enter a Sentry query (run with Shift+Enter)',
      },
      GroupBy: {
        label: 'Group By',
        tooltip: 'group by',
        placeholder: 'Optional. Select the option to group the results',
      },
      Sort: {
        label: 'Sort By',
        tooltip: 'Sort results',
        placeholder: 'Optional',
      },
      Order: {
        label: 'Order',
        tooltip: 'Sort order',
        placeholder: 'Optional',
      },
      Limit: {
        label: 'Limit',
        tooltip: 'Number of results (10 max)',
        placeholder: '5',
      },
    },
    StatsV2: {
      Field: {
        label: 'Field',
        tooltip: 'stats field',
        placeholder: 'Required. Select one or more fields to see the stat',
      },
      GroupBy: {
        label: 'Group By',
        tooltip: 'group by',
        placeholder: 'Optional. Select the option to group the results',
      },
      Interval: {
        label: 'Interval',
        tooltip: 'interval',
        placeholder:
          'Optional. Enter the interval to group the results (expected format `[number][unit]` where unit is `m` for minutes, `h` for hours, `d` for days, or `w` for weeks)',
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
      id: 'data-testid variable-query-editor-query-type-select',
      selectorTestId: 'data-testid query-type-dropdown',
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
      id: 'data-testid variable-query-editor-team-select',
    },
    Project: {
      label: 'Project ID',
      tooltip: 'Select the project id',
      id: 'data-testid variable-query-editor-project-select',
    },
  },
};

export const selectors: { components: E2ESelectors<typeof Components> } = {
  components: Components,
};
