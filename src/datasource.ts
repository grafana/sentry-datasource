import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { replaceSentryVariableQuery } from './app/replace';
import {
  ResourceCallOrganizationsResponse,
  ResourceCallProjectsResponse,
  SentryConfig,
  SentryQuery,
  SentryResourceCallQuery,
  SentryResourceCallResponse,
  SentryVariableQuery,
} from './types';

export class SentryDataSource extends DataSourceWithBackend<SentryQuery, SentryConfig> {
  constructor(instanceSettings: DataSourceInstanceSettings<SentryConfig>) {
    super(instanceSettings);
  }
  metricFindQuery(query: SentryVariableQuery): Promise<MetricFindValue[]> {
    query = replaceSentryVariableQuery(query);
    return new Promise((resolve, reject) => {
      if (query && query.type === 'organizations') {
        this.getOrganizations()
          .then((organizations) => {
            resolve(
              organizations.map((organization) => {
                return {
                  value: organization.slug,
                  text: organization.name,
                };
              })
            );
          })
          .catch(reject);
      } else if (query && query.type === 'projects' && query.orgSlug) {
        const orgSlug = query.orgSlug;
        this.getProjects(orgSlug)
          .then((projects) => {
            resolve(
              projects.map((project) => {
                return {
                  value: project.slug,
                  text: project.name,
                };
              })
            );
          })
          .catch(reject);
      } else if (query && query.type === 'environments' && query.orgSlug && query.projectId) {
        const orgSlug = query.orgSlug;
        const projectId = query.projectId;
        this.getProjects(orgSlug)
          .then((projects) => {
            let matchingProject = projects.find((p) => p.id === projectId);
            if (matchingProject) {
              resolve(
                (matchingProject.environments || []).map((environment) => {
                  return {
                    text: environment,
                    value: environment,
                  };
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
  private postResourceLocal(body: SentryResourceCallQuery): Promise<SentryResourceCallResponse> {
    return this.postResource('', body);
  }
  getOrganizations(): Promise<ResourceCallOrganizationsResponse> {
    return this.postResourceLocal({ type: 'organizations' }) as Promise<ResourceCallOrganizationsResponse>;
  }
  getProjects(orgSlug: string): Promise<ResourceCallProjectsResponse> {
    return this.postResourceLocal({ type: 'projects', orgSlug }) as Promise<ResourceCallProjectsResponse>;
  }
}
