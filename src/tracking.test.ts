import type { DataQueryRequest } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { analyzeQueries, resetTrackedQueries, trackQueryExecuted } from 'tracking';
import { SentryQuery } from 'types';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  reportInteraction: jest.fn(),
}));

describe('analyzeQueries', () => {
  [
    {
      description: 'should count 1 issues query',
      queries: [{ queryType: "issues", environments: [] }],
      expectedCounters: { 
        issues_query: 1,
        issues_query_environments: 0,
        stats_query: 0,
        stats_query_outcome_filter: 0,
        stats_query_reason_filter: 0,
        stats_query_group_by: 0 
      },
    },
    {
      description: 'should count 1 query environment (if set) in an issues query',
      queries: [{ queryType: "issues", environments: [ "development" ] }],
      expectedCounters: { 
        issues_query: 1,
        issues_query_environments: 1,
        stats_query: 0,
        stats_query_outcome_filter: 0,
        stats_query_reason_filter: 0,
        stats_query_group_by: 0 
      },
    },
    {
      description: 'should count 1 stats query',
      queries: [{ queryType: "statsV2" }],
      expectedCounters: { 
        issues_query: 0,
        issues_query_environments: 0,
        stats_query: 1,
        stats_query_outcome_filter: 0,
        stats_query_reason_filter: 0,
        stats_query_group_by: 0 
      },
    },
    {
      description: 'should count 1 outcome (if set) in a stats query',
      queries: [{ queryType: "statsV2", statsOutcome: [ "filtered" ] }],
      expectedCounters: { 
        issues_query: 0,
        issues_query_environments: 0,
        stats_query: 1,
        stats_query_outcome_filter: 1,
        stats_query_reason_filter: 0,
        stats_query_group_by: 0 
      },
    },
    {
      description: 'should count 1 reason (if set) in a stats query',
      queries: [{ queryType: "statsV2", statsReason: [ "reason1" ] }],
      expectedCounters: { 
        issues_query: 0,
        issues_query_environments: 0,
        stats_query: 1,
        stats_query_outcome_filter: 0,
        stats_query_reason_filter: 1,
        stats_query_group_by: 0 
      },
    },
    {
      description: 'should count 1 groupby (if set) in a stats query',
      queries: [{ queryType: "statsV2", statsGroupBy: [ "category" ] }],
      expectedCounters: { 
        issues_query: 0,
        issues_query_environments: 0,
        stats_query: 1,
        stats_query_outcome_filter: 0,
        stats_query_reason_filter: 0,
        stats_query_group_by: 1 
      },
    },
    {
      description: 'should count multiple optional filters (if set) in a stats query',
      queries: [{ queryType: "statsV2", statsOutcome: [ "filtered" ], statsReason: [ "reason1" ], statsGroupBy: [ "category" ]}],
      expectedCounters: { 
        issues_query: 0,
        issues_query_environments: 0,
        stats_query: 1,
        stats_query_outcome_filter: 1,
        stats_query_reason_filter: 1,
        stats_query_group_by: 1 
      },
    },
    {
      description: 'should count multiple queries',
      queries: [{ queryType: "statsV2" }, { queryType: "issues" },],
      expectedCounters: { 
        issues_query: 1,
        issues_query_environments: 0,
        stats_query: 1,
        stats_query_outcome_filter: 0,
        stats_query_reason_filter: 0,
        stats_query_group_by: 0 
      },
    },
    {
        description: 'should count multiple queries with filters',
        queries: [{ queryType: "statsV2" , statsOutcome: [ "filtered" ], statsReason: [ "reason1" ], statsGroupBy: [ "category" ]}, { queryType: "issues", environments: [ "prod" ] },],
        expectedCounters: { 
          issues_query: 1,
          issues_query_environments: 1,
          stats_query: 1,
          stats_query_outcome_filter: 1,
          stats_query_reason_filter: 1,
          stats_query_group_by: 1 
        },
      },
  ].forEach((t) => {
    it(t.description, () => {
      expect(
        analyzeQueries(
          t.queries as SentryQuery[]
        )
      ).toMatchObject(t.expectedCounters);
    });
  });
});

