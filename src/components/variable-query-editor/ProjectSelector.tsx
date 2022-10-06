import React, { useState, useEffect } from 'react';
import { InlineFormLabel, MultiSelect } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import type { SentryProject } from '../../types';

export const ProjectSelector = (props: {
  mode: 'slug' | 'id' | 'name';
  datasource: SentryDataSource;
  orgSlug: string;
  values: string[];
  onValuesChange: (projectIds: string[]) => void;
  label?: string;
  tooltip?: string;
}) => {
  const { datasource, values: projectIds, orgSlug, mode } = props;
  const { label, tooltip, container } = selectors.components.VariablesEditor.Project;
  const [projects, setProjects] = useState<SentryProject[]>([]);
  useEffect(() => {
    if (orgSlug) {
      datasource.getProjects(orgSlug).then(setProjects).catch(console.error);
    }
  }, [datasource, orgSlug]);
  const getOptions = () => {
    const templateVariables = getTemplateSrv()
      .getVariables()
      .map((v) => {
        return {
          value: `\${${v.name}}`,
          label: `var: \${${v.name}}`,
        };
      });
    const projectVariables = projects.map((p) => {
      switch (mode) {
        case 'id':
          return { value: p.id, label: `${p.name} (${p.id})` };
        case 'name':
          return { value: p.name, label: p.name };
        case 'slug':
        default:
          return { value: p.slug, label: p.name };
      }
    });
    return [...projectVariables, ...templateVariables];
  };
  const onProjectIdsChange = (projectIds: string[]) => {
    props.onValuesChange(projectIds);
  };
  return (
    <>
      <InlineFormLabel tooltip={props.tooltip || tooltip}>{props.label || label}</InlineFormLabel>
      <div data-testid="variable-query-editor-project-select-container" aria-label={container.ariaLabel}>
        <MultiSelect
          value={projectIds}
          options={getOptions()}
          onChange={(e) => onProjectIdsChange(e.map((ei) => ei.value!))}
          className="width-30"
        ></MultiSelect>
      </div>
    </>
  );
};
