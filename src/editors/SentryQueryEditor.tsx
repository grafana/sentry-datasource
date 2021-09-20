import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { SentryDataSource } from './../datasource';
import { SentryConfig, SentryQuery } from './../types';

type SentryQueryEditorProps = {} & QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>;

export const SentryQueryEditor = (props: SentryQueryEditorProps) => {
  return <>Sentry Query Editor</>;
};
