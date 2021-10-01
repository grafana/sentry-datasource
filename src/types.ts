import { DataSourceJsonData, DataQuery } from '@grafana/data';

//#region Constants
//#endregion

//#region Sentry Objects
export type SentryOrganization = {
  id: string;
  name: string;
  slug: string;
  dateCreated: string;
  status: { id: string; name: string };
};
export type SentryProject = {
  id: string;
  name: string;
  slug: string;
  environments: string[];
  team: { id: string; name: string; slug: string };
  teams: Array<{ id: string; name: string; slug: string }>;
};
//#endregion

//#region Config
export interface SentryConfig extends DataSourceJsonData {
  url: string;
}
export interface SentrySecureConfig {
  authToken: string;
}
//#endregion

//#region Query
export interface SentryQuery extends DataQuery {}
//#endregion

//#region Variable Query
export type VariableQueryType = 'organizations' | 'projects' | 'environments';
export type VariableQueryBase<T extends VariableQueryType> = { type: T };
export type VariableQueryOrganizations = { valueField: 'slug' | 'id' | 'name' } & VariableQueryBase<'organizations'>;
export type VariableQueryProjects = { orgSlug: string; valueField: 'slug' | 'id' | 'name' } & VariableQueryBase<'projects'>;
export type VariableQueryEnvironments = { orgSlug: string; projectIds: string[] } & VariableQueryBase<'environments'>;
export type SentryVariableQuery = VariableQueryOrganizations | VariableQueryProjects | VariableQueryEnvironments;
//#endregion

//#region Resource call Query
export type ResourceCallOrganizations = {
  type: 'organizations';
};
export type ResourceCallProjects = {
  type: 'projects';
  orgSlug: string;
};
export type SentryResourceCallQuery = ResourceCallOrganizations | ResourceCallProjects;
//#endregion

//#region Resource call Response
export type ResourceCallOrganizationsResponse = SentryOrganization[];
export type ResourceCallProjectsResponse = SentryProject[];
export type SentryResourceCallResponse = ResourceCallOrganizationsResponse | ResourceCallProjectsResponse;
//#endregion

//#region Selectable values
//#endregion

//#region Default values
export const DEFAULT_SENTRY_URL = `https://sentry.io`;
//#endregion
