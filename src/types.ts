import type { DataQuery, DataSourceJsonData } from '@grafana/data';

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
export type SentryTag = {
  key: string;
  name: string;
  totalValues: number;
};
export type SentryAttribute = {
  key: string;
  name: string;
};
export type SentryRelease = {
  id?: string;
  version: string;
  shortVersion?: string;
  dateCreated?: string;
  dateReleased?: string | null;
  firstEvent?: string | null;
  lastEvent?: string | null;
  commitCount?: number;
  deployCount?: number;
  newGroups?: number;
  url?: string | null;
  projects?: Array<{ id?: number; name?: string; slug?: string }>;
};
export type SentryIssueSort = 'inbox' | 'new' | 'date' | 'priority' | 'freq' | 'user';
export type SentryEventSort =
  | 'last_seen()'
  | 'count()'
  | 'epm()'
  | 'failure_rate()'
  | 'level'
  | 'timestamp'
  | 'duration_ms'
  | 'scheduled_check_time';
export type SentrySortDirection = 'asc' | 'desc';
//#endregion

//#region Config
export interface SentryConfig extends DataSourceJsonData {
  url: string;
  orgSlug: string;
  enableSecureSocksProxy?: boolean;
  tlsSkipVerify?: boolean;
}
export interface SentrySecureConfig {
  authToken: string;
}
//#endregion

//#region Query
export type QueryType =
  | 'issues'
  | 'events'
  | 'statsV2'
  | 'eventsStats'
  | 'metrics'
  | 'spans'
  | 'spansStats'
  | 'uptime'
  | 'releases'
  | 'deploys';
export type SentryQueryBase<T extends QueryType> = { queryType: T } & DataQuery;
export type SentryIssuesQuery = {
  projectIds: string[];
  environments: string[];
  issuesQuery: string;
  issuesSort?: SentryIssueSort;
  issuesLimit?: number;
} & SentryQueryBase<'issues'>;
export type SentryEventsDataset = 'errors' | 'transactions';
export type SentryEventsQuery = {
  projectIds: string[];
  environments: string[];
  eventsQuery: string;
  eventsDataset?: SentryEventsDataset;
  eventsFields?: string[];
  eventsSort?: SentryEventSort;
  eventsSortDirection?: SentrySortDirection;
  eventsLimit?: number;
} & SentryQueryBase<'events'>;
export type SentrySpansQuery = {
  projectIds: string[];
  environments: string[];
  eventsQuery: string;
  eventsFields?: string[];
  eventsSort?: SentryEventSort;
  eventsSortDirection?: SentrySortDirection;
  eventsLimit?: number;
} & SentryQueryBase<'spans'>;
export type SentryUptimeQuery = {
  projectIds: string[];
  environments: string[];
  eventsQuery: string;
  eventsFields?: string[];
  eventsSort?: SentryEventSort;
  eventsSortDirection?: SentrySortDirection;
  eventsLimit?: number;
} & SentryQueryBase<'uptime'>;
export type SentryEventsStatsQuery = {
  projectIds: string[];
  environments: string[];
  eventsStatsYAxis: string[];
  eventsStatsQuery: string;
  eventsStatsSort?: string;
  eventsStatsLimit?: number;
  eventsStatsGroups: string[];
} & SentryQueryBase<'eventsStats'>;
export type SentrySpansStatsQuery = {
  projectIds: string[];
  environments: string[];
  eventsStatsYAxis: string[];
  eventsStatsQuery: string;
  eventsStatsSort?: string;
  eventsStatsLimit?: number;
  eventsStatsGroups: string[];
} & SentryQueryBase<'spansStats'>;
export type SentryMetricsQueryField =
  | 'sum(session)'
  | 'count_unique(user)'
  | 'crash_free_rate(session)'
  | 'crash_free_rate(user)'
  | 'crash_rate(session)'
  | 'crash_rate(user)'
  | 'anr_rate()'
  | 'foreground_anr_rate()';
