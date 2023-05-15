import { DashboardLoadedEvent, DataSourcePlugin } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { analyzeQueries, trackSentryDashboardLoaded } from 'tracking';
import { SentryDataSource } from './datasource';
import { SentryConfigEditor } from './editors/SentryConfigEditor';
import { SentryQueryEditor } from './editors/SentryQueryEditor';
import { SentryVariableEditor } from './editors/SentryVariableEditor';
import type { SentryConfig, SentrySecureConfig, SentryQuery } from './types';
import sentryVersion from '../package.json';

export const plugin = new DataSourcePlugin<SentryDataSource, SentryQuery, SentryConfig, SentrySecureConfig>(SentryDataSource)
  .setConfigEditor(SentryConfigEditor)
  .setQueryEditor(SentryQueryEditor)
  .setVariableQueryEditor(SentryVariableEditor);

// Track dashboard loads to RudderStack
getAppEvents().subscribe<DashboardLoadedEvent<SentryQuery>>(
  DashboardLoadedEvent,
  ({ payload: { dashboardId, orgId, grafanaVersion, queries } }) => {
    const sentryQueries = queries["grafana-sentry-datasource"];

    if (!sentryQueries?.length) {
      return;
    };

    trackSentryDashboardLoaded({
      sentry_plugin_version: sentryVersion.version,
      dashboardId: dashboardId,
      grafanaVersion: grafanaVersion,
      orgId: orgId,
      ...analyzeQueries(sentryQueries),
    });
  }
);
