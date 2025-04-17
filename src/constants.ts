import type { SelectableValue } from '@grafana/data';
import type {
  QueryType,
  SentryEventSort,
  SentryIssueSort,
  SentryMetricsQueryField,
  SentryMetricsQueryGroupBy,
  SentryMetricsQueryOrder,
  SentryMetricsQuerySort,
  SentrySortDirection,
  SentryStatsV2QueryCategory,
  SentryStatsV2QueryField,
  SentryStatsV2QueryGroupBy,
  SentryStatsV2QueryOutcome,
} from './types';

export const QueryTypeOptions: Array<SelectableValue<QueryType>> = [
  { value: 'issues', label: 'Issues' },
  { value: 'events', label: 'Events' },
  { value: 'statsV2', label: 'Stats' },
  { value: 'eventsStats', label: 'Events Stats' },
  { value: 'metrics', label: 'Metrics' },
];
export const SentryIssueSortOptions: Array<SelectableValue<SentryIssueSort>> = [
  // { value: 'inbox', label: 'Date Added' },
  { value: 'date', label: 'Last Seen' },
  { value: 'new', label: 'First Seen' },
  { value: 'priority', label: 'Priority' },
  { value: 'freq', label: 'Events' },
  { value: 'user', label: 'Users' },
];
export const SentryEventSortOptions: Array<SelectableValue<SentryEventSort>> = [
  { value: 'last_seen()', label: 'Last Seen' },
  { value: 'count()', label: 'Count' },
  { value: 'epm()', label: 'Events per minute' },
  { value: 'failure_rate()', label: 'Failure rate' },
  { value: 'level', label: 'Level' },
];
export const SentryEventSortDirectionOptions: Array<SelectableValue<SentrySortDirection>> = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];
export const SentryMetricsQueryFieldOptions: Array<SelectableValue<SentryMetricsQueryField>> = [
  { value: 'session.anr_rate', label: 'session.anr_rate' },
  { value: 'session.abnormal', label: 'session.abnormal' },
  { value: 'session.abnormal_user', label: 'session.abnormal_user' },
  { value: 'session.crashed', label: 'session.crashed' },
  { value: 'session.crashed_user', label: 'session.crashed_user' },
  { value: 'session.errored', label: 'session.errored' },
  { value: 'session.errored_user', label: 'session.errored_user' },
  { value: 'session.healthy', label: 'session.healthy' },
  { value: 'session.healthy_user', label: 'session.healthy_user' },
  { value: 'count_unique(sentry.sessions.user)', label: 'count_unique(sentry.sessions.user)' },
  { value: 'session.crash_free_rate', label: 'session.crash_free_rate' },
  { value: 'session.crash_free_user_rate', label: 'session.crash_free_user_rate' },
  { value: 'session.crash_rate', label: 'session.crash_rate' },
  { value: 'session.crash_user_rate', label: 'session.crash_user_rate' },
  { value: 'session.foreground_anr_rate', label: 'session.foreground_anr_rate' },
  { value: 'session.all', label: 'session.all' },
];
export const SentryMetricsQuerySortOptions: Array<SelectableValue<SentryMetricsQuerySort>> = [
  ...SentryMetricsQueryFieldOptions,
  { value: 'release', label: 'release' },
];
export const SentryMetricsQueryOrderOptions: Array<SelectableValue<SentryMetricsQueryOrder>> = [
  { value: 'desc', label: 'High to low' },
  { value: 'asc', label: 'Low to high' },
];
export const SentryMetricsQueryGroupByOptions: Array<SelectableValue<SentryMetricsQueryGroupBy>> = [
  { value: 'environment', label: 'environment' },
  { value: 'project', label: 'project' },
  { value: 'session.status', label: 'session.status' },
  { value: 'release', label: 'release' },
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

export const DEFAULT_SENTRY_URL = `https://sentry.io`;
