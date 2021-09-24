import { getTemplateSrv } from '@grafana/runtime';
import { SentryVariableQuery } from './../types';

export const replaceSentryVariableQuery = (query: SentryVariableQuery): SentryVariableQuery => {
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
        projectId: getTemplateSrv().replace(query.projectId),
      };
    default:
      return query;
  }
};
