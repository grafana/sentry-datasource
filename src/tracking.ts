import type { DataQueryRequest } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { SentryQuery } from 'types';
import sentryVersion from '../package.json';

export const trackSentryDashboardLoaded = (props: SentryDashboardLoadedProps) => {
  reportInteraction('grafana_ds_sentry_dashboard_loaded', props);
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
    stats_query_group_by: 0
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
          counters.stats_query_group_by++
        }
        break;
    }
  });

  return counters;
};

// Upper bound on distinct (app, dashboard, panel, query type) keys remembered per page session.
// Keeps memory flat in pathological cases; once reached, further new keys are simply not reported.
const MAX_TRACKED_QUERY_KEYS = 1000;

const trackedQueryKeys = new Set<string>();

/**
 * Reports which Sentry query types are being run, at most once per page session for each
 * (app, dashboard, panel, query type) combination, so dashboard auto-refresh does not
 * generate an event per refresh. Explore, where there is no dashboard or panel, is
 * deduplicated per query type in the same way.
 *
 * Only the query type and where it ran are sent. Query text, filters and results are not.
 * Must never throw or delay the query.
 */
export const trackQueryExecuted = (request: DataQueryRequest<SentryQuery>) => {
  try {
    request.targets.forEach((target) => {
      if (target.hide) {
        return;
      }

      const queryType = target.queryType ?? 'unknown';
      const key = [request.app, request.dashboardUID ?? 'none', request.panelId ?? 'none', queryType].join('|');

      if (trackedQueryKeys.has(key) || trackedQueryKeys.size >= MAX_TRACKED_QUERY_KEYS) {
        return;
      }
      trackedQueryKeys.add(key);

      reportInteraction('grafana_ds_sentry_query_executed', {
        sentry_plugin_version: sentryVersion.version,
        app: request.app,
        queryType,
        dashboardUID: request.dashboardUID,
      });
    });
  } catch {
    // Telemetry must never affect query execution.
  }
};

/** Clears the per-session memory of reported queries. Intended for tests. */
export const resetTrackedQueries = () => {
  trackedQueryKeys.clear();
};
