import { expect, test } from '@grafana/plugin-e2e';
import {
  exploreUrl,
  PLUGIN_ID,
  queryEditorRow,
  sentryCredentialsConfigured,
  waitForQueryDataResponseWithBody,
} from './helpers';
import { Components } from '../../src/selectors';

const QUERY_TYPE_OPTIONS = [
  'Issues',
  'Events',
  'Events Stats',
  'Stats',
  'Spans',
  'Spans Stats',
  'Release Health (Sessions)',
];

// One entry per query type: the query model encoded in the Explore panes URL, and the field
// labels the editor should (and should not) render for that mode. Encoding the query type in
// the URL is reliable for this plugin, verified against the live UI.
const MODES = [
  {
    name: 'Issues',
    query: { queryType: 'issues', issuesQuery: '' },
    visible: ['Query', 'Sort By', 'Limit'],
  },
  {
    name: 'Events',
    query: { queryType: 'events', eventsQuery: '' },
    visible: ['Fields', 'Query', 'Dataset', 'Sort By', 'Limit'],
  },
  {
    name: 'Events Stats',
    query: { queryType: 'eventsStats', eventsStatsYAxis: ['count()'], eventsStatsQuery: '', eventsStatsGroups: [] },
    visible: ['Y-axis', 'Query', 'Group', 'Sort By', 'Limit'],
  },
  {
    name: 'Stats',
    query: {
      queryType: 'statsV2',
      statsFields: ['sum(quantity)'],
      statsCategory: ['error'],
      statsGroupBy: [],
      statsOutcome: [],
      statsReason: [],
    },
    visible: ['Field', 'Category Filter', 'Outcome Filter', 'Reason Filter', 'Group By', 'Interval'],
    hidden: [Components.QueryEditor.Scope.Environments.label],
  },
  {
    name: 'Spans',
    query: { queryType: 'spans', eventsQuery: '' },
    visible: ['Fields', 'Query', 'Sort By', 'Limit'],
    hidden: ['Dataset'],
  },
  {
    name: 'Spans Stats',
    query: { queryType: 'spansStats', eventsStatsYAxis: ['count()'], eventsStatsQuery: '', eventsStatsGroups: [] },
    visible: ['Y-axis', 'Query', 'Group', 'Sort By', 'Limit'],
  },
  {
    name: 'Release Health (Sessions)',
    query: { queryType: 'metrics', metricsField: 'sum(session)', metricsQuery: '' },
    visible: ['Field', 'Query', 'Group By'],
  },
];

test.describe('Query editor', () => {
  // The query editor requires a non-empty org slug to render anything (SentryQueryEditor bails
  // out with an error otherwise), so these tests create a throwaway datasource with dummy
  // connection details rather than depending on the provisioned datasource's credentials.
  // Queries fired against it fail, which is fine: these tests only assert on the editor UI and
  // on the outgoing query model.
  let uid: string;

  test.beforeEach(async ({ createDataSource }) => {
    const datasource = await createDataSource({
      type: PLUGIN_ID,
      jsonData: { url: 'https://sentry.io', orgSlug: 'dummy-org' },
      secureJsonData: { authToken: 'dummy-token' },
    });
    uid = datasource.uid;
  });

  test.afterEach(async ({ request }) => {
    await request.delete(`/api/datasources/uid/${uid}`);
  });

  test.describe('rendering', () => {
    test('smoke: should render all query type options', { tag: '@plugins' }, async ({ page }) => {
      await page.goto(exploreUrl({}, uid));

      // The query type select renders its placeholder as text rather than as an input
      // placeholder, so target the first combobox in the editor row (Query Type).
      await queryEditorRow(page).getByRole('combobox').first().click();
      // TODO(grafana-10): Grafana 10.x sets aria-label "Select option" on every option, which
      // overrides the accessible name, so assert on option text (full set, in order) instead.
      // Revert to getByRole('option', { name, exact: true }) per option once Grafana 10 support
      // is dropped in https://github.com/grafana/sentry-datasource/pull/724.
      await expect(page.getByRole('listbox').getByRole('option')).toHaveText(QUERY_TYPE_OPTIONS);
    });

    test('should render the scope fields in the default state', async ({ page }) => {
      await page.goto(exploreUrl({}, uid));

      const row = queryEditorRow(page);
      await expect(row.getByText('Query Type', { exact: true })).toBeVisible();
      await expect(row.getByText(Components.QueryEditor.Scope.ProjectIDs.label, { exact: true })).toBeVisible();
      await expect(row.getByText(Components.QueryEditor.Scope.Environments.label, { exact: true })).toBeVisible();
    });

    for (const mode of MODES) {
      test(`should render the ${mode.name} editor`, async ({ page }) => {
        await page.goto(exploreUrl(mode.query, uid));

        const row = queryEditorRow(page);
        for (const label of mode.visible) {
          await expect(row.getByText(label, { exact: true })).toBeVisible();
        }
        for (const label of mode.hidden ?? []) {
          await expect(row.getByText(label, { exact: true })).toBeHidden();
        }
      });
    }
  });

  test.describe('query model', () => {
    test('should send the query type and options encoded in the URL', async ({ page }) => {
      // Mock the query endpoint so this test runs without Sentry credentials.
      let requestBody: { queries?: Array<Record<string, unknown>> } | undefined;
      await page.route('**/api/ds/query*', async (route) => {
        requestBody = route.request().postDataJSON();
        await route.fulfill({ json: { results: { A: { status: 200, frames: [] } } } });
      });

      await page.goto(
        exploreUrl(
          {
            queryType: 'eventsStats',
            eventsStatsYAxis: ['count()'],
            eventsStatsQuery: 'level:error',
            eventsStatsGroups: [],
          },
          uid
        )
      );
      await expect.poll(() => requestBody).toBeDefined();

      const query = requestBody?.queries?.[0] ?? {};
      expect(query.queryType).toBe('eventsStats');
      expect(query.eventsStatsYAxis).toEqual(['count()']);
      expect(query.eventsStatsQuery).toBe('level:error');
    });
  });
});

