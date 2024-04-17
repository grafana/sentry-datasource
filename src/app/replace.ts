import flatten from 'lodash/flatten';
import { getTemplateSrv } from '@grafana/runtime';
import type { ScopedVars } from '@grafana/data';
import type { SentryQuery, SentryVariableQuery } from './../types';

const interpolateVariable = (query: string, scopedVars?: ScopedVars): string => {
  return getTemplateSrv().replace(query, scopedVars);
};

const interpolateVariableArray = (queries: string[], scopedVars?: ScopedVars): string[] => {
  return flatten(
    (queries || []).map((q) => {
      return (getTemplateSrv().replace(q, scopedVars, 'csv') || '').split(',');
    })
  );
};

export const replaceProjectIDs = interpolateVariableArray;

export const applyTemplateVariables = (query: SentryQuery, scopedVars: ScopedVars): SentryQuery => {
  switch (query.queryType) {
    case 'issues':
      return {
        ...query,
        issuesQuery: interpolateVariable(query.issuesQuery || '', scopedVars),
        projectIds: interpolateVariableArray(query.projectIds, scopedVars),
        environments: interpolateVariableArray(query.environments, scopedVars),
      };
    case 'events':
      return {
        ...query,
        eventsQuery: interpolateVariable(query.eventsQuery || '', scopedVars),
        projectIds: interpolateVariableArray(query.projectIds, scopedVars),
        environments: interpolateVariableArray(query.environments, scopedVars),
      };
    case 'eventsStats':
      return {
        ...query,
        eventsStatsQuery: interpolateVariable(query.eventsStatsQuery || '', scopedVars),
        projectIds: interpolateVariableArray(query.projectIds, scopedVars),
        environments: interpolateVariableArray(query.environments, scopedVars),
      };
    case 'statsV2':
      return {
        ...query,
        projectIds: interpolateVariableArray(query.projectIds, scopedVars),
      };
    default:
      return query;
  }
};

export const applyTemplateVariablesToVariableQuery = (query: SentryVariableQuery): SentryVariableQuery => {
  switch (query.type) {
    case 'projects':
      return {
        ...query,
      };
    case 'environments':
      return {
        ...query,
        projectIds: (query.projectIds || []).map((projectId) => getTemplateSrv().replace(projectId)),
      };
    default:
      return query;
  }
};
