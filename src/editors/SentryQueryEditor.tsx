import React from 'react';
import { SentryDataSource } from './../datasource';
import { Error } from '../components/Error';
import { QueryTypePicker } from './../components/query-editor/QueryTypePicker';
import { ScopePicker } from './../components/query-editor/ScopePicker';
import { IssuesEditor } from './../components/query-editor/IssuesEditor';
import { EventsEditor } from './../components/query-editor/EventsEditor';
import { StatsV2Editor } from './../components/query-editor/StatsV2Editor';
import type { QueryEditorProps } from '@grafana/data';
import type { SentryConfig, SentryQuery } from './../types';
import './../styles/editor.scss';
import { EditorRows } from '@grafana/experimental';

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
      {query.queryType === 'events' ? <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} /> : null}      
    </EditorRows>
  );
};
