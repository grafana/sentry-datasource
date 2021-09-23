import React from 'react';
import { TypeSelector } from '../components/variable-query-editor/TypeSelector';
import { OrgSlugSelector } from '../components/variable-query-editor/OrgSlugSelector';
import { ProjectIdSelector } from '../components/variable-query-editor/ProjectIdSelector';
import { SentryDataSource } from './../datasource';
import { SentryVariableQuery, VariableQueryType } from './../types';

type SentryVariableEditorProps = {
  query: SentryVariableQuery;
  datasource: SentryDataSource;
  onChange: (query: SentryVariableQuery, definition: string) => void;
};

export const SentryVariableEditor = ({ query, onChange, datasource }: SentryVariableEditorProps) => {
  query = query || { type: 'organizations' };
  const onVariableQueryTypeChange = (type: VariableQueryType) => {
    const newQuery: SentryVariableQuery = { ...query, type } as SentryVariableQuery;
    onChange(newQuery, JSON.stringify(newQuery));
  };
  const onOrgSlugChange = (orgSlug: string, orgName: string, orgId: string) => {
    if (query.type === 'projects' || query.type === 'environments') {
      let newQuery: SentryVariableQuery = { ...query, orgSlug };
      onChange(newQuery, JSON.stringify(newQuery));
    }
  };
  const onProjectIdChange = (projectSlug: string, projectName: string, projectId: string) => {
    if (query.type === 'environments') {
      const newQuery: SentryVariableQuery = { ...query, projectId };
      onChange(newQuery, JSON.stringify(newQuery));
    }
  };
  return (
    <>
      <TypeSelector variableQueryType={query.type} onChange={onVariableQueryTypeChange}></TypeSelector>
      {(query.type === 'projects' || query.type === 'environments') && (
        <div className="gf-form" data-testid="variable-query-editor-projects-filter">
          <OrgSlugSelector datasource={datasource} orgSlug={query.orgSlug || ''} onOrgSlugChange={onOrgSlugChange} />
        </div>
      )}
      {query.type === 'environments' && (
        <div className="gf-form" data-testid="variable-query-editor-environments-filter">
          <ProjectIdSelector
            datasource={datasource}
            orgSlug={query.orgSlug || ''}
            projectId={query.projectId || ''}
            onProjectIdChange={onProjectIdChange}
          ></ProjectIdSelector>
        </div>
      )}
    </>
  );
};
