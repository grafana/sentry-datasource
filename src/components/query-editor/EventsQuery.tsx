import React from 'react';
import { Input, Button, Select } from '@grafana/ui';
import { EditorRows, EditorRow, EditorField, Stack } from './@grafana/ui';
import type { SentryEventsQuery, SentryEventsField } from './../../types';

type SentryQueryEditorProps = { query: SentryEventsQuery; onChange: (query: SentryEventsQuery) => void; onRunQuery: () => void };

export const EventsQueryEditor = ({ query, onChange, onRunQuery }: SentryQueryEditorProps) => {
  if (query.queryType !== 'events') {
    return <></>;
  }
  return (
    <EditorRows>
      <QueryEditor queryString={query.query || ''} onChange={(v) => onChange({ ...query, query: v })} onRunQuery={onRunQuery} />
      <FieldsEditor fields={query.fields || []} onChange={(v) => onChange({ ...query, fields: v })} onRunQuery={onRunQuery} />
    </EditorRows>
  );
};

const QueryEditor = (props: { queryString: string; onChange: (queryString: string) => void; onRunQuery: () => void }) => {
  const { queryString, onChange, onRunQuery } = props;
  return (
    <EditorRow>
      <EditorField label="Query" tooltip={'Search for events, users, tags and more'}>
        <Input
          width={120}
          value={queryString}
          onChange={(e) => onChange(e.currentTarget.value)}
          onBlur={onRunQuery}
          placeholder={`Example: (transaction:foo AND release:abc) OR (transaction:[bar,baz] AND release:def)`}
        />
      </EditorField>
    </EditorRow>
  );
};

const FieldsEditor = (props: { fields: SentryEventsField[]; onChange: (fields: SentryEventsField[]) => void; onRunQuery: () => void }) => {
  const { fields = [], onChange, onRunQuery } = props;
  const onFieldAdd = () => {
    const newItems: SentryEventsField[] = [...fields, { fieldType: 'builtin', value: '' }];
    onChange(newItems);
  };
  const onFieldDelete = (index: number) => {
    const newItems = [...fields];
    newItems.splice(index, 1);
    onChange(newItems);
  };
  const onFieldChange = (index: number, newItem: SentryEventsField) => {
    const newItems = [...fields];
    newItems[index] = newItem;
    onChange(newItems);
  };
  return (
    <EditorRow>
      <EditorField label="Fields" optional={true} tooltip={'Select Fields'}>
        <Stack>
          {fields.map((f, index) => (
            <FieldEditor
              key={index}
              index={index}
              field={f}
              onChange={(index, item) => onFieldChange(index, item)}
              onRunQuery={onRunQuery}
              onDelete={onFieldDelete}
            />
          ))}
          <Button onClick={onFieldAdd} icon="plus" variant="secondary" size="md" />
        </Stack>
      </EditorField>
    </EditorRow>
  );
};
const FieldEditor = (props: {
  index: number;
  field: SentryEventsField;
  onChange: (index: number, field: SentryEventsField) => void;
  onRunQuery: () => void;
  onDelete: (index: number) => void;
}) => {
  const { index, field, onChange, onRunQuery, onDelete } = props;
  return (
    <Stack gap={0.3}>
      <Select
        width={16}
        value={field.fieldType || 'builtin'}
        options={[
          { value: 'builtin', label: 'Builtin Field' },
          { value: 'tag_raw', label: 'Tag' },
          { value: 'function_raw', label: 'Function' },
          { value: 'expression_raw', label: 'Expression' },
        ]}
        onChange={(e) => onChange(index, { ...field, fieldType: (e?.value || 'builtin') as any })}
      />
      <Input
        width={20}
        value={field.value}
        onChange={(e) => onChange(index, { ...field, value: e.currentTarget.value })}
        onBlur={onRunQuery}
      />
      <Button onClick={() => onDelete(index)} icon="times" variant="secondary" size="md" style={{ marginLeft: '0px' }} />
    </Stack>
  );
};
