import { DataSourcePlugin } from '@grafana/data';
import { SentryDataSource } from './datasource';
import { SentryConfigEditor } from './editors/SentryConfigEditor';
import { SentryQueryEditor } from './editors/SentryQueryEditor';
import { SentryVariableEditor } from './editors/SentryVariableEditor';
import type { SentryConfig, SentrySecureConfig, SentryQuery } from './types';

export const plugin = new DataSourcePlugin<SentryDataSource, SentryQuery, SentryConfig, SentrySecureConfig>(SentryDataSource)
  .setConfigEditor(SentryConfigEditor)
  .setQueryEditor(SentryQueryEditor)
  .setVariableQueryEditor(SentryVariableEditor);
