import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { SentryConfig } from './../types';

type SentryConfigEditorProps = {} & DataSourcePluginOptionsEditorProps<SentryConfig>;

export const SentryConfigEditor = (props: SentryConfigEditorProps) => {
  return <>Sentry Config Editor</>;
};
