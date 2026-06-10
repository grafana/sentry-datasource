---
aliases:
  - /docs/plugins/grafana-sentry-datasource/annotations/
description: Use annotations to overlay Sentry issues on Grafana dashboard graphs.
keywords:
  - grafana
  - sentry
  - annotations
  - issues
  - overlay
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Annotations
title: Sentry annotations
weight: 350
review_date: "2026-04-07"
---

# Sentry annotations

Annotations let you overlay Sentry data on dashboard graphs, marking when issues were first or last seen directly on your time-series panels. This helps you correlate application errors with metrics from other data sources.

## Before you begin

- [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/).
- Understand [Grafana annotations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).

## Supported query types for annotations

All Sentry query types are available for annotations. The **Issues** and **Events** query types are best suited because they return discrete records with timestamps that map naturally to annotation markers.

| Query type   | Recommended | Notes                                                                                      |
| ------------ | ----------- | ------------------------------------------------------------------------------------------ |
| Issues       | Yes         | Uses `FirstSeen` and `LastSeen` timestamps. Best for marking when issues appeared.         |
| Events       | Yes         | Uses event timestamps. Useful for marking individual error or transaction events.          |
| Spans        | Yes         | Uses span timestamps. Useful for marking specific span occurrences.                        |
| Events Stats | No          | Returns time-series data, which is less natural for annotation markers.                    |
| Spans Stats  | No          | Returns time-series data, which is less natural for annotation markers.                    |
| Metrics      | No          | Returns time-series data, which is less natural for annotation markers.                    |
| Stats        | No          | Returns time-series data, which is less natural for annotation markers.                    |

## Create an annotation query

To add Sentry annotations to a dashboard:

1. Open the dashboard where you want to display annotations.
1. Navigate to **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Select the **Sentry** data source.
1. Select a **Query Type**. **Issues** is the most common choice for annotations.
1. (Optional) Filter by **Projects** to limit annotations to specific Sentry projects.
1. (Optional) Filter by **Environments** to limit annotations to specific environments.
1. (Optional) Enter a **Query** to filter which results appear as annotations.
1. (Optional) Set **Sort By** to control the order of results (for example, **Last Seen** or **Priority**).
1. (Optional) Set a **Limit** to control how many annotations display.
1. Click **Save dashboard**.

## Annotation examples

The following examples show common annotation configurations.

### Overlay all unresolved issues

Display all unresolved issues from a specific project:

1. Set **Query Type** to **Issues**.
1. Select the target project in **Projects**.
1. Set **Query** to `is:unresolved`.

### Overlay high-priority issues only

Display only high-priority issues as annotations:

1. Set **Query Type** to **Issues**.
1. Set **Query** to `is:unresolved priority:high`.

### Overlay issues for a specific release

Mark issues associated with a particular release:

1. Set **Query Type** to **Issues**.
1. Set **Query** to `release:1.2.0`.

### Overlay recent error events

Mark individual error events on your graphs:

1. Set **Query Type** to **Events**.
1. Set **Query** to `event.type:error`.
1. Set **Sort By** to **Last Seen** with **Descending** sort direction.
1. Set **Limit** to control how many events appear.

### Overlay issues using template variables

Use dashboard template variables to make annotations dynamic:

1. Set **Query Type** to **Issues**.
1. Select `var: ${project}` in the **Projects** field.
1. Set **Query** to `is:unresolved`.

When the user changes the project variable, the annotations update to show issues for the selected project.

## Limitations

- Annotations are filtered by the dashboard time range. Only data within the visible time range appears.
- Sentry API rate limits apply. If you have many matching results, set a **Limit** to reduce the number of API calls.

For more information, refer to [Annotations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).
