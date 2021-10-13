import React, { useState, useEffect } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InlineFormLabel, MultiSelect } from '@grafana/ui';
import { SentryDataSource } from './../../datasource';
import { getEnvironmentNamesFromProject } from './../../app/utils';
import { replaceProjectIDs } from './../../app/replace';
import { selectors } from './../../selectors';
import { SentryConfig, SentryProject, SentryQuery } from './../../types';

type ScopePickerProps = Pick<
  QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>,
  'datasource' | 'query' | 'onChange' | 'onRunQuery'
>;

export const ScopePicker = (props: ScopePickerProps) => {
  const { query, onChange, onRunQuery, datasource } = props;
  const { projectIds, environments } = query;
  const [projects, setProjects] = useState<SentryProject[]>([]);
  const [allEnvironments, setAllEnvironments] = useState<string[]>([]);
  const orgSlug = datasource.getOrgSlug();
  useEffect(() => {
    if (orgSlug) {
      datasource.getProjects(orgSlug).then(setProjects).catch(console.error);
    }
  }, [datasource, orgSlug]);
  useEffect(() => {
    const updatedProjectIDs = replaceProjectIDs(projectIds);
    setAllEnvironments(getEnvironmentNamesFromProject(projects, updatedProjectIDs));
  }, [projects, projectIds]);
  const getProjectsAsOptions = (): Array<SelectableValue<string>> => {
    return [
      ...projects.map((o) => {
        return { value: o.id, label: o.name };
      }),
      ...(getTemplateSrv().getVariables() || []).map((o) => {
        return { value: `\${${o.name}}`, label: `var: ${o.label || o.name}` };
      }),
    ];
  };
  const getEnvironmentsAsOptions = (): Array<SelectableValue<string>> => {
    return [
      ...allEnvironments.map((e) => {
        return { value: e, label: e };
      }),
      ...(getTemplateSrv().getVariables() || []).map((o) => {
        return { value: `\${${o.name}}`, label: `var: ${o.label || o.name}` };
      }),
    ];
  };
  const onProjectIDsChange = (projectIds: string[] = []) => {
    const applicableEnvironments = getEnvironmentNamesFromProject(projects, projectIds);
    const filteredEnvironments = (environments || []).filter((e) => applicableEnvironments.includes(e));
    onChange({ ...query, projectIds, environments: projectIds.length > 0 ? filteredEnvironments : [] });
    onRunQuery();
  };
  const onEnvironmentsChange = (environments: string[] = []) => {
    onChange({ ...query, environments });
    onRunQuery();
  };
  return (
    <div className="gf-form">
      <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Scope.ProjectIDs.tooltip}>
        {selectors.components.QueryEditor.Scope.ProjectIDs.label}
      </InlineFormLabel>
      <MultiSelect
        width={60}
        value={projectIds}
        onChange={(projects) => onProjectIDsChange(projects.map((p) => p.value!))}
        options={getProjectsAsOptions()}
        className="inline-element"
        placeholder={selectors.components.QueryEditor.Scope.ProjectIDs.placeholder}
      />
      <InlineFormLabel width={8} className="query-keyword" tooltip={selectors.components.QueryEditor.Scope.Environments.tooltip}>
        {selectors.components.QueryEditor.Scope.Environments.label}
      </InlineFormLabel>
      <MultiSelect
        width={60}
        value={environments}
        onChange={(e) => onEnvironmentsChange(e.map((ei) => ei.value!))}
        options={getEnvironmentsAsOptions()}
        className="inline-element"
        placeholder={selectors.components.QueryEditor.Scope.Environments.placeholder}
      />
    </div>
  );
};
