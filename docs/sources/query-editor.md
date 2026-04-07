---
aliases:
  - /docs/plugins/grafana-sentry-datasource/query-editor/
description: Use the Sentry query editor to query issues, events, spans, session metrics, and organization statistics.
keywords:
  - grafana
  - sentry
  - query editor
  - issues
  - events
  - spans
  - events stats
  - metrics
  - organization stats
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Query editor
title: Sentry query editor
weight: 200
review_date: "2026-04-07"
---

# Sentry query editor

This document explains how to use the Sentry query editor to build queries and visualize Sentry data in Grafana dashboards.

## Before you begin

- [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/).
- Verify your Sentry authentication token has the required read permissions.

## Common fields

Every query type includes the following shared fields.

| Field            | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Query Type**   | The type of Sentry data to query. Select one of: Issues, Events, Spans, Events Stats, Spans Stats, Metrics, or Stats. |
| **Projects**     | (Optional) Filter results by one or more Sentry projects.                                                    |
| **Environments** | (Optional) Filter results by one or more Sentry environments. Not available for Stats queries.               |

## Query types

The query editor supports seven query types, each returning a different kind of Sentry data.

### Issues

Use the Issues query type to retrieve a list of Sentry issues. Results are filtered based on the dashboard time range.

| Field        | Description                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Query**    | (Optional) A Sentry search query to filter results. Use the format `FIELD_NAME:FIELD_VALUE` to filter by issue fields. Run with Shift+Enter.                  |
| **Sort By**  | (Optional) The order of results. Options: Last Seen, First Seen, Priority, Events, Users.                                                                     |
| **Limit**    | (Optional) The maximum number of results to return. Default: `100`.                                                                                            |

For more information about Sentry issues, refer to the [Sentry Issues documentation](https://docs.sentry.io/product/issues/).

### Events

Use the Events query type to retrieve a list of Sentry events. Results are filtered based on the dashboard time range.

| Field              | Description                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Query**          | (Optional) A Sentry search query to filter results. Refer to the [Sentry search syntax documentation](https://docs.sentry.io/product/sentry-basics/search/) for details. Run with Shift+Enter. |
| **Fields**         | The Sentry field names to fetch. Select from suggested fields or enter custom field names. Default fields: `id`, `title`, `project`, `project.id`, `release`, `count()`, `epm()`, `last_seen()`, `level`, `event.type`, `platform`. Tags are auto-completed. |
| **Sort By**        | (Optional) The sort order for results. Options: Last Seen, Count, Events per minute, Failure rate, Level. You can also enter a custom sort field.                    |
| **Sort Direction** | (Optional) Ascending or Descending. Appears when a sort field is selected.                                                                                           |
| **Limit**          | (Optional) The maximum number of results to return. Maximum: `100`.                                                                                                  |

For more information about Sentry events, refer to the [Sentry Discover documentation](https://docs.sentry.io/product/explore/discover-queries/).

### Spans

Use the Spans query type to retrieve span data from Sentry. This query type uses the same editor as Events but queries the Sentry spans API and provides span-specific field suggestions.

| Field              | Description                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Query**          | (Optional) A Sentry search query to filter results. Run with Shift+Enter.                                                        |
| **Fields**         | The span field names to fetch. Default fields: `id`, `span.op`, `span.description`, `count()`. Span attributes are auto-completed. |
| **Sort By**        | (Optional) The sort order for results. You can also enter a custom sort field.                                                    |
| **Sort Direction** | (Optional) Ascending or Descending. Appears when a sort field is selected.                                                       |
| **Limit**          | (Optional) The maximum number of results to return. Maximum: `100`.                                                               |

### Events Stats

Use the Events Stats query type to retrieve time-series data for Sentry events, suitable for graphing trends over time. Results are filtered based on the dashboard time range.

| Field       | Description                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| **Query**   | (Optional) A Sentry search query to filter results. Run with Shift+Enter.                                       |
| **Y-axis**  | (Required) One or more fields to plot on the y-axis. Enter field names and press Enter to add each one.          |
| **Group**   | (Optional) One or more fields or tags to group results by. Enter values and press Enter to add each one.         |
| **Sort By** | (Optional) A field name to sort results by.                                                                      |
| **Limit**   | (Optional) The maximum number of result groups. Maximum: `10`.                                                   |

### Spans Stats

Use the Spans Stats query type to retrieve time-series data for Sentry spans. This query type uses the same editor as Events Stats but queries the Sentry spans stats API.

| Field       | Description                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| **Query**   | (Optional) A Sentry search query to filter results. Run with Shift+Enter.                                       |
| **Y-axis**  | (Required) One or more fields to plot on the y-axis. Enter field names and press Enter to add each one.          |
| **Group**   | (Optional) One or more fields or tags to group results by. Enter values and press Enter to add each one.         |
| **Sort By** | (Optional) A field name to sort results by.                                                                      |
| **Limit**   | (Optional) The maximum number of result groups. Maximum: `10`.                                                   |

### Metrics

Use the Metrics query type to retrieve session-based metrics from Sentry, such as crash rates, error rates, and session counts.

| Field        | Description                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Field**    | (Required) The session metric to query. Options include: `session.crash_free_rate`, `session.crash_rate`, `session.crashed`, `session.errored`, `session.healthy`, `session.all`, `session.anr_rate`, `session.foreground_anr_rate`, `session.abnormal`, `count_unique(sentry.sessions.user)`, and user-specific variants. |
| **Query**    | (Optional) A Sentry search query to filter results. Run with Shift+Enter.                                                                                 |
| **Group By** | (Optional) Group results by `environment`, `project`, `session.status`, or `release`.                                                                     |
| **Sort By**  | (Optional) Sort grouped results by a metric field or `release`. Appears only when a Group By value other than `session.status` is set.                    |
| **Order**    | (Optional) Sort order: High to low or Low to high. Appears alongside Sort By.                                                                             |
| **Limit**    | (Optional) The maximum number of result groups. Default: `5`, maximum: `10`. Appears alongside Sort By.                                                   |

### Stats

Use the Stats query type to retrieve organization-level usage statistics from Sentry, such as event counts and quotas. Results are filtered based on the dashboard time range. The Environments filter is not available for this query type.

| Field               | Description                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Field**           | (Required) The statistic to trend. Options: `sum(quantity)` or `sum(times_seen)`.                                              |
| **Category Filter** | (Required) The event category to filter by. Options: `error`, `transaction`, `attachment`, `default`, `session`, `security`.   |
| **Group By**        | (Optional) Group results by `outcome`, `reason`, or `category`.                                                                |
| **Outcome Filter**  | (Optional) Filter by one or more outcomes: `accepted`, `filtered`, `invalid`, `rate_limited`, `client_discard`, `abuse`.       |
| **Reason Filter**   | (Optional) A comma-separated list of reasons to filter by.                                                                     |
| **Interval**        | (Optional) The time interval for grouping results. Format: `[number][unit]`, where unit is `m` (minutes), `h` (hours), `d` (days), or `w` (weeks). |

For more information about organization statistics, refer to the [Sentry Org Stats documentation](https://docs.sentry.io/product/accounts/quotas/org-stats/).

## Annotations

You can overlay Sentry issues on graphs using annotations. To create annotations from Sentry issues:

1. Navigate to **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Select the **Sentry** data source.
1. Select **Issues** as the query type.
1. (Optional) Configure project, environment, and query filters to narrow the results.

For more information, refer to [Annotations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).

## Next steps

- [Use template variables](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/template-variables/)
- [Set up alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/)
