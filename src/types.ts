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
export type VariableQueryType = 'organizations' | 'projects';
export type VariableQueryOrganizations = {
  type: 'organizations';
};
export type VariableQueryProjects = {
  type: 'projects';
  orgSlug?: string;
  orgName?: string;
  orgId?: string;
};
export type SentryVariableQuery = VariableQueryOrganizations | VariableQueryProjects;
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
