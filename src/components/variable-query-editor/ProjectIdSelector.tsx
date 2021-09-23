import React, { useState, useEffect } from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryProject } from '../../types';

export const ProjectIdSelector = (props: {
  datasource: SentryDataSource;
  orgSlug: string;
  projectId: string;
  onProjectIdChange: (projSlug: string, projName: string, projId: string) => void;
  label?: string;
  tooltip?: string;
}) => {
  const { datasource, projectId, orgSlug } = props;
  const { label, tooltip, container } = selectors.components.VariablesEditor.Project;
  const [projects, setProjects] = useState<SentryProject[]>([]);
  useEffect(() => {
    if (orgSlug) {
      datasource.getProjects(orgSlug).then(setProjects).catch(console.error);
    }
  }, [datasource, orgSlug]);
  const getOptions = () => {
    return projects.map((p) => {
      return {
        value: p.id,
        label: p.name,
      };
    });
  };
  const onProjectIdChange = (projectId: string) => {
    const matchingProject = projects.find((o) => o.id === projectId);
    if (matchingProject) {
      props.onProjectIdChange(matchingProject.slug, matchingProject.name, matchingProject.id);
    }
  };
  return (
    <>
      <InlineFormLabel tooltip={props.tooltip || tooltip}>{props.label || label}</InlineFormLabel>
      <div data-testid="variable-query-editor-project-select-container" aria-label={container.ariaLabel}>
        <Select value={projectId} options={getOptions()} onChange={(e) => onProjectIdChange(e.value || '')} className="width-30"></Select>
      </div>
    </>
  );
};
