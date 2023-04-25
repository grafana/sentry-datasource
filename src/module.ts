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
    const { payload: { dashboardId, orgId, grafanaVersion, queries } } = props;
    const sentryQueries = queries["grafana-sentry-datasource"];

    if (!sentryQueries?.length) {
      return;
    };

    trackSentryDashboardLoaded({
      dashboardId: dashboardId,
      grafanaVersion: grafanaVersion,
      orgId: orgId,
      ...analyzeQueries(sentryQueries),
    });
  }
);
