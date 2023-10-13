import React from 'react';
import { Field, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import type { SelectableValue } from '@grafana/data';
import type { VariableQueryType } from '../../types';

export const TypeSelector = (props: {
  variableQueryType: VariableQueryType;
  onChange: (type: VariableQueryType) => void;
}) => {
  const options: Array<SelectableValue<VariableQueryType>> = [
    { value: 'projects', label: 'Projects' },
    { value: 'environments', label: 'Environments' },
    { value: 'teams', label: 'Teams' },
  ];
  const { label, tooltip, id } = selectors.components.VariablesEditor.QueryType;
  return (
    <Field description={tooltip} label={label} data-testid={id}>
      <Select<VariableQueryType>
        value={props.variableQueryType}
        options={options}
        onChange={(e) => props.onChange(e.value as VariableQueryType)}
        width={25}
      />
    </Field>
  );
};
