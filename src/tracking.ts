import { reportInteraction } from '@grafana/runtime';
import { SentryQuery } from 'types';

export const trackSentryDashboardLoaded = (props: SentryDashboardLoadedProps) => {
  console.log('trackSentryDashboardLoaded props', props);
  reportInteraction('grafana_ds_clickhouse_dashboard_loaded', props);
};

export type SentryCounters = {
  issues_query: number,
  stats_query: number,
};

export interface SentryDashboardLoadedProps extends SentryCounters {
  dashboardId: string,
  grafanaVersion?: string,
  orgId?: number,
  [key: string]: any;
};

export const analyzeQueries = (queries: SentryQuery[]): SentryCounters => {
  const counters = {
    issues_query: 0,
    issues_query_environments: 0,
    stats_query: 0,
    stats_query_outcome_filter: 0,
    stats_query_reason_filter: 0,
    stats_query_groupby: 0
  };
  
  queries.forEach((query) => {
    switch (query.queryType) {
      case "issues":
        counters.issues_query++;
        if (query.environments?.length > 0) {
          counters.issues_query_environments++
        }
        break;
      case "statsV2":
        counters.stats_query++;
        if (query.statsOutcome?.length > 0) {
          counters.stats_query_outcome_filter++
        }
        if (query.statsReason?.length > 0) {
          counters.stats_query_reason_filter++
        }
        if (query.statsGroupBy?.length > 0) {
          counters.stats_query_groupby++
        }
        break;
    }
  });

  return counters;
};

