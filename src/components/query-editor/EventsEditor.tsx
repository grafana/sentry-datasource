import React from 'react';
import { Input, QueryField, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import { SentryEventSortOptions } from '../../constants';
import type { SentryEventSort, SentryEventsQuery } from '../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/experimental';

interface EventsEditorProps {
  query: SentryEventsQuery;
  onChange: (value: SentryEventsQuery) => void;
  onRunQuery: () => void;
}

export const EventsEditor = ({ query, onChange, onRunQuery }: EventsEditorProps) => {
  const onEventsQueryChange = (eventsQuery: string) => {
    onChange({ ...query, eventsQuery });
  };
  const onEventsExtraFieldsChange = (eventsExtraFields: string[]) => {
    onChange({ ...query, eventsExtraFields });
    onRunQuery();
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
        <EditorField
          tooltip={selectors.components.QueryEditor.Events.ExtraFields.tooltip}
          label={selectors.components.QueryEditor.Events.ExtraFields.label}
          width={'100%'}
        >
          <Select
            isMulti={true}
            options={query.eventsExtraFields?.map(field => ({ label: field, value: field })) || []}
            value={query.eventsExtraFields?.map(field => ({ label: field, value: field })) || []}
            onChange={(values) => onEventsExtraFieldsChange(
              (values || []).map((v: { value: string }) => v.value)
                .filter((v: unknown): v is string => v !== undefined)
            )}
            allowCustomValue={true}
            placeholder={selectors.components.QueryEditor.Events.ExtraFields.placeholder}
            width={'auto'}
            maxVisibleValues={20}
            showAllSelectedWhenOpen={true}
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
