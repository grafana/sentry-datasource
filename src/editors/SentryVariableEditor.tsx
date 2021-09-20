import React from 'react';
import { SentryDataSource } from './../datasource';
import { SentryVariableQuery } from './../types';

type SentryVariableEditorProps = {
  query: SentryVariableQuery;
  datasource: SentryDataSource;
  onChange: (query: SentryVariableQuery, definition: string) => void;
};

export const SentryVariableEditor = (props: SentryVariableEditorProps) => {
  return <>Sentry Variable Editor</>;
};
