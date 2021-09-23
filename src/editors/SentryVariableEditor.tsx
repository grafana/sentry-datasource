import React from 'react';
import { TypeSelector } from '../components/variable-query-editor/TypeSelector';
import { OrgSlugSelector } from '../components/variable-query-editor/OrgSlugSelector';
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
    const newQuery: SentryVariableQuery = { ...query, type };
    onChange(newQuery, JSON.stringify(newQuery));
  };
  const onOrgSlugChange = (orgSlug: string, orgName: string, orgId: string) => {
    if (query.type === 'projects') {
      const newQuery: SentryVariableQuery = { ...query, orgSlug, orgName, orgId };
      onChange(newQuery, JSON.stringify(newQuery));
    }
  };
  return (
    <>
      <TypeSelector variableQueryType={query.type} onChange={onVariableQueryTypeChange}></TypeSelector>
      {query.type === 'projects' && (
        <div className="gf-form" data-testid="variable-query-editor-projects-filter">
          <OrgSlugSelector datasource={datasource} orgSlug={query.orgSlug || ''} onOrgSlugChange={onOrgSlugChange} />
        </div>
      )}
    </>
  );
};
