import React from 'react';
import { SentryDataSource } from './../datasource';
import { Error } from '../components/Error';
import { QueryTypePicker } from './../components/query-editor/QueryTypePicker';
import { ScopePicker } from './../components/query-editor/ScopePicker';
import { IssuesEditor } from './../components/query-editor/IssuesEditor';
import { StatsV2Editor } from './../components/query-editor/StatsV2Editor';
import type { QueryEditorProps } from '@grafana/data/types';
import type { SentryConfig, SentryQuery } from './../types';
import './../styles/editor.scss';

type SentryQueryEditorProps = {} & QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>;

export const SentryQueryEditor = (props: SentryQueryEditorProps) => {
  const { query, datasource } = props;
  const orgSlug = datasource.getOrgSlug();
  if (!orgSlug) {
    return (
      <Error message="Error loading org slug from the configuration. Make sure you have the correct org slug specified in the data source configuration." />
    );
  }
  return (
    <div className="grafana-sentry-datasource query-editor">
      <QueryTypePicker {...props} />
      <ScopePicker {...props} hideEnvironments={query.queryType === 'statsV2'} />
      {query.queryType === 'issues' ? <IssuesEditor {...props} /> : null}
      {query.queryType === 'statsV2' ? <StatsV2Editor {...props} /> : null}
    </div>
  );
};
