import { DashboardLoadedEvent, DataSourcePlugin } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { analyzeQueries, trackSentryDashboardLoaded } from 'tracking';
import { SentryDataSource } from './datasource';
import { SentryConfigEditor } from './editors/SentryConfigEditor';
import { SentryQueryEditor } from './editors/SentryQueryEditor';
import { SentryVariableEditor } from './editors/SentryVariableEditor';
import type { SentryConfig, SentrySecureConfig, SentryQuery } from './types';

export const plugin = new DataSourcePlugin<SentryDataSource, SentryQuery, SentryConfig, SentrySecureConfig>(SentryDataSource)
  .setConfigEditor(SentryConfigEditor)
  .setQueryEditor(SentryQueryEditor)
  .setVariableQueryEditor(SentryVariableEditor);

// Track dashboard loads to RudderStack
getAppEvents().subscribe<DashboardLoadedEvent<SentryQuery>>(
  DashboardLoadedEvent,
  (props) => {
    const { payload } = props;
    const sentryQueries = payload.queries["grafana-sentry-datasource"];

    trackSentryDashboardLoaded({
      dashboardId: payload.dashboardId,
      grafanaVersion: payload.grafanaVersion,
      orgId: payload.orgId,
      ...analyzeQueries(sentryQueries),
    });
  }
);
