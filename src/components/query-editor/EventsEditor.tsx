import React from 'react';
import { Input, QueryField, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import { SentryEventSortOptions } from '../../constants';
import type { SentryEventSort, SentryEventsQuery } from '../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';

interface EventsEditorProps {
  query: SentryEventsQuery;
  onChange: (value: SentryEventsQuery) => void;
  onRunQuery: () => void;
}

export const EventsEditor = ({ query, onChange, onRunQuery }: EventsEditorProps) => {
  const onEventsQueryChange = (eventsQuery: string) => {
    onChange({ ...query, eventsQuery });
  };
  const onEventsSortChange = (eventsSort: SentryEventSort) => {
    onChange({ ...query, eventsSort: eventsSort });
    onRunQuery();
  };
  const onEventsLimitChange = (eventsLimit?: number) => {
    onChange({ ...query, eventsLimit: eventsLimit });
  };
  return (
    <>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.Events.Query.tooltip}
          label={selectors.components.QueryEditor.Events.Query.label}
          width={'100%'}
        >
          <QueryField
            query={query.eventsQuery}
            onChange={(val) => onEventsQueryChange(val)}
            onRunQuery={onRunQuery}
            placeholder={selectors.components.QueryEditor.Events.Query.placeholder}
            portalOrigin="Sentry"
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField
            tooltip={selectors.components.QueryEditor.Events.Sort.tooltip}
            label={selectors.components.QueryEditor.Events.Sort.label}
          >
            <Select
              options={SentryEventSortOptions}
              value={query.eventsSort}
              width={28}
              onChange={(e) => onEventsSortChange(e?.value!)}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Events.Sort.placeholder}
              allowCustomValue={true}
              isClearable={true}
            />
          </EditorField>
          <EditorField
            tooltip={selectors.components.QueryEditor.Events.Limit.tooltip}
            label={selectors.components.QueryEditor.Events.Limit.label}
          >
            <Input
              value={query.eventsLimit}
              type="number"
              onChange={(e) => onEventsLimitChange(e.currentTarget.valueAsNumber)}
              onBlur={onRunQuery}
              width={32}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Events.Limit.placeholder}
            />
          </EditorField>
        </EditorFieldGroup>
      </EditorRow>
    </>
  );
};
