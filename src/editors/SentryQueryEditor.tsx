import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { SentryDataSource } from './../datasource';
import { QueryTypePicker } from './../components/query-editor/QueryTypePicker';
import { ScopePicker } from './../components/query-editor/ScopePicker';
import { IssuesEditor } from './../components/query-editor/IssuesEditor';
import { SentryConfig, SentryQuery } from './../types';
import './../styles/editor.scss';

type SentryQueryEditorProps = {} & QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>;

export const SentryQueryEditor = (props: SentryQueryEditorProps) => {
  const { query } = props;
  return (
    <div className="grafana-sentry-datasource query-editor">
      <QueryTypePicker {...props} />
      {query.queryType === 'issues' ? <ScopePicker {...props} /> : null}
      {query.queryType === 'issues' ? <IssuesEditor {...props} /> : null}
    </div>
  );
};
