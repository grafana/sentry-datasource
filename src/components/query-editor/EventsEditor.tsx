import { SelectableValue } from '@grafana/data';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { Input, QueryField, Select } from '@grafana/ui';
import { SentryDataSource } from 'datasource';
import { sortBy } from 'lodash';
import React, { useEffect } from 'react';
import { SentryEventSortDirectionOptions, SentryEventSortOptions } from '../../constants';
import { selectors } from '../../selectors';
import type { SentryEventSort, SentryEventsQuery, SentrySortDirection, SentrySpansQuery } from '../../types';

interface EventsEditorProps {
  query: SentryEventsQuery | SentrySpansQuery;
  onChange: (value: SentryEventsQuery | SentrySpansQuery) => void;
  onRunQuery: () => void;
  datasource: SentryDataSource;
}

// A list of fields that are to be fetched from the sentry API.
// This is used to build the default query string.
const EVENTS_DEFAULT_FIELDS = [
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
  'platform',
];
const SPANS_DEFAULT_FIELDS = [
  'id',
  "span.op",
  "span.description",
  'count()',
];

type Option = SelectableValue<string>;


const toOptions = (fields: string[]): Option[] => fields.map((field) => ({ icon: 'text-fields', label: field, value: field }));

export const EventsEditor = ({ query, onChange, onRunQuery, datasource }: EventsEditorProps) => {
  const suggestFields = async () => datasource.getTags().then((tags) => tags.map((tag) => ({ icon: 'tag-alt', label: `tags[${tag.key}]`, value: `tags[${tag.key}]` })));
  return <EventsLikeEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} defaultFields={EVENTS_DEFAULT_FIELDS} suggestFields={suggestFields} />;
};

export const SpansEditor = ({ query, onChange, onRunQuery, datasource }: EventsEditorProps) => {
  const suggestFields = async () => datasource.getAttributes().then((attr) => attr.map((attr) => ({ icon: 'tag-alt', label: attr.key, value: attr.key })));
  return <EventsLikeEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} defaultFields={SPANS_DEFAULT_FIELDS} suggestFields={suggestFields}/>;
};

const EventsLikeEditor = ({ query, onChange, onRunQuery, defaultFields, suggestFields }: EventsEditorProps & {defaultFields: string[], suggestFields: () => Promise<Option[]> }) => {
  const [customOptions, setCustomOptions] = React.useState<Option[]>([]);
  const [fieldOptions, setFieldOptions] = React.useState<Option[]>([]);
  useEffect(() => {
    suggestFields().then((fields)=> {
      setFieldOptions(sortBy([
        ...toOptions(defaultFields),
        ...fields,
      ], 'label'))
    });
  }, [defaultFields, suggestFields]);

  if (!query.eventsFields) {
    onChange({
      ...query,
      eventsFields: defaultFields,
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
  const onEventsSortChange = (eventsSort: SentryEventSort | undefined) => {
    onChange({ ...query, eventsSort: eventsSort });
    onRunQuery();
  };
  const onEventsSortDirectionChange = (eventsSortDirection: SentrySortDirection) => {
    onChange({ ...query, eventsSortDirection: eventsSortDirection });
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
            value={query.eventsFields?.map((field) => ({ label: field, value: field })) || []}
            onChange={(values) =>
              onEventsFieldsChange((values || []).map((v: { value: string }) => v.value).filter(Boolean))
            }
            allowCustomValue={true}
            onCreateOption={(v) => {
              const customValue = { label: v, value: v, icon: 'pen' };
              setCustomOptions([...customOptions, customValue]);
              onEventsFieldsChange([...(query.eventsFields || []), v]);
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
          {query.eventsSort && (
            <EditorField tooltip={''} label={'Sort Direction'}>
              <Select
                options={SentryEventSortDirectionOptions}
                value={query.eventsSortDirection || 'desc'}
                width={18}
                onChange={(e) => onEventsSortDirectionChange(e?.value!)}
                className="inline-element"
                allowCustomValue={false}
                isClearable={false}
              />
            </EditorField>
          )}
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
