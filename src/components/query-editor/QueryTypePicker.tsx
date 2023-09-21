import React from 'react';
import { Select } from '@grafana/ui';
import { SentryDataSource } from './../../datasource';
import { selectors } from './../../selectors';
import { QueryTypeOptions } from '../../constants';
import type { QueryEditorProps } from '@grafana/data';
import type { SentryConfig, SentryQuery, QueryType } from './../../types';
import { EditorField, EditorRow } from '@grafana/experimental';

type QueryTypePickerProps = Pick<
  QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>,
  'query' | 'onChange' | 'onRunQuery'
>;

export const QueryTypePicker = ({ query, onChange, onRunQuery }: QueryTypePickerProps) => {
  const onQueryTypeChange = (queryType?: QueryType) => {
    if (queryType) {
      onChange({ ...query, queryType } as SentryQuery);
      onRunQuery();
    }
  };
  return (
    <EditorRow>
      <EditorField
        tooltip={selectors.components.QueryEditor.QueryType.tooltip}
        label={selectors.components.QueryEditor.QueryType.label}
      >
        <Select<QueryType>
          options={QueryTypeOptions}
          value={query.queryType}
          onChange={(e) => onQueryTypeChange(e.value)}
          placeholder={selectors.components.QueryEditor.QueryType.placeholder}
          width={30}
        ></Select>
      </EditorField>
    </EditorRow>
  );
};
