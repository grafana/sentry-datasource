import type { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, MetricFindValue, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { Observable } from 'rxjs';
import { applyTemplateVariables, applyTemplateVariablesToVariableQuery } from './app/replace';
import { getEnvironmentNamesFromProject } from './app/utils';
import type {
  GetResourceCallGetTeamsProjectsPath,
  GetResourceCallListOrgTeamsPath,
  GetResourceCallProjectsPath,
  SentryConfig,
  SentryOrganization,
  SentryProject,
  SentryQuery,
  SentryTag,
  SentryTeam,
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
  private getProjectsAsMetricFindValue = (projects: SentryProject[]): MetricFindValue[] => {
    return projects.map((project) => {
      return {
        value: project.id,
        text: `${project.name} (${project.id})`,
      };
    });
  };
  metricFindQuery(query: SentryVariableQuery): Promise<MetricFindValue[]> {
    query = applyTemplateVariablesToVariableQuery(query);
    return new Promise((resolve, reject) => {
      if (query && query.type === 'teams') {
        this.getOrgTeams(this.getOrgSlug())
          .then((teams) => {
            resolve(
              teams.map((team) => {
                return {
                  value: team.slug,
                  text: `${team.name} (${team.slug})`,
                };
              })
            );
          })
          .catch(reject);
      } else if (query && query.type === 'projects') {
        if (query.teamSlug) {
          this.getTeamsProjects(this.getOrgSlug(), query.teamSlug)
            .then((projects) => resolve(this.getProjectsAsMetricFindValue(projects)))
            .catch(reject);
        } else {
          this.getProjects(this.getOrgSlug())
            .then((projects) => resolve(this.getProjectsAsMetricFindValue(projects)))
            .catch(reject);
        }
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

  getTags(orgSlug: string = this.getOrgSlug()): Promise<SentryTag[]> {
    const replacedOrgSlug: string = getTemplateSrv().replace(orgSlug);
    return this.getResource<SentryTag[]>(`api/0/organizations/${replacedOrgSlug}/tags`);
  }

  getOrganizations(): Promise<SentryOrganization[]> {
    return this.getResource<SentryOrganization[]>('api/0/organizations');
  }
  getProjects(orgSlug: string): Promise<SentryProject[]> {
    const replacedOrgSlug: string = getTemplateSrv().replace(orgSlug);
    return this.getResource<SentryProject[]>(`api/0/organizations/${replacedOrgSlug}/projects` as GetResourceCallProjectsPath, {});
  }
  getTeamsProjects(orgSlug: string, teamSlug: string): Promise<SentryProject[]> {
    const replacedOrgSlug: string = getTemplateSrv().replace(orgSlug || '');
    const replacedTeamSlug: string = getTemplateSrv().replace(teamSlug || '');
    if (replacedOrgSlug === '' || replacedTeamSlug === '') {
      return Promise.reject('invalid arguments');
    }
    return this.getResource<SentryProject[]>(
      `api/0/teams/${replacedOrgSlug}/${replacedTeamSlug}/projects` as GetResourceCallGetTeamsProjectsPath,
      {}
    );
  }
  getOrgTeams(orgSlug: string): Promise<SentryTeam[]> {
    const replacedOrgSlug: string = getTemplateSrv().replace(orgSlug);
    return this.getResource<SentryTeam[]>(
      `api/0/organizations/${replacedOrgSlug}/teams` as GetResourceCallListOrgTeamsPath,
      {}
    );
  }
  //#endregion
}
