import React from 'react';
import { TypeSelector } from '../components/variable-query-editor/TypeSelector';
import { OrganizationSelector } from '../components/variable-query-editor/OrganizationSelector';
import { ProjectSelector } from '../components/variable-query-editor/ProjectSelector';
import { SentryDataSource } from './../datasource';
import { SentryVariableQuery, VariableQueryType } from './../types';

type SentryVariableEditorProps = {
  query: SentryVariableQuery;
  datasource: SentryDataSource;
  onChange: (query: SentryVariableQuery, definition: string) => void;
};

export const SentryVariableEditor = ({ query, onChange, datasource }: SentryVariableEditorProps) => {
  const onVariableQueryTypeChange = (type: VariableQueryType) => {
    const newQuery: SentryVariableQuery = { ...query, type } as SentryVariableQuery;
    onChange(newQuery, JSON.stringify(newQuery));
  };
  const onOrgSlugChange = (orgSlug: string) => {
    if (query.type === 'projects' || query.type === 'environments') {
      let newQuery: SentryVariableQuery = { ...query, orgSlug };
      onChange(newQuery, JSON.stringify(newQuery));
    }
  };
  const onProjectIdsChange = (projectIds: string[]) => {
    if (query.type === 'environments') {
      const newQuery: SentryVariableQuery = { ...query, projectIds };
      onChange(newQuery, JSON.stringify(newQuery));
    }
  };
  return (
    <>
      <TypeSelector variableQueryType={query.type} onChange={onVariableQueryTypeChange}></TypeSelector>
      {(query.type === 'projects' || query.type === 'environments') && (
        <div className="gf-form" data-testid="variable-query-editor-projects-filter">
          <OrganizationSelector
            datasource={datasource}
            orgSlug={query.orgSlug || ''}
            onOrgSlugChange={onOrgSlugChange}
          ></OrganizationSelector>
        </div>
      )}
      {query.type === 'environments' && (
        <div className="gf-form" data-testid="variable-query-editor-environments-filter">
          <ProjectSelector
            mode="id"
            datasource={datasource}
            orgSlug={query.orgSlug || ''}
            values={query.projectIds || []}
            onValuesChange={onProjectIdsChange}
          ></ProjectSelector>
        </div>
      )}
    </>
  );
};
