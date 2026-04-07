---
aliases:
  - /docs/plugins/grafana-sentry-datasource/
description: Guide for using the Sentry data source in Grafana to query and visualize Sentry issues, events, spans, and organization statistics.
keywords:
  - grafana
  - sentry
  - data source
  - error tracking
  - application monitoring
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Sentry
title: Sentry data source
weight: 1350
review_date: "2026-04-07"
---

# Sentry data source

The Sentry data source plugin lets you query and visualize [Sentry](https://sentry.io/) data within Grafana. You can display issues, events, spans, session metrics, and organization statistics in Grafana dashboards, giving you a unified view of application errors and performance alongside your other observability data.

## Supported features

| Feature     | Supported |
| ----------- | --------- |
| Metrics     | Yes       |
| Alerting    | Yes       |
| Annotations | Yes       |

## Get started

The following documents help you set up and use the Sentry data source:

- [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/)
- [Sentry query editor](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/query-editor/)
- [Template variables](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/template-variables/)
- [Annotations](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/annotations/)
- [Alerting](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/alerting/)
- [Troubleshooting](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/troubleshooting/)

## Additional features

After configuring the data source, you can:

- Use [Explore](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/explore/) to query Sentry data without building a dashboard.
- Add [Transformations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/panels-visualizations/query-transform-data/transform-data/) to manipulate query results.
- Add [Annotations](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/annotations/) to overlay Sentry issues on graphs.
- Set up [Alerting](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/alerting/) rules based on Sentry data.

## Plugin updates

Always ensure that your plugin version is up-to-date so you have access to all current features and improvements. Navigate to **Plugins and data** > **Plugins** to check for updates. Grafana recommends upgrading to the latest Grafana version, and this applies to plugins as well.

{{< admonition type="note" >}}
Plugins are automatically updated in Grafana Cloud.
{{< /admonition >}}

## Related resources

- [Official Sentry documentation](https://docs.sentry.io/)
- [Grafana community forum](https://community.grafana.com/)
