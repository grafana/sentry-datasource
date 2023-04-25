import { analyzeQueries } from 'tracking';
import { SentryQuery } from 'types';

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
        stats_query_groupby: 0 
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
        stats_query_groupby: 0 
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
        stats_query_groupby: 0 
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
        stats_query_groupby: 0 
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
        stats_query_groupby: 0 
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
        stats_query_groupby: 1 
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
        stats_query_groupby: 1 
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
        stats_query_groupby: 0 
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
          stats_query_groupby: 1 
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
