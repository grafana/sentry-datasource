import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { Input, QueryField, TagsInput } from '@grafana/ui';
import React from 'react';
import { selectors } from '../../selectors';
import type { SentryEventsStatsQuery, SentrySpansStatsQuery } from '../../types';

interface EventsStatsEditorProps {
  query: SentryEventsStatsQuery | SentrySpansStatsQuery;
  onChange: (value: SentryEventsStatsQuery | SentrySpansStatsQuery) => void;
  onRunQuery: () => void;
}

export const EventsStatsEditor = ({ query, onChange, onRunQuery }: EventsStatsEditorProps) => {
  const onEventsStatsQueryChange = (eventsStatsQuery: string) => {
    onChange({ ...query, eventsStatsQuery });
  };
  const onEventsStatsYAxisChange = (eventsStatsYAxis: string[]) => {
    onChange({ ...query, eventsStatsYAxis });
    onRunQuery();
  };
  const onEventsStatsGroupsChange = (eventsStatsGroups: string[]) => {
    onChange({ ...query, eventsStatsGroups });
    onRunQuery();
  };
  const onEventsStatsSortChange = (eventsStatsSort: string) => {
    onChange({ ...query, eventsStatsSort });
    onRunQuery();
  };
  const onEventsStatsLimitChange = (eventsStatsLimit?: number) => {
    onChange({ ...query, eventsStatsLimit });
  };
  return (
    <>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.EventsStats.Query.tooltip}
          label={selectors.components.QueryEditor.EventsStats.Query.label}
          width={'100%'}
        >
          <QueryField
            query={query.eventsStatsQuery}
            onChange={(val) => onEventsStatsQueryChange(val)}
            onRunQuery={onRunQuery}
            placeholder={selectors.components.QueryEditor.EventsStats.Query.placeholder}
            portalOrigin="Sentry"
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.EventsStats.YAxis.tooltip}
          label={selectors.components.QueryEditor.EventsStats.YAxis.label}
          width={50}
        >
          <TagsInput
            placeholder={selectors.components.QueryEditor.EventsStats.YAxis.placeholder}
            onChange={onEventsStatsYAxisChange}
            tags={query.eventsStatsYAxis}
            width={70}
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.EventsStats.Groups.tooltip}
          label={selectors.components.QueryEditor.EventsStats.Groups.label}
          width={50}
        >
          <TagsInput
            placeholder={selectors.components.QueryEditor.EventsStats.Groups.placeholder}
            onChange={onEventsStatsGroupsChange}
            tags={query.eventsStatsGroups}
            width={70}
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField
            tooltip={selectors.components.QueryEditor.EventsStats.Sort.tooltip}
            label={selectors.components.QueryEditor.EventsStats.Sort.label}
          >
            <Input
              value={query.eventsStatsSort}
              onChange={(e) => onEventsStatsSortChange(e.currentTarget.value)}
              onBlur={onRunQuery}
              width={32}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.EventsStats.Sort.placeholder}
            />
          </EditorField>
          <EditorField
            tooltip={selectors.components.QueryEditor.EventsStats.Limit.tooltip}
            label={selectors.components.QueryEditor.EventsStats.Limit.label}
          >
            <Input
              value={query.eventsStatsLimit}
              type="number"
              onChange={(e) => onEventsStatsLimitChange(e.currentTarget.valueAsNumber)}
              onBlur={onRunQuery}
              width={32}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.EventsStats.Limit.placeholder}
            />
          </EditorField>
        </EditorFieldGroup>
      </EditorRow>
    </>
  );
};
