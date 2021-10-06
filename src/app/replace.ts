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
        projectIds: (query.projectIds || []).map((projectId) => getTemplateSrv().replace(projectId)),
      };
    default:
      return query;
  }
};
