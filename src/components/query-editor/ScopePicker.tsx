import React, { useState, useEffect } from 'react';
import { getTemplateSrv } from '@grafana/runtime';
import { MultiSelect } from '@grafana/ui';
import { SentryDataSource } from './../../datasource';
import { getEnvironmentNamesFromProject } from './../../app/utils';
import { replaceProjectIDs } from './../../app/replace';
import { selectors } from './../../selectors';
import type { QueryEditorProps, SelectableValue } from '@grafana/data';
import type { SentryConfig, SentryProject, SentryQuery } from './../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/experimental';

type ScopePickerProps = { hideEnvironments?: boolean } & Pick<
  QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>,
  'datasource' | 'query' | 'onChange' | 'onRunQuery'
>;

export const ScopePicker = (props: ScopePickerProps) => {
  const { query, onChange, onRunQuery, datasource, hideEnvironments = false } = props;
  const { projectIds } = query;
  const environments = query.queryType === 'issues' || query.queryType === 'events' ? query.environments : [];
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
    onChange({ ...query, projectIds, environments: projectIds.length > 0 ? filteredEnvironments : [] } as SentryQuery);
    onRunQuery();
  };
  const onEnvironmentsChange = (environments: string[] = []) => {
    onChange({ ...query, environments } as SentryQuery);
    onRunQuery();
  };
  return (
    <EditorRow>
      <EditorFieldGroup>
        <EditorField
          tooltip={selectors.components.QueryEditor.Scope.ProjectIDs.tooltip}
          label={selectors.components.QueryEditor.Scope.ProjectIDs.label}
        >
          <MultiSelect
            width={30}
            value={projectIds}
            onChange={(projects) => onProjectIDsChange(projects.map((p) => p.value!))}
            options={getProjectsAsOptions()}
            placeholder={selectors.components.QueryEditor.Scope.ProjectIDs.placeholder}
          />
        </EditorField>
        {!hideEnvironments && (
          <EditorField
            tooltip={selectors.components.QueryEditor.Scope.Environments.tooltip}
            label={selectors.components.QueryEditor.Scope.Environments.label}
          >
            <MultiSelect
              width={30}
              value={environments}
              onChange={(e) => onEnvironmentsChange(e.map((ei) => ei.value!))}
              options={getEnvironmentsAsOptions()}
              placeholder={selectors.components.QueryEditor.Scope.Environments.placeholder}
            />
          </EditorField>
        )}
      </EditorFieldGroup>
    </EditorRow>
  );
};
