import React from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import type { SelectableValue } from '@grafana/data/types';
import type { VariableQueryType } from '../../types';

export const TypeSelector = (props: { variableQueryType: VariableQueryType; onChange: (type: VariableQueryType) => void }) => {
  const options: Array<SelectableValue<VariableQueryType>> = [
    { value: 'projects', label: 'Projects' },
    { value: 'environments', label: 'Environments' },
    { value: 'teams', label: 'Teams' },
  ];
  const { label, tooltip, container } = selectors.components.VariablesEditor.QueryType;
  return (
    <div className="gf-form" data-testid="variable-query-editor-query-type-selector-container">
      <InlineFormLabel tooltip={tooltip}>{label}</InlineFormLabel>
      <div data-testid="variable-query-editor-query-type-select-container" aria-label={container.ariaLabel}>
        <Select<VariableQueryType>
          value={props.variableQueryType}
          options={options}
          onChange={(e) => props.onChange(e.value as VariableQueryType)}
          className="width-30"
        ></Select>
      </div>
    </div>
  );
};
