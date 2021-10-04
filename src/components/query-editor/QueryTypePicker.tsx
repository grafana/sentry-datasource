import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel, Select } from '@grafana/ui';
import { SentryDataSource } from './../../datasource';
import { selectors } from './../../selectors';
import { SentryConfig, SentryQuery, QueryType, QueryTypeOptions } from './../../types';

type QueryTypePickerProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query' | 'onChange'>;

export const QueryTypePicker = ({ query, onChange }: QueryTypePickerProps) => {
  const onQueryTypeChange = (queryType?: QueryType) => {
    if (queryType) {
      onChange({ ...query, queryType });
    }
  };
  return (
    <div className="gf-form">
      <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.QueryType.tooltip}>
        {selectors.components.QueryEditor.QueryType.label}
      </InlineFormLabel>
      <Select<QueryType>
        options={QueryTypeOptions}
        value={query.queryType}
        onChange={(e) => onQueryTypeChange(e.value)}
        width={28}
      ></Select>
    </div>
  );
};
