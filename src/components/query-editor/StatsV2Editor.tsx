import React from 'react';
import { Select, MultiSelect, Input, useTheme2 } from '@grafana/ui';
import { EditorRow, EditorField } from './@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { Components } from '../../selectors';
import {
  SentryStatsV2QueryFieldOptions,
  SentryStatsV2QueryGroupByOptions,
  SentryStatsV2QueryCategoryOptions,
  SentryStatsV2QueryOutcomeOptions,
} from './../../constants';
import type { QueryEditorProps } from '@grafana/data/types';
import type { SentryConfig, SentryQuery, SentryStatsV2Query } from '../../types';

type StatsV2EditorProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query' | 'onChange' | 'onRunQuery'>;

export const StatsV2Editor = (props: StatsV2EditorProps) => {
  const { query, onChange, onRunQuery } = props;
  const theme = useTheme2();
  const { StatsV2: StatsV2Selectors } = Components.QueryEditor;
  if (query.queryType !== 'statsV2') {
    return <></>;
  }
  const onPropChange = <T extends keyof SentryStatsV2Query, V extends SentryStatsV2Query[T]>(prop: T, value: V) => {
    onChange({ ...query, [prop]: value });
    onRunQuery();
  };
  return (
    <>
      <EditorRow>
        <div style={{ borderLeft: !(query.statsFields && query.statsFields.length > 0) ? `1px solid ${theme.colors.error}` : '' }}>
          <EditorField label={StatsV2Selectors.Field.label} tooltip={StatsV2Selectors.Field.tooltip}>
            <Select
              width={40}
              value={query.statsFields?.[0] || ''}
              options={SentryStatsV2QueryFieldOptions}
              onChange={(e) => onPropChange('statsFields', [e.value!])}
              placeholder={StatsV2Selectors.Field.placeholder}
            ></Select>
          </EditorField>
        </div>
        <div style={{ borderLeft: !(query.statsCategory && query.statsCategory.length > 0) ? `1px solid ${theme.colors.error}` : '' }}>
          <EditorField label={StatsV2Selectors.Category.label} tooltip={StatsV2Selectors.Category.tooltip}>
            <Select
              width={40}
              value={query.statsCategory?.[0] || ''}
              options={SentryStatsV2QueryCategoryOptions}
              onChange={(e) => onPropChange('statsCategory', [e.value!])}
              placeholder={StatsV2Selectors.Category.placeholder}
            ></Select>
          </EditorField>
        </div>
        <EditorField label={StatsV2Selectors.GroupBy.label} tooltip={StatsV2Selectors.GroupBy.tooltip}>
          <MultiSelect
            width={60}
            value={query.statsGroupBy || []}
            isClearable={true}
            options={SentryStatsV2QueryGroupByOptions}
            placeholder={StatsV2Selectors.GroupBy.placeholder}
            onChange={(e) => {
              onPropChange(
                'statsGroupBy',
                e.map((item) => item.value!)
              );
            }}
          ></MultiSelect>
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorField label={StatsV2Selectors.Outcome.label} tooltip={StatsV2Selectors.Outcome.tooltip}>
          <MultiSelect
            width={60}
            value={query.statsOutcome || []}
            options={SentryStatsV2QueryOutcomeOptions}
            placeholder={StatsV2Selectors.Outcome.placeholder}
            onChange={(e) =>
              onPropChange(
                'statsOutcome',
                e.map((item) => item.value!)
              )
            }
          ></MultiSelect>
        </EditorField>
        <EditorField label={StatsV2Selectors.Reason.label} tooltip={StatsV2Selectors.Reason.tooltip}>
          <Input
            width={60}
            value={query.statsReason || []}
            placeholder={StatsV2Selectors.Reason.placeholder}
            onChange={(e) =>
              onPropChange(
                'statsReason',
                (e.currentTarget.value || '').split(',').map((r) => r.trim())
              )
            }
          ></Input>
        </EditorField>
      </EditorRow>
    </>
  );
};
