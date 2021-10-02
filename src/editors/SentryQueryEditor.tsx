import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { SentryDataSource } from './../datasource';
import { QueryTypePicker } from './../components/query-editor/QueryTypePicker';
import { ScopePicker } from './../components/query-editor/ScopePicker';
import { IssuesEditor } from './../components/query-editor/IssuesEditor';
import { QueryPreview } from '../components/query-editor/QueryPreview';
import { SentryConfig, SentryQuery } from './../types';

type SentryQueryEditorProps = {} & QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>;

export const SentryQueryEditor = (props: SentryQueryEditorProps) => {
  const { query } = props;
  return (
    <>
      <QueryTypePicker {...props} />
      {query.queryType === 'issues' ? <ScopePicker {...props} /> : null}
      {query.queryType === 'issues' ? <IssuesEditor {...props} /> : null}
      <QueryPreview query={query} />
    </>
  );
};