export type SentryMetricsQueryGroupBy = 'environment' | 'project' | 'session.status' | 'release';
export type SentryMetricsQuerySort = SentryMetricsQueryField;
export type SentryMetricsQueryOrder = 'asc' | 'desc';
export type SentryMetricsQuery = {
  projectIds: string[];
  environments: string[];
  metricsField: SentryMetricsQueryField;
  metricsQuery: string;
  metricsGroupBy?: SentryMetricsQueryGroupBy;
  metricsLimit?: number;
  metricsSort?: SentryMetricsQuerySort;
  metricsOrder?: SentryMetricsQueryOrder;
} & SentryQueryBase<'metrics'>;
export type SentryReleasesQuery = {
  projectIds: string[];
  environments: string[];
  releasesQuery?: string;
  releasesLimit?: number;
} & SentryQueryBase<'releases'>;
export type SentryDeploysQuery = {
  projectIds: string[];
  environments: string[];
  deploysReleaseVersion: string;
  deploysLimit?: number;
} & SentryQueryBase<'deploys'>;
export type SentryStatsV2QueryField = 'sum(quantity)' | 'sum(times_seen)';
export type SentryStatsV2QueryGroupBy = 'outcome' | 'reason' | 'category';
export type SentryStatsV2QueryCategory = 'transaction' | 'error' | 'attachment' | 'default' | 'session' | 'security';
export type SentryStatsV2QueryOutcome =
  | 'accepted'
  | 'filtered'
  | 'invalid'
  | 'rate_limited'
  | 'client_discard'
  | 'abuse'; // 'dropped'
export type SentryStatsV2Query = {
  projectIds: string[];
  statsFields: SentryStatsV2QueryField[];
  statsGroupBy: SentryStatsV2QueryGroupBy[];
  statsCategory: SentryStatsV2QueryCategory[];
  statsOutcome: SentryStatsV2QueryOutcome[];
  statsReason: string[];
  statsInterval: string;
} & SentryQueryBase<'statsV2'>;
export type SentryQuery =
  | SentryIssuesQuery
  | SentryEventsQuery
  | SentrySpansQuery
  | SentryUptimeQuery
  | SentryEventsStatsQuery
  | SentrySpansStatsQuery
  | SentryMetricsQuery
  | SentryStatsV2Query
  | SentryReleasesQuery
  | SentryDeploysQuery;
//#endregion

//#region Variable Query
export type VariableQueryType = 'projects' | 'environments' | 'teams' | 'releases';
export type VariableQueryBase<T extends VariableQueryType> = { type: T };
export type VariableQueryProjects = { teamSlug?: string } & VariableQueryBase<'projects'>;
export type VariableQueryEnvironments = { projectIds: string[] } & VariableQueryBase<'environments'>;
export type VariableQueryTeams = VariableQueryBase<'teams'>;
export type VariableQueryReleases = { projectIds?: string[] } & VariableQueryBase<'releases'>;
export type SentryVariableQuery =
  | VariableQueryProjects
  | VariableQueryEnvironments
  | VariableQueryTeams
  | VariableQueryReleases;
//#endregion

//#region Resource call
export type GetResourceCallBase<P extends string, Q extends Record<string, any>, R extends unknown> = {
  path: P;
  query?: Q;
  response: R;
};
export type GetResourceCallOrganizationsPath = `api/0/organizations`;
export type GetResourceCallOrganizations = GetResourceCallBase<
  GetResourceCallOrganizationsPath,
  {},
  SentryOrganization[]
>;
export type GetResourceCallProjectsPath = `api/0/organizations/${string}/projects`;
export type GetResourceCallProjects = GetResourceCallBase<GetResourceCallProjectsPath, {}, SentryProject[]>;
export type GetResourceCallTagsPath = `api/0/organizations/${string}/tags`;
export type GetResourceCallTags = GetResourceCallBase<GetResourceCallTagsPath, {}, SentryTag[]>;
export type GetResourceCallAttributesPath = `api/0/organizations/${string}/trace-items/attributes`;
export type GetResourceCallAttributes = GetResourceCallBase<GetResourceCallAttributesPath, {}, SentryAttribute[]>;
export type GetResourceCallReleasesPath = `api/0/organizations/${string}/releases`;
export type GetResourceCallReleases = GetResourceCallBase<
  GetResourceCallReleasesPath,
  { project?: string[] },
  SentryRelease[]
>;
export type GetResourceCallListOrgTeamsPath = `api/0/organizations/${string}/teams`;
export type GetResourceCallListOrgTeams = GetResourceCallBase<GetResourceCallListOrgTeamsPath, {}, SentryTeam[]>;
export type GetResourceCallGetTeamsProjectsPath = `api/0/teams/${string}/${string}/projects`;
export type GetResourceCallGetTeamsProjects = GetResourceCallBase<
  GetResourceCallGetTeamsProjectsPath,
  {},
  SentryProject[]
>;
export type GetResourceCall =
  | GetResourceCallOrganizations
  | GetResourceCallProjects
  | GetResourceCallTags
  | GetResourceCallAttributes
  | GetResourceCallReleases
  | GetResourceCallListOrgTeams
  | GetResourceCallGetTeamsProjects;
//#endregion
