import { Observable } from 'rxjs';
import { DataSourceInstanceSettings, MetricFindValue, DataQueryRequest, DataQueryResponse, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { applyTemplateVariables, applyTemplateVariablesToVariableQuery } from './app/replace';
import { getEnvironmentNamesFromProject } from './app/utils';
import {
  GetResourceCall,
  SentryConfig,
  SentryQuery,
  SentryVariableQuery,
  SentryOrganization,
  SentryProject,
  GetResourceCallOrganizations,
  GetResourceCallProjects,
} from './types';

export class SentryDataSource extends DataSourceWithBackend<SentryQuery, SentryConfig> {
  constructor(private instanceSettings: DataSourceInstanceSettings<SentryConfig>) {
    super(instanceSettings);
  }
  annotations = {};
  filterQuery(query: SentryQuery): boolean {
    return !(query.hide === true);
  }
  interpolateVariablesInQueries(queries: SentryQuery[], scopedVars: ScopedVars): SentryQuery[] {
    return queries.map((q) => {
      return applyTemplateVariables(q, scopedVars);
    });
  }
  applyTemplateVariables(query: SentryQuery, scopedVars: ScopedVars): SentryQuery {
    return applyTemplateVariables(query, scopedVars);
  }
  query(request: DataQueryRequest<SentryQuery>): Observable<DataQueryResponse> {
    return super.query({ ...request, targets: request.targets });
  }
  getOrgSlug(): string {
    return this.instanceSettings.jsonData?.orgSlug || '';
  }
  metricFindQuery(query: SentryVariableQuery): Promise<MetricFindValue[]> {
    query = applyTemplateVariablesToVariableQuery(query);
    return new Promise((resolve, reject) => {
      if (query && query.type === 'projects') {
        this.getProjects(this.getOrgSlug())
          .then((projects) => {
            resolve(
              projects.map((project) => {
                return {
                  value: project.id,
                  text: `${project.name} (${project.id})`,
                };
              })
            );
          })
          .catch(reject);
      } else if (query && query.type === 'environments') {
        this.getProjects(this.getOrgSlug())
          .then((projects) => {
            if (query.type === 'environments') {
              const environments = getEnvironmentNamesFromProject(projects, query.projectIds);
              resolve(
                environments.map((e) => {
                  return { value: e, text: e };
                })
              );
            } else {
              resolve([]);
            }
          })
          .catch(reject);
      } else {
        resolve([]);
      }
    });
  }
  //#region Resource calls
  getResource<O extends GetResourceCall>(path: O['path'], params?: O['query']): Promise<O['response']> {
    return super.getResource(path, params);
  }
  getOrganizations(): Promise<SentryOrganization[]> {
    return this.getResource<GetResourceCallOrganizations>('api/0/organizations');
  }
  getProjects(orgSlug: string): Promise<SentryProject[]> {
    const replacedOrgSlug = getTemplateSrv().replace(orgSlug);
    return this.getResource<GetResourceCallProjects>(`api/0/organizations/${replacedOrgSlug}/projects`, {});
  }
  //#endregion
}
