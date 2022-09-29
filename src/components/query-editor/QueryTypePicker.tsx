import React from 'react';
import { Select, useTheme } from '@grafana/ui';
import { EditorField } from './@grafana/ui';
import { SentryDataSource } from './../../datasource';
import { selectors } from './../../selectors';
import { QueryTypeOptions } from './../../constants';
import type { QueryEditorProps } from '@grafana/data/types';
import type { SentryConfig, SentryQuery, QueryType } from './../../types';

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
      <EditorField label={selectors.components.QueryEditor.QueryType.label} tooltip={selectors.components.QueryEditor.QueryType.tooltip}>
        <Select<QueryType>
          options={QueryTypeOptions}
          value={query.queryType}
          onChange={(e) => onQueryTypeChange(e.value)}
          placeholder={selectors.components.QueryEditor.QueryType.placeholder}
          width={16}
        ></Select>
      </EditorField>
    </div>
  );
};