describe('trackQueryExecuted', () => {
  const reportMock = reportInteraction as jest.Mock;

  const makeRequest = (
    targets: Array<Partial<SentryQuery>>,
    overrides: Partial<DataQueryRequest<SentryQuery>> = {}
  ): DataQueryRequest<SentryQuery> =>
    ({
      app: 'dashboard',
      dashboardUID: 'dash-1',
      panelId: 1,
      targets: targets.map((t, i) => ({ refId: String.fromCharCode(65 + i), ...t })),
      ...overrides,
    }) as DataQueryRequest<SentryQuery>;

  beforeEach(() => {
    reportMock.mockReset();
    resetTrackedQueries();
  });

  it('reports the query type, app, dashboard and plugin version', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'spans' }]));

    expect(reportMock).toHaveBeenCalledTimes(1);
    expect(reportMock).toHaveBeenCalledWith('grafana_ds_sentry_query_executed', {
      sentry_plugin_version: expect.any(String),
      app: 'dashboard',
      queryType: 'spans',
      dashboardUID: 'dash-1',
    });
  });

  it('does not send query text, filters or other query content', () => {
    trackQueryExecuted(
      makeRequest([
        {
          queryType: 'issues',
          issuesQuery: 'is:unresolved user.email:a@b.com',
          environments: ['prod'],
        } as Partial<SentryQuery>,
      ])
    );

    const [, payload] = reportMock.mock.calls[0];
    expect(Object.keys(payload).sort()).toEqual(['app', 'dashboardUID', 'queryType', 'sentry_plugin_version']);
    expect(JSON.stringify(payload)).not.toContain('unresolved');
    expect(JSON.stringify(payload)).not.toContain('a@b.com');
  });

  it.each(['issues', 'events', 'statsV2', 'eventsStats', 'metrics', 'spans', 'spansStats'] as const)(
    'reports %s queries',
    (queryType) => {
      trackQueryExecuted(makeRequest([{ queryType }]));
      expect(reportMock).toHaveBeenCalledWith(
        'grafana_ds_sentry_query_executed',
        expect.objectContaining({ queryType })
      );
    }
  );

  it('reports a query with no queryType as unknown', () => {
    trackQueryExecuted(makeRequest([{}]));
    expect(reportMock).toHaveBeenCalledWith(
      'grafana_ds_sentry_query_executed',
      expect.objectContaining({ queryType: 'unknown' })
    );
  });

  it('reports a dashboard panel only once however many times it refreshes', () => {
    const request = makeRequest([{ queryType: 'issues' }]);
    for (let i = 0; i < 50; i++) {
      trackQueryExecuted(request);
    }
    expect(reportMock).toHaveBeenCalledTimes(1);
  });

  it('reports each query type on the same panel separately', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }, { queryType: 'spans' }]));
    expect(reportMock).toHaveBeenCalledTimes(2);
  });

  it('reports the same query type once per target set in a single request', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }, { queryType: 'issues' }]));
    expect(reportMock).toHaveBeenCalledTimes(1);
  });

  it('reports different panels on the same dashboard separately', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }], { panelId: 1 }));
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }], { panelId: 2 }));
    expect(reportMock).toHaveBeenCalledTimes(2);
  });

  it('reports the same panel id on different dashboards separately', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }], { dashboardUID: 'dash-1' }));
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }], { dashboardUID: 'dash-2' }));
    expect(reportMock).toHaveBeenCalledTimes(2);
  });

  it('reports Explore once per query type, with no dashboard', () => {
    const explore = (queryType: SentryQuery['queryType']) =>
      makeRequest([{ queryType }], { app: 'explore', dashboardUID: undefined, panelId: undefined });

    trackQueryExecuted(explore('issues'));
    trackQueryExecuted(explore('issues'));
    trackQueryExecuted(explore('events'));

    expect(reportMock).toHaveBeenCalledTimes(2);
    expect(reportMock).toHaveBeenCalledWith(
      'grafana_ds_sentry_query_executed',
      expect.objectContaining({ app: 'explore', queryType: 'issues', dashboardUID: undefined })
    );
  });

  it('reports the same query type separately for Explore and a dashboard', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'issues' }]));
    trackQueryExecuted(
      makeRequest([{ queryType: 'issues' }], { app: 'explore', dashboardUID: undefined, panelId: undefined })
    );
    expect(reportMock).toHaveBeenCalledTimes(2);
  });

  it('skips hidden queries', () => {
    trackQueryExecuted(makeRequest([{ queryType: 'issues', hide: true }, { queryType: 'spans' }]));
    expect(reportMock).toHaveBeenCalledTimes(1);
    expect(reportMock).toHaveBeenCalledWith(
      'grafana_ds_sentry_query_executed',
      expect.objectContaining({ queryType: 'spans' })
    );
  });

  it('stops reporting new combinations once the per-session limit is reached', () => {
    for (let panelId = 1; panelId <= 1005; panelId++) {
      trackQueryExecuted(makeRequest([{ queryType: 'issues' }], { panelId }));
    }
    expect(reportMock).toHaveBeenCalledTimes(1000);
  });

  it('never throws if reporting fails', () => {
    reportMock.mockImplementation(() => {
      throw new Error('boom');
    });
    expect(() => trackQueryExecuted(makeRequest([{ queryType: 'issues' }]))).not.toThrow();
  });
});
