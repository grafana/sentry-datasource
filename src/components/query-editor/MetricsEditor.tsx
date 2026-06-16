import React from 'react';
import { Input, QueryField, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import type {
  SentryMetricsQuery,
  SentryMetricsQueryField,
  SentryMetricsQueryGroupBy,
  SentryMetricsQuerySort,
  SentryMetricsQueryOrder,
} from '../../types';
import { EditorField, EditorRow } from '@grafana/plugin-ui';
import {
  SentryMetricsQueryFieldOptions,
  SentryMetricsQueryGroupByOptions,
  SentryMetricsQuerySortOptions,
  SentryMetricsQueryOrderOptions,
} from '../../constants';

interface MetricsEditorProps {
  query: SentryMetricsQuery;
  onChange: (value: SentryMetricsQuery) => void;
  onRunQuery: () => void;
}

export const MetricsEditor = ({ query, onChange, onRunQuery }: MetricsEditorProps) => {
  const onMetricsFieldChange = (metricsField: SentryMetricsQueryField) => {
    onChange({ ...query, metricsField });
    onRunQuery();
  };
  const onMetricsQueryChange = (metricsQuery: string) => {
    onChange({ ...query, metricsQuery });
  };
  const onMetricsGroupByChange = (metricsGroupBy: SentryMetricsQueryGroupBy) => {
    onChange({ ...query, metricsGroupBy });
    onRunQuery();
  };
  const onMetricsSortByChange = (metricsSort: SentryMetricsQuerySort) => {
    onChange({ ...query, metricsSort });
    onRunQuery();
  };
  const onMetricsSortOrderChange = (metricsOrder: SentryMetricsQueryOrder) => {
    onChange({ ...query, metricsOrder });
    onRunQuery();
  };
  const onMetricsLimitChange = (metricsLimit: number) => {
    onChange({ ...query, metricsLimit });
    onRunQuery();
  };
  return (
    <>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.Metrics.Field.tooltip}
          label={selectors.components.QueryEditor.Metrics.Field.label}
          width={50}
        >
          <Select
            options={SentryMetricsQueryFieldOptions}
            value={query.metricsField}
            onChange={(e) => onMetricsFieldChange(e?.value!)}
            className="inline-element"
            placeholder={selectors.components.QueryEditor.Metrics.Field.placeholder}
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.Metrics.Query.tooltip}
          label={selectors.components.QueryEditor.Metrics.Query.label}
          width={'100%'}
        >
          <QueryField
            query={query.metricsQuery}
            onChange={(val) => onMetricsQueryChange(val)}
            onRunQuery={onRunQuery}
            placeholder={selectors.components.QueryEditor.Metrics.Query.placeholder}
            portalOrigin="Sentry"
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.Metrics.GroupBy.tooltip}
          label={selectors.components.QueryEditor.Metrics.GroupBy.label}
          width={50}
        >
          <Select
            options={SentryMetricsQueryGroupByOptions}
            value={query.metricsGroupBy}
            onChange={(e) => onMetricsGroupByChange(e?.value!)}
            className="inline-element"
            placeholder={selectors.components.QueryEditor.Metrics.GroupBy.placeholder}
            isClearable={true}
          />
        </EditorField>
      </EditorRow>
      {query.metricsGroupBy && query.metricsGroupBy !== 'session.status' && (
        <EditorRow>
          <EditorField
            tooltip={selectors.components.QueryEditor.Metrics.Sort.tooltip}
            label={selectors.components.QueryEditor.Metrics.Sort.label}
            width={30}
          >
            <Select
              options={SentryMetricsQuerySortOptions}
              value={query.metricsSort}
              onChange={(e) => onMetricsSortByChange(e?.value!)}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Metrics.Sort.placeholder}
              isClearable={true}
            />
          </EditorField>
          <EditorField
            tooltip={selectors.components.QueryEditor.Metrics.Order.tooltip}
            label={selectors.components.QueryEditor.Metrics.Order.label}
            width={30}
          >
            <Select
              options={SentryMetricsQueryOrderOptions}
              value={query.metricsOrder}
              onChange={(e) => onMetricsSortOrderChange(e?.value!)}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Metrics.Order.placeholder}
              isClearable={true}
            />
          </EditorField>
          <EditorField
            tooltip={selectors.components.QueryEditor.Metrics.Limit.tooltip}
            label={selectors.components.QueryEditor.Metrics.Limit.label}
          >
            <Input
              value={query.metricsLimit}
              type="number"
              onChange={(e) => onMetricsLimitChange(e.currentTarget.valueAsNumber)}
              onBlur={onRunQuery}
              width={32}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Metrics.Limit.placeholder}
            />
          </EditorField>
        </EditorRow>
      )}
    </>
  );
};
