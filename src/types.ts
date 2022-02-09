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
type GetResourceCallBase<P extends string, Q extends Record<string, any>, R extends unknown> = {
  path: P;
  query?: Q;
  response: R;
};
export type GetResourceCallOrganizations = GetResourceCallBase<`api/0/organizations`, {}, SentryOrganization[]>;
export type GetResourceCallProjects = GetResourceCallBase<`api/0/organizations/${string}/projects`, {}, SentryProject[]>;
export type GetResourceCall = GetResourceCallOrganizations | GetResourceCallProjects;
//#endregion

//#region Selectable values
export const QueryTypeOptions: Array<SelectableValue<QueryType>> = [
  { value: 'issues', label: 'Issues' },
  { value: 'statsV2', label: 'Stats' },
];
export const SentryIssueSortOptions: Array<SelectableValue<SentryIssueSort>> = [
  // { value: 'inbox', label: 'Date Added' },
  { value: 'date', label: 'Last Seen' },
  { value: 'new', label: 'First Seen' },
  { value: 'priority', label: 'Priority' },
  { value: 'freq', label: 'Events' },
  { value: 'user', label: 'Users' },
];
export const SentryStatsV2QueryFieldOptions: Array<SelectableValue<SentryStatsV2QueryField>> = [
  { value: 'sum(quantity)', label: 'sum(quantity)' },
  { value: 'sum(times_seen)', label: 'sum(times_seen)' },
];
export const SentryStatsV2QueryGroupByOptions: Array<SelectableValue<SentryStatsV2QueryGroupBy>> = [
  { value: 'outcome', label: 'outcome' },
  { value: 'reason', label: 'reason' },
  { value: 'category', label: 'category' },
];
export const SentryStatsV2QueryCategoryOptions: Array<SelectableValue<SentryStatsV2QueryCategory>> = [
  { value: 'error', label: 'error' },
  { value: 'transaction', label: 'transaction' },
  { value: 'attachment', label: 'attachment' },
  { value: 'default', label: 'default' },
  { value: 'session', label: 'session' },
  { value: 'security', label: 'security' },
];
export const SentryStatsV2QueryOutcomeOptions: Array<SelectableValue<SentryStatsV2QueryOutcome>> = [
  { value: 'accepted', label: 'accepted' },
  { value: 'filtered', label: 'filtered' },
  { value: 'invalid', label: 'invalid' },
  // { value: 'dropped', label: 'dropped' },
  { value: 'rate_limited', label: 'rate_limited' },
  { value: 'client_discard', label: 'client_discard' },
  { value: 'abuse', label: 'abuse' },
];

//#endregion

//#region Default values
export const DEFAULT_SENTRY_URL = `https://sentry.io`;
//#endregion
