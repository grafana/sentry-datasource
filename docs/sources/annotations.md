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
weight: 400
review_date: "2026-04-07"
---

# Sentry annotations

Annotations let you overlay Sentry issue data on dashboard graphs, marking when issues were first or last seen directly on your time-series panels. This helps you correlate application errors with metrics from other data sources.

## Before you begin

- [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/).
- Understand [Grafana annotations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).

## Create an annotation query

To add Sentry annotations to a dashboard:

1. Open the dashboard where you want to display annotations.
1. Navigate to **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Select the **Sentry** data source.
1. Select **Issues** as the query type.
1. (Optional) Filter by **Projects** to limit annotations to specific Sentry projects.
1. (Optional) Filter by **Environments** to limit annotations to specific environments.
1. (Optional) Enter a **Query** to filter which issues appear as annotations. Use the format `FIELD_NAME:FIELD_VALUE` to filter by issue fields.
1. (Optional) Set **Sort By** to control the order of results (for example, Last Seen or Priority).
1. (Optional) Set a **Limit** to control how many annotations display.
1. Click **Save dashboard**.

## Annotation examples

The following examples show common annotation configurations.

### Overlay all unresolved issues

Display all unresolved issues from a specific project:

1. Select the **Sentry** data source.
1. Set **Query Type** to **Issues**.
1. Select the target project in **Projects**.
1. Set **Query** to `is:unresolved`.

### Overlay high-priority issues only

Display only high-priority issues as annotations:

1. Select the **Sentry** data source.
1. Set **Query Type** to **Issues**.
1. Set **Query** to `is:unresolved priority:high`.

### Overlay issues for a specific release

Mark issues associated with a particular release:

1. Select the **Sentry** data source.
1. Set **Query Type** to **Issues**.
1. Set **Query** to `release:1.2.0`.

## Limitations

- Annotations use the **Issues** query type only. Other query types (Events, Spans, Metrics, Stats) aren't available for annotations.
- Annotations are filtered by the dashboard time range. Issues outside the visible time range don't appear.
- Sentry API rate limits apply. If you have many issues, set a **Limit** to reduce the number of API calls.

For more information, refer to [Annotations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).
