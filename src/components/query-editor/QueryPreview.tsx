import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel } from '@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryConfig, SentryQuery } from '../../types';

type QueryPreviewProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query'>;
export const QueryPreview = ({ query }: QueryPreviewProps) => {
  return (
    <div className="gf-form">
      <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Preview.tooltip}>
        {selectors.components.QueryEditor.Preview.label}
      </InlineFormLabel>
      <pre>{JSON.stringify(query)}</pre>
    </div>
  );
};
