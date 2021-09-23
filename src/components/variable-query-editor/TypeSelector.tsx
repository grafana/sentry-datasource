import React from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineFormLabel, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import { VariableQueryType } from '../../types';

export const TypeSelector = (props: { variableQueryType: VariableQueryType; onChange: (type: VariableQueryType) => void }) => {
  const options: Array<SelectableValue<VariableQueryType>> = [
    { value: 'organizations', label: 'Organizations' },
    { value: 'projects', label: 'Projects' },
  ];
  const { label, tooltip, container } = selectors.components.VariablesEditor.QueryType;
  return (
    <div className="gf-form" data-testid="variable-query-editor-query-type-selector-container">
      <InlineFormLabel tooltip={tooltip}>{label}</InlineFormLabel>
      <div data-testid="variable-query-editor-query-type-select-container" aria-label={container.ariaLabel}>
        <Select<VariableQueryType>
          options={options}
          onChange={(e) => props.onChange(e.value as VariableQueryType)}
          className="width-30"
        ></Select>
      </div>
    </div>
  );
};
