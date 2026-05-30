---
aliases:
  - /docs/plugins/grafana-sentry-datasource/alerting/
description: Set up Grafana alerting with the Sentry data source to trigger notifications based on Sentry data.
keywords:
  - grafana
  - sentry
  - alerting
  - alert rules
  - notifications
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Alerting
title: Sentry alerting
weight: 400
review_date: "2026-04-07"
---

# Sentry alerting

You can configure Grafana alerting rules that query the Sentry data source to receive notifications when error rates, event counts, or other Sentry metrics cross defined thresholds.

## Before you begin

- [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/).
- Understand [Grafana Alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/).

## Supported query types for alerting

Alert rules work with Sentry query types that return numeric or time-series data. The following query types are compatible with alerting:

| Query type   | Compatible | Notes                                                                                                         |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Issues       | Yes        | Returns tabular data. Use a **Count** rows expression to alert on the number of matching issues.              |
| Events       | Yes        | Use aggregate fields like `count()` or `epm()` in **Fields**, or use a **Count** rows expression.             |
| Events Stats | Yes        | Returns time-series data. Best suited for alerting on event trends over time.                                  |
| Spans        | Yes        | Returns tabular data. Use aggregate fields or a **Count** rows expression.                                    |
| Spans Stats  | Yes        | Returns time-series data. Best suited for alerting on span performance trends.                                 |
| Metrics      | Yes        | Returns time-series data. Alert on session metrics like crash rates or error rates.                            |
| Stats        | Yes        | Returns time-series data. Alert on organization-level usage statistics.                                       |

## Create an alert rule

To create an alert rule using the Sentry data source:

1. Navigate to **Alerting** > **Alert rules**.
1. Click **New alert rule**.
1. Enter a name for the alert rule.
1. Select the **Sentry** data source.
1. Select a query type and configure the query fields. For example, select **Events Stats** and set a **Y-axis** field such as `count()` to alert on event volume.
1. Define the alert condition using expressions. For example, use a **Reduce** expression to calculate the mean, then a **Threshold** expression to trigger when the value exceeds a limit.
1. Configure the evaluation interval and pending period.
1. Add labels and notifications as needed.
1. Click **Save rule and exit**.

## Alert rule examples

The following examples show common alerting scenarios with the Sentry data source.

### Alert on high error event volume

Monitor for spikes in error events across your projects:

1. Select **Events Stats** as the query type.
1. Set **Y-axis** to `count()`.
1. Set **Query** to `event.type:error`.
1. Add a **Reduce** expression with function **Last**.
1. Add a **Threshold** expression to alert when the value is above your desired limit.

### Alert on unresolved issue count

Get notified when the number of unresolved issues exceeds a threshold:

1. Select **Issues** as the query type.
1. Set **Query** to `is:unresolved`.
1. Set **Limit** high enough to capture all matching issues (for example, `100`).
1. Add a **Reduce** expression with function **Count** to count the number of returned rows.
1. Add a **Threshold** expression to alert when the count exceeds your limit.

### Alert on slow transactions

Monitor for p95 latency regressions in a specific transaction:

1. Select **Events Stats** as the query type.
1. Set **Y-axis** to `p95()`.
1. Set **Query** to `event.type:transaction transaction:<TRANSACTION_NAME>`.
1. Add a **Reduce** expression with function **Last**.
1. Add a **Threshold** expression to alert when the p95 value exceeds an acceptable duration in milliseconds.

### Alert on crash rate changes

Monitor session crash rates using the Metrics query type:

1. Select **Metrics** as the query type.
1. Set **Field** to `session.crash_rate`.
1. Optionally set **Group By** to `project` to monitor per-project crash rates.
1. Add a **Reduce** expression with function **Last**.
1. Add a **Threshold** expression to alert when the crash rate exceeds an acceptable level (for example, `0.01` for 1%).

### Alert on declining crash-free session rate

Monitor when crash-free rates drop below a target:

1. Select **Metrics** as the query type.
1. Set **Field** to `session.crash_free_rate`.
1. Add a **Reduce** expression with function **Last**.
1. Add a **Threshold** expression to alert when the value drops below your target (for example, `0.995` for 99.5%).

### Alert on organization quota usage

Monitor organization-level event consumption to avoid quota overages:

1. Select **Stats** as the query type.
1. Set **Field** to `sum(quantity)`.
1. Set **Category Filter** to `error`.
1. Add a **Reduce** expression with function **Last**.
1. Add a **Threshold** expression to alert when usage approaches your quota limit.

## Limitations

- Alert evaluation depends on the Sentry API response time. If the Sentry API is slow or rate-limited, alert evaluation may be delayed.
- Sentry API rate limits apply to alert rule evaluations. Set evaluation intervals that avoid exceeding rate limits, especially when multiple alert rules query the same Sentry data source.
- Issues, Events, and Spans queries return tabular data. To create numeric alert conditions from these, use **Reduce** expressions with functions like **Count**, **Min**, **Max**, or **Mean**.

For more information, refer to [Grafana Alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/).
