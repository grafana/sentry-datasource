import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel, Select, MultiSelect, Input, useTheme } from '@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { Components } from '../../selectors';
import {
  SentryConfig,
  SentryQuery,
  SentryStatsV2QueryFieldOptions,
  SentryStatsV2QueryGroupByOptions,
  SentryStatsV2QueryCategoryOptions,
  SentryStatsV2QueryOutcomeOptions,
  SentryStatsV2Query,
} from '../../types';

type StatsV2EditorProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query' | 'onChange' | 'onRunQuery'>;

export const StatsV2Editor = (props: StatsV2EditorProps) => {
  const { query, onChange, onRunQuery } = props;
  const theme = useTheme();
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
      <div
        className="gf-form"
        style={{ borderLeft: !(query.statsFields && query.statsFields.length > 0) ? `1px solid ${theme.palette.red}` : '' }}
      >
        <InlineFormLabel width={10} className="query-keyword" tooltip={StatsV2Selectors.Field.tooltip}>
          {StatsV2Selectors.Field.label}
        </InlineFormLabel>
        <Select
          value={query.statsFields?.[0] || ''}
          options={SentryStatsV2QueryFieldOptions}
          onChange={(e) => onPropChange('statsFields', [e.value!])}
        ></Select>
      </div>
      <div
        className="gf-form"
        style={{ borderLeft: !(query.statsCategory && query.statsCategory.length > 0) ? `1px solid ${theme.palette.red}` : '' }}
      >
        <InlineFormLabel width={10} className="query-keyword" tooltip={StatsV2Selectors.Category.tooltip}>
          {StatsV2Selectors.Category.label}
        </InlineFormLabel>
        <Select
          value={query.statsCategory?.[0] || ''}
          options={SentryStatsV2QueryCategoryOptions}
          onChange={(e) => onPropChange('statsCategory', [e.value!])}
        ></Select>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={StatsV2Selectors.Outcome.tooltip}>
          {StatsV2Selectors.Outcome.label}
        </InlineFormLabel>
        <MultiSelect
          value={query.statsOutcome || []}
          options={SentryStatsV2QueryOutcomeOptions}
          onChange={(e) =>
            onPropChange(
              'statsOutcome',
              e.map((item) => item.value!)
            )
          }
        ></MultiSelect>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={StatsV2Selectors.Reason.tooltip}>
          {StatsV2Selectors.Reason.label}
        </InlineFormLabel>
        <Input
          value={query.statsReason || []}
          placeholder={StatsV2Selectors.Reason.placeholder}
          onChange={(e) =>
            onPropChange(
              'statsReason',
              (e.currentTarget.value || '').split(',').map((r) => r.trim())
            )
          }
        ></Input>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={StatsV2Selectors.GroupBy.tooltip}>
          {StatsV2Selectors.GroupBy.label}
        </InlineFormLabel>
        <MultiSelect
          value={query.statsGroupBy || []}
          isClearable={true}
          options={SentryStatsV2QueryGroupByOptions}
          onChange={(e) =>
            onPropChange(
              'statsGroupBy',
              e.map((item) => item.value!)
            )
          }
        ></MultiSelect>
      </div>
    </>
  );
};
