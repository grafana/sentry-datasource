import { Observable } from 'rxjs';
import { DataSourceInstanceSettings, MetricFindValue, DataQueryRequest, DataQueryResponse, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { applyTemplateVariables, applyTemplateVariablesToVariableQuery } from './app/replace';
import { getEnvironmentNamesFromProject } from './app/utils';
import {
  ResourceCallOrganizationsResponse,
  ResourceCallProjectsResponse,
  SentryConfig,
  SentryQuery,
  SentryResourceCallRequest,
  SentryResourceCallResponse,
  SentryVariableQuery,
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
  private postResourceLocal<T extends SentryResourceCallResponse>(body: SentryResourceCallRequest): Promise<T> {
    return this.postResource('', body);
  }
  getOrganizations(): Promise<ResourceCallOrganizationsResponse> {
    return this.postResourceLocal<ResourceCallOrganizationsResponse>({
      type: 'organizations',
    });
  }
  getProjects(orgSlug: string): Promise<ResourceCallProjectsResponse> {
    const replacedOrgSlug = getTemplateSrv().replace(orgSlug);
    return this.postResourceLocal<ResourceCallProjectsResponse>({
      type: 'projects',
      orgSlug: replacedOrgSlug,
    });
  }
}