test.describe('Query editor with live Sentry data', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    test.skip(
      !(await sentryCredentialsConfigured(request)),
      'Sentry credentials are not configured for the provisioned datasource'
    );
  });

  test('Events Stats: count() returns a time series', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(
      exploreUrl({
        queryType: 'eventsStats',
        eventsStatsYAxis: ['count()'],
        eventsStatsQuery: '',
        eventsStatsGroups: [],
      })
    );
    await responsePromise;

    const frames = getBody()?.results?.A?.frames ?? [];
    expect(frames.length).toBeGreaterThan(0);
    expect(frames[0].data?.values?.[0]?.length ?? 0).toBeGreaterThan(0);
  });

  test('Stats: sum(quantity) for errors returns a time series', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(
      exploreUrl({
        queryType: 'statsV2',
        statsFields: ['sum(quantity)'],
        statsCategory: ['error'],
        statsGroupBy: [],
        statsOutcome: [],
        statsReason: [],
      })
    );
    await responsePromise;

    const frames = getBody()?.results?.A?.frames ?? [];
    expect(frames.length).toBeGreaterThan(0);
    expect(frames[0].data?.values?.[0]?.length ?? 0).toBeGreaterThan(0);
  });

  test('Events: returns a table of events', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(exploreUrl({ queryType: 'events', eventsQuery: '' }));
    await responsePromise;

    const frames = getBody()?.results?.A?.frames ?? [];
    expect(frames.length).toBeGreaterThan(0);
    const fieldNames = frames[0].schema?.fields?.map((field) => field.name) ?? [];
    expect(fieldNames).toEqual(expect.arrayContaining(['id', 'title']));
    expect(frames[0].data?.values?.[0]?.length ?? 0).toBeGreaterThan(0);
  });

  test('Release Health (Sessions): sum(session) returns a time series', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(exploreUrl({ queryType: 'metrics', metricsField: 'sum(session)', metricsQuery: '' }));
    await responsePromise;

    const frames = getBody()?.results?.A?.frames ?? [];
    expect(frames.length).toBeGreaterThan(0);
    expect(frames[0].data?.values?.[0]?.length ?? 0).toBeGreaterThan(0);
  });

  test('Events: dataset=errors returns a table of events', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(exploreUrl({ queryType: 'events', eventsQuery: '', eventsDataset: 'errors' }));
    await responsePromise;

    expect(getBody()?.results?.A?.status).toBe(200);
    const frames = getBody()?.results?.A?.frames ?? [];
    expect(frames.length).toBeGreaterThan(0);
    // Assert the dataset was actually sent to Sentry rather than silently dropped.
    expect(frames[0].schema?.meta?.executedQueryString).toContain('dataset=errors');
  });

  test('Events Stats: grouped count() by release returns a time series per group', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(
      exploreUrl({
        queryType: 'eventsStats',
        eventsStatsYAxis: ['count()'],
        eventsStatsQuery: '',
        eventsStatsGroups: ['release'],
        eventsStatsSort: '-count()',
        eventsStatsLimit: 5,
      })
    );
    await responsePromise;

    const frames = getBody()?.results?.A?.frames ?? [];
    expect(frames.length).toBeGreaterThan(0);
    expect(frames[0].data?.values?.[0]?.length ?? 0).toBeGreaterThan(0);
    // Grouped queries temporarily use the legacy events-stats endpoint; see
    // pkg/sentry/events_stats_legacy.go for the rationale and removal condition.
    expect(frames[0].schema?.meta?.executedQueryString).toContain('/events-stats/');
  });

  test('Issues: query succeeds', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(exploreUrl({ queryType: 'issues', issuesQuery: '' }));
    await responsePromise;

    // The number of open issues in the live org is not deterministic, so only assert that the
    // query succeeded and produced a frame.
    expect(getBody()?.results?.A?.status).toBe(200);
    expect(getBody()?.results?.A?.frames?.length ?? 0).toBeGreaterThan(0);
  });

  test('Spans: query succeeds', async ({ page, explorePage }) => {
    const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
    await page.goto(exploreUrl({ queryType: 'spans', eventsQuery: '' }));
    await responsePromise;

    expect(getBody()?.results?.A?.status).toBe(200);
    expect(getBody()?.results?.A?.frames?.length ?? 0).toBeGreaterThan(0);
  });
});
