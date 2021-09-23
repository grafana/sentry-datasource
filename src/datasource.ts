import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
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
    return new Promise((resolve, reject) => {
      if (query && query.type === 'organizations') {
        this.getOrganizations()
          .then((organizations) => {
            resolve(
              organizations.map((o) => {
                return {
                  value: o.slug,
                  text: o.name,
                };
              })
            );
          })
          .catch(reject);
      } else if (query && query.type === 'projects') {
        if (query.orgSlug) {
          this.getProjects(query.orgSlug)
            .then((projects) => {
              resolve(
                projects.map((p) => {
                  return {
                    value: p.slug,
                    text: p.name,
                  };
                })
              );
            })
            .catch(reject);
        } else {
          resolve([]);
        }
      } else {
        reject('invalid query');
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
