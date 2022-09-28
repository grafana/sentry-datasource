import type { DataSourceJsonData, DataQuery } from '@grafana/data/types';

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
  orgSlug: string;
}
export interface SentrySecureConfig {
  authToken: string;
}
//#endregion

//#region Query
export type QueryType = 'issues' | 'statsV2';
export type SentryQueryBase<T extends QueryType> = { queryType: T } & DataQuery;
export type SentryIssuesQuery = {
  projectIds: string[];
  environments: string[];
  issuesQuery: string;
  issuesSort?: SentryIssueSort;
  issuesLimit?: number;
} & SentryQueryBase<'issues'>;
export type SentryStatsV2QueryField = 'sum(quantity)' | 'sum(times_seen)';
export type SentryStatsV2QueryGroupBy = 'outcome' | 'reason' | 'category';
export type SentryStatsV2QueryCategory = 'transaction' | 'error' | 'attachment' | 'default' | 'session' | 'security';
export type SentryStatsV2QueryOutcome = 'accepted' | 'filtered' | 'invalid' | 'rate_limited' | 'client_discard' | 'abuse'; // 'dropped'
export type SentryStatsV2Query = {
  projectIds: string[];
  statsFields: SentryStatsV2QueryField[];
  statsGroupBy: SentryStatsV2QueryGroupBy[];
  statsCategory: SentryStatsV2QueryCategory[];
  statsOutcome: SentryStatsV2QueryOutcome[];
  statsReason: string[];
} & SentryQueryBase<'statsV2'>;
export type SentryQuery = SentryIssuesQuery | SentryStatsV2Query;
//#endregion

//#region Variable Query
export type VariableQueryType = 'projects' | 'environments';
export type VariableQueryBase<T extends VariableQueryType> = { type: T };
export type VariableQueryProjects = {} & VariableQueryBase<'projects'>;
export type VariableQueryEnvironments = { projectIds: string[] } & VariableQueryBase<'environments'>;
export type SentryVariableQuery = VariableQueryProjects | VariableQueryEnvironments;
//#endregion

//#region Resource call
//#region Resource call Query
export type SentryResourceCallRequestType = 'organizations' | 'projects';
export type SentryResourceCallRequestBase<T extends SentryResourceCallRequestType> = { type: T };
export type ResourceCallOrganizations = {} & SentryResourceCallRequestBase<'organizations'>;
export type ResourceCallProjects = { orgSlug: string } & SentryResourceCallRequestBase<'projects'>;
export type SentryResourceCallRequest = ResourceCallOrganizations | ResourceCallProjects;
//#endregion
//#region Resource call Response
export type ResourceCallOrganizationsResponse = SentryOrganization[];
export type ResourceCallProjectsResponse = SentryProject[];
export type SentryResourceCallResponse = ResourceCallOrganizationsResponse | ResourceCallProjectsResponse;
//#endregion
//#endregion
