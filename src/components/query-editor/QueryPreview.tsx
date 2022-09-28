import React from 'react';
import { InlineFormLabel } from '@grafana/ui';
import { selectors } from '../../selectors';
import type { QueryEditorProps } from '@grafana/data/types';
import type { SentryDataSource } from '../../datasource';
import type { SentryConfig, SentryQuery } from '../../types';

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
