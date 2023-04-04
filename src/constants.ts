import type { SelectableValue } from '@grafana/data';
import type {
  QueryType,
  SentryIssueSort,
  SentryStatsV2QueryField,
  SentryStatsV2QueryGroupBy,
  SentryStatsV2QueryCategory,
  SentryStatsV2QueryOutcome,
} from './types';

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

export const DEFAULT_SENTRY_URL = `https://sentry.io`;
