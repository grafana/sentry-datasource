---
aliases:
  - /docs/plugins/grafana-sentry-datasource/template-variables/
description: Use template variables with the Sentry data source for dynamic, reusable dashboards.
keywords:
  - grafana
  - sentry
  - template variables
  - dashboard variables
  - projects
  - environments
  - teams
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Template variables
title: Sentry template variables
weight: 300
review_date: "2026-04-07"
---

# Sentry template variables

Use template variables to create dynamic, reusable dashboards that let you switch between Sentry projects, environments, and teams without editing queries.

## Before you begin

- [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/).
- Understand [Grafana template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/).

## Supported variable types

The Sentry data source supports the following variable query types.

| Variable query type | Description                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Projects**        | Lists Sentry projects. The project name is used as the display value and the project ID as the actual value. You can optionally filter projects by team slug.   |
| **Environments**    | Lists Sentry environments for selected projects. If no project is selected, all applicable environments are listed.                                             |
| **Teams**           | Lists Sentry teams. The team name is used as the display value and the team slug as the actual value.                                                           |

## Create a query variable

To create a query variable using the Sentry data source:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the **Sentry** data source.
1. In **Query Type**, select the type of Sentry entity you want to list: **Projects**, **Environments**, or **Teams**.
1. Configure additional filters based on the selected query type:
   - **Projects:** Optionally enter a **Team slug** to only list projects belonging to that team.
   - **Environments:** Select one or more **Project IDs** to list environments for those projects.
   - **Teams:** No additional configuration is needed.

## Use variables in queries

After creating template variables, you can use them in query editor fields. The **Projects** and **Environments** drop-downs in the query editor automatically include your dashboard variables as selectable options.

For example, if you create a variable named `project` that lists Sentry projects, you can select `${project}` in the **Projects** field of any Sentry query to dynamically filter by the selected project.

For more information about using variables in queries, refer to [Variable syntax](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/variable-syntax/).
