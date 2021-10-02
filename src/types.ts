import { DataSourceJsonData, DataQuery, SelectableValue } from '@grafana/data';

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
export type SentryIssueSort = 'inbox' | 'new' | 'date' | 'priority' | 'freq' | 'user';
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
export type QueryType = 'issues';
export type SentryQueryBase<T extends QueryType> = { queryType: T } & DataQuery;
export type SentryIssuesQuery = {
  orgSlug: string;
  projectIds: string[];
  environments: string[];
  issuesQuery: string;
  issuesSort?: SentryIssueSort;
  issuesLimit?: number;
} & SentryQueryBase<'issues'>;
export type SentryQuery = SentryIssuesQuery;
//#endregion

//#region Variable Query
export type VariableQueryType = 'organizations' | 'projects' | 'environments';
export type VariableQueryBase<T extends VariableQueryType> = { type: T };
export type VariableQueryOrganizations = {} & VariableQueryBase<'organizations'>;
export type VariableQueryProjects = { orgSlug: string } & VariableQueryBase<'projects'>;
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
export const QueryTypeOptions: Array<SelectableValue<QueryType>> = [{ value: 'issues', label: 'Issues' }];
export const SentryIssueSortOptions: Array<SelectableValue<SentryIssueSort>> = [
  // { value: 'inbox', label: 'Date Added' },
  { value: 'date', label: 'Last Seen' },
  { value: 'new', label: 'First Seen' },
  { value: 'priority', label: 'Priority' },
  { value: 'freq', label: 'Events' },
  { value: 'user', label: 'Users' },
];
//#endregion

//#region Default values
export const DEFAULT_SENTRY_URL = `https://sentry.io`;
//#endregion
