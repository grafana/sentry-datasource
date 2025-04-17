import type { QueryEditorProps } from '@grafana/data';
import { EditorRows } from '@grafana/plugin-ui';
import { EventsStatsEditor } from 'components/query-editor/EventsStatsEditor';
import { MetricsEditor } from 'components/query-editor/MetricsEditor';
import React from 'react';
import { Error } from '../components/Error';
import { EventsEditor } from './../components/query-editor/EventsEditor';
import { IssuesEditor } from './../components/query-editor/IssuesEditor';
import { QueryTypePicker } from './../components/query-editor/QueryTypePicker';
import { ScopePicker } from './../components/query-editor/ScopePicker';
import { StatsV2Editor } from './../components/query-editor/StatsV2Editor';
import { SentryDataSource } from './../datasource';
import './../styles/editor.scss';
import type { SentryConfig, SentryQuery } from './../types';

type SentryQueryEditorProps = {} & QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>;

export const SentryQueryEditor = (props: SentryQueryEditorProps) => {
  const { query, datasource, onChange, onRunQuery } = props;
  const orgSlug = datasource.getOrgSlug();
  if (!orgSlug) {
    return (
      <Error message="Error loading org slug from the configuration. Make sure you have the correct org slug specified in the data source configuration." />
    );
  }
  return (
    <EditorRows>
      <QueryTypePicker {...props} />
      <ScopePicker {...props} hideEnvironments={query.queryType === 'statsV2'} />
      {query.queryType === 'issues' ? <IssuesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} /> : null}
      {query.queryType === 'statsV2' ? (
        <StatsV2Editor query={query} onChange={onChange} onRunQuery={onRunQuery} />
      ) : null}
      {query.queryType === 'events' ? <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} /> : null}
      {query.queryType === 'eventsStats' ? (
        <EventsStatsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
      ) : null}
      {query.queryType === 'metrics' ? (
        <MetricsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
      ) : null}
    </EditorRows>
  );
};
