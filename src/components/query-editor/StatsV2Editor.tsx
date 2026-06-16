import React from 'react';
import { Select, MultiSelect, Input } from '@grafana/ui';
import { Components } from '../../selectors';
import {
  SentryStatsV2QueryFieldOptions,
  SentryStatsV2QueryGroupByOptions,
  SentryStatsV2QueryCategoryOptions,
  SentryStatsV2QueryOutcomeOptions,
} from '../../constants';
import type { SentryStatsV2Query } from '../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';

interface StatsV2EditorProps {
  query: SentryStatsV2Query;
  onChange: (value: SentryStatsV2Query) => void;
  onRunQuery: () => void;
}

export const StatsV2Editor = ({ query, onChange, onRunQuery }: StatsV2EditorProps) => {
  const { StatsV2: StatsV2Selectors } = Components.QueryEditor;

  const onPropChange = <T extends keyof SentryStatsV2Query, V extends SentryStatsV2Query[T]>(prop: T, value: V) => {
    onChange({ ...query, [prop]: value });
    onRunQuery();
  };
  return (
    <>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField tooltip={StatsV2Selectors.Field.tooltip} label={StatsV2Selectors.Field.label} width={50}>
            <Select
              value={query.statsFields?.[0] || ''}
              options={SentryStatsV2QueryFieldOptions}
              onChange={(e) => onPropChange('statsFields', [e.value!])}
              placeholder={StatsV2Selectors.Field.placeholder}
            />
          </EditorField>
          <EditorField tooltip={StatsV2Selectors.Category.tooltip} label={StatsV2Selectors.Category.label} width={50}>
            <Select
              value={query.statsCategory?.[0] || ''}
              options={SentryStatsV2QueryCategoryOptions}
              onChange={(e) => onPropChange('statsCategory', [e.value!])}
              placeholder={StatsV2Selectors.Category.placeholder}
            />
          </EditorField>
        </EditorFieldGroup>
      </EditorRow>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField tooltip={StatsV2Selectors.Outcome.tooltip} label={StatsV2Selectors.Outcome.label} width={50}>
            <MultiSelect
              value={query.statsOutcome || []}
              options={SentryStatsV2QueryOutcomeOptions}
              placeholder={StatsV2Selectors.Outcome.placeholder}
              onChange={(e) =>
                onPropChange(
                  'statsOutcome',
                  e.map((item) => item.value!)
                )
              }
            />
          </EditorField>
          <EditorField tooltip={StatsV2Selectors.Reason.tooltip} label={StatsV2Selectors.Reason.label} width={50}>
            <Input
              value={query.statsReason || []}
              placeholder={StatsV2Selectors.Reason.placeholder}
              onChange={(e) =>
                onPropChange(
                  'statsReason',
                  (e.currentTarget.value || '').split(',').map((r) => r.trim())
                )
              }
            />
          </EditorField>
          <EditorField tooltip={StatsV2Selectors.GroupBy.tooltip} label={StatsV2Selectors.GroupBy.label} width={50}>
            <MultiSelect
              value={query.statsGroupBy || []}
              isClearable={true}
              options={SentryStatsV2QueryGroupByOptions}
              placeholder={StatsV2Selectors.GroupBy.placeholder}
              onChange={(e) =>
                onPropChange(
                  'statsGroupBy',
                  e.map((item) => item.value!)
                )
              }
            />
          </EditorField>
          <EditorField tooltip={StatsV2Selectors.Interval.tooltip} label={StatsV2Selectors.Interval.label} width={50}>
            <Input
              value={query.statsInterval || ''}
              placeholder={StatsV2Selectors.Interval.placeholder}
              onChange={(e) => onPropChange('statsInterval', e.currentTarget.value || '')}
            />
          </EditorField>
        </EditorFieldGroup>
      </EditorRow>
    </>
  );
};
