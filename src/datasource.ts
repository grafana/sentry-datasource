import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
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
      if (!query || (query && query.type === 'organizations')) {
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
                  value: project.id,
                  text: `${project.name} (${project.id})`,
                };
              })
            );
          })
          .catch(reject);
      } else if (query && query.type === 'environments' && query.orgSlug) {
        const orgSlug = query.orgSlug;
        this.getProjects(orgSlug)
          .then((projects) => {
            if (query.type === 'environments') {
              if (query.projectIds && query.projectIds.length > 0) {
                const environments: string[] = uniq(
                  flatten(
                    projects
                      .filter((p) => {
                        return query.type === 'environments' && query.projectIds.includes(p.id);
                      })
                      .map((p) => p.environments || [])
                  )
                );
                resolve(
                  environments.map((e) => {
                    return { value: e, text: e };
                  })
                );
              } else {
                const environments: string[] = uniq(flatten(projects.map((p) => p.environments || [])));
                resolve(
                  environments.map((e) => {
                    return { value: e, text: e };
                  })
                );
              }
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
    const replacedOrgSlug = getTemplateSrv().replace(orgSlug);
    return this.postResourceLocal({ type: 'projects', orgSlug: replacedOrgSlug }) as Promise<ResourceCallProjectsResponse>;
  }
}
