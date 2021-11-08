import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel, Select, useTheme } from '@grafana/ui';
import { SentryDataSource } from './../../datasource';
import { selectors } from './../../selectors';
import { SentryConfig, SentryQuery, QueryType, QueryTypeOptions } from './../../types';

type QueryTypePickerProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query' | 'onChange' | 'onRunQuery'>;

export const QueryTypePicker = ({ query, onChange, onRunQuery }: QueryTypePickerProps) => {
  const theme = useTheme();
  const onQueryTypeChange = (queryType?: QueryType) => {
    if (queryType) {
      onChange({ ...query, queryType } as SentryQuery);
      onRunQuery();
    }
  };
  return (
    <div className="gf-form" style={{ borderLeft: !query.queryType ? `1px solid ${theme.palette.red}` : '' }}>
      <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.QueryType.tooltip}>
        {selectors.components.QueryEditor.QueryType.label}
      </InlineFormLabel>
      <Select<QueryType>
        options={QueryTypeOptions}
        value={query.queryType}
        onChange={(e) => onQueryTypeChange(e.value)}
        className="inline-element"
        placeholder={selectors.components.QueryEditor.QueryType.placeholder}
        width={28}
      ></Select>
    </div>
  );
};
