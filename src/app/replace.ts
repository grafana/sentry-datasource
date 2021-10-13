import flatten from 'lodash/flatten';
import { ScopedVars } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { SentryQuery, SentryVariableQuery } from './../types';

export const replaceProjectIDs = (projectIds: string[]): string[] => {
  return flatten(
    (projectIds || []).map((pid) => {
      return (getTemplateSrv().replace(pid, {}, 'csv') || '').split(',');
    })
  );
};

export const applyTemplateVariables = (query: SentryQuery, scopedVars: ScopedVars): SentryQuery => {
  switch (query.queryType) {
    case 'issues':
      return {
        ...query,
        orgSlug: getTemplateSrv().replace(query.orgSlug || '', scopedVars),
        issuesQuery: getTemplateSrv().replace(query.issuesQuery || '', scopedVars),
        projectIds: flatten(
          (query.projectIds || []).map((pid) => {
            return (getTemplateSrv().replace(pid, scopedVars, 'csv') || '').split(',');
          })
        ),
        environments: flatten(
          (query.environments || []).map((e) => {
            return (getTemplateSrv().replace(e, scopedVars, 'csv') || '').split(',');
          })
        ),
      };
    default:
      return query;
  }
};

export const applyTemplateVariablesToVariableQuery = (query: SentryVariableQuery): SentryVariableQuery => {
  switch (query.type) {
    case 'organizations':
      return {
        ...query,
      };
    case 'projects':
      return {
        ...query,
        orgSlug: getTemplateSrv().replace(query.orgSlug),
      };
    case 'environments':
      return {
        ...query,
        orgSlug: getTemplateSrv().replace(query.orgSlug),
        projectIds: (query.projectIds || []).map((projectId) => getTemplateSrv().replace(projectId)),
      };
    default:
      return query;
  }
};
