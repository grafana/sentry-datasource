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

// A list of fields that are to be fetched from the sentry API. 
// This is used to build the default query string.
const DEFAULT_FIELDS = [
  'id',
  'title',
  'project',
  'project.id',
  'release',
  'count()',
  'epm()',
  'last_seen()',
  'level',
  'event.type',
  'platform'
];

const fieldOptions = DEFAULT_FIELDS.map(field => ({
  label: field,
  value: field
}));

export const EventsEditor = ({ query, onChange, onRunQuery }: EventsEditorProps) => {
  const [customOptions, setCustomOptions] = React.useState<Array<{ label: string, value: string }>>([]);
  if (!query.eventsFields) {
    onChange({
      ...query,
      eventsFields: DEFAULT_FIELDS
    });
    onRunQuery();
  }

  const onEventsQueryChange = (eventsQuery: string) => {
    onChange({ ...query, eventsQuery });
  };
  const onEventsFieldsChange = (eventsFields: string[]) => {
    onChange({ ...query, eventsFields: eventsFields });
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
          tooltip={selectors.components.QueryEditor.Events.Fields.tooltip}
          label={selectors.components.QueryEditor.Events.Fields.label}
          width={'100%'}
        >
          <Select
            isMulti={true}
            options={[...fieldOptions, ...customOptions]}
            value={query.eventsFields?.map(field => ({ label: field, value: field })) || []}
            onChange={(values) => onEventsFieldsChange(
              (values || []).map((v: { value: string }) => v.value)
                .filter(Boolean)
            )}
            allowCustomValue={true}
            onCreateOption={(v) => {
              const customValue = { label: v, value: v };
              setCustomOptions([...customOptions, customValue]);
              onEventsFieldsChange([
                ...(query.eventsFields || []),
                v
              ]);
            }}
            placeholder={selectors.components.QueryEditor.Events.Fields.placeholder}
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
