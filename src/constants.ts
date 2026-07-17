import type { SelectableValue } from '@grafana/data';
import type {
  QueryType,
  SentryEventsDataset,
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
  { value: 'eventsStats', label: 'Events Stats' },
  { value: 'statsV2', label: 'Stats' },
  { value: 'spans', label: 'Spans' },
  { value: 'spansStats', label: 'Spans Stats' },
  { value: 'uptime', label: 'Uptime' },
  { value: 'metrics', label: 'Release Health (Sessions)' },
  { value: 'releases', label: 'Releases' },
  { value: 'deploys', label: 'Deploys' },
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
// The uptime_results dataset does not support aggregate sorts such as count(),
// so uptime queries sort by plain result fields only.
export const SentryUptimeSortOptions: Array<SelectableValue<SentryEventSort>> = [
  { value: 'timestamp', label: 'Timestamp' },
  { value: 'duration_ms', label: 'Duration' },
  { value: 'scheduled_check_time', label: 'Scheduled check time' },
];
export const SentryEventSortDirectionOptions: Array<SelectableValue<SentrySortDirection>> = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];
export const SentryEventsDatasetOptions: Array<SelectableValue<SentryEventsDataset>> = [
  { value: 'errors', label: 'errors' },
  { value: 'transactions', label: 'transactions' },
];
export const SentryMetricsQueryFieldOptions: Array<SelectableValue<SentryMetricsQueryField>> = [
  { value: 'sum(session)', label: 'sum(session)' },
  { value: 'count_unique(user)', label: 'count_unique(user)' },
  { value: 'crash_free_rate(session)', label: 'crash_free_rate(session)' },
  { value: 'crash_free_rate(user)', label: 'crash_free_rate(user)' },
  { value: 'crash_rate(session)', label: 'crash_rate(session)' },
  { value: 'crash_rate(user)', label: 'crash_rate(user)' },
  { value: 'anr_rate()', label: 'anr_rate()' },
  { value: 'foreground_anr_rate()', label: 'foreground_anr_rate()' },
];
export const SentryMetricsQuerySortOptions: Array<SelectableValue<SentryMetricsQuerySort>> = [
  ...SentryMetricsQueryFieldOptions,
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
