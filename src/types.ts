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
export type SentryTeam = {
  avatar?: {
    avatarType: string;
    avatarUuid?: any;
  };
  color?: string;
  dateCreated?: Date;
  features?: string[];
  firstEvent?: any;
  hasAccess?: boolean;
  id: string;
  isBookmarked?: boolean;
  isInternal?: boolean;
  isMember?: boolean;
  isPublic?: boolean;
  name: string;
  platform?: any;
  slug: string;
  status?: string;
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
export type VariableQueryType = 'projects' | 'environments' | 'teams';
export type VariableQueryBase<T extends VariableQueryType> = { type: T };
export type VariableQueryProjects = { teamSlug?: string } & VariableQueryBase<'projects'>;
export type VariableQueryEnvironments = { projectIds: string[] } & VariableQueryBase<'environments'>;
export type VariableQueryTeams = VariableQueryBase<'teams'>;
export type SentryVariableQuery = VariableQueryProjects | VariableQueryEnvironments | VariableQueryTeams;
//#endregion

//#region Resource call
export type GetResourceCallBase<P extends string, Q extends Record<string, any>, R extends unknown> = {
  path: P;
  query?: Q;
  response: R;
};
export type GetResourceCallOrganizationsPath = `api/0/organizations`;
export type GetResourceCallOrganizations = GetResourceCallBase<GetResourceCallOrganizationsPath, {}, SentryOrganization[]>;
export type GetResourceCallProjectsPath = `api/0/organizations/${string}/projects`;
export type GetResourceCallProjects = GetResourceCallBase<GetResourceCallProjectsPath, {}, SentryProject[]>;
export type GetResourceCallListOrgTeamsPath = `api/0/organizations/${string}/teams`;
export type GetResourceCallListOrgTeams = GetResourceCallBase<GetResourceCallListOrgTeamsPath, {}, SentryTeam[]>;
export type GetResourceCallGetTeamsProjectsPath = `api/0/teams/${string}/${string}/projects`;
export type GetResourceCallGetTeamsProjects = GetResourceCallBase<GetResourceCallGetTeamsProjectsPath, {}, SentryProject[]>;
export type GetResourceCall =
  | GetResourceCallOrganizations
  | GetResourceCallProjects
  | GetResourceCallListOrgTeams
  | GetResourceCallGetTeamsProjects;
//#endregion
