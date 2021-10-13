import React from 'react';
import { Error } from '../components/Error';
import { TypeSelector } from '../components/variable-query-editor/TypeSelector';
import { ProjectSelector } from '../components/variable-query-editor/ProjectSelector';
import { SentryDataSource } from './../datasource';
import { SentryVariableQuery, VariableQueryType } from './../types';

type SentryVariableEditorProps = {
  query: SentryVariableQuery;
  datasource: SentryDataSource;
  onChange: (query: SentryVariableQuery, definition: string) => void;
};

export const SentryVariableEditor = ({ query, onChange, datasource }: SentryVariableEditorProps) => {
  const orgSlug = datasource.getOrgSlug();
  if (!orgSlug) {
    return (
      <Error message="Error loading org slug from the configuration. Make sure you have the correct org slug specified in the data source configuration." />
    );
  }
  const onVariableQueryTypeChange = (type: VariableQueryType) => {
    const newQuery: SentryVariableQuery = { ...query, type } as SentryVariableQuery;
    onChange(newQuery, JSON.stringify(newQuery));
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
      {query.type === 'environments' && (
        <div className="gf-form" data-testid="variable-query-editor-environments-filter">
          <ProjectSelector
            mode="id"
            datasource={datasource}
            orgSlug={orgSlug || ''}
            values={query.projectIds || []}
            onValuesChange={onProjectIdsChange}
          ></ProjectSelector>
        </div>
      )}
    </>
  );
};
