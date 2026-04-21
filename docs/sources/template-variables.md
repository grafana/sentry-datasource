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

| Variable query type | Display value              | Actual value | Additional filters     |
| ------------------- | -------------------------- | ------------ | ---------------------- |
| **Projects**        | Project name and ID        | Project ID   | Optional team slug     |
| **Environments**    | Environment name           | Environment name | Optional project IDs |
| **Teams**           | Team name and slug         | Team slug    | None                   |

## Create a query variable

To create a query variable using the Sentry data source:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the **Sentry** data source.
1. In **Query Type**, select the type of Sentry entity you want to list: **Projects**, **Environments**, or **Teams**.
1. Configure additional filters based on the selected query type:
   - **Projects:** Optionally select a **Team slug** to only list projects belonging to that team. The team selector shows all teams in your organization.
   - **Environments:** Optionally select one or more **Project IDs** to list environments for those projects. If no project is selected, environments from all projects are listed.
   - **Teams:** No additional configuration is needed.

## Use variables in queries

After creating template variables, you can use them in query editor fields. The **Projects** and **Environments** drop-downs in the query editor automatically include your dashboard variables as selectable options, prefixed with `var:`.

For example, if you create a variable named `project` that lists Sentry projects, you can select `var: ${project}` in the **Projects** field of any Sentry query to dynamically filter by the selected project.

## Variable examples

The following examples show common template variable configurations.

### Filter dashboards by project

Create a variable that lets users select which Sentry project to display data for:

1. Create a variable named `project` with **Query Type** set to **Projects**.
1. Set **Selection options** to **Multi-value** if you want users to select multiple projects.
1. In your dashboard queries, select `var: ${project}` in the **Projects** field.

### Cascading project and environment variables

Create linked variables where the environment list depends on the selected project:

1. Create a variable named `project` with **Query Type** set to **Projects**.
1. Create a second variable named `environment` with **Query Type** set to **Environments**.
1. In the `environment` variable configuration, select `var: ${project}` in the **Project ID** selector.
1. When a user changes the project, the environment list updates automatically.

### Filter projects by team

Create a variable scoped to a specific team's projects:

1. Create a variable named `team` with **Query Type** set to **Teams**.
1. Create a second variable named `project` with **Query Type** set to **Projects**.
1. In the `project` variable configuration, select `var: ${team}` in the **Team slug** selector.
1. When a user selects a team, only that team's projects appear in the project variable.

For more information about using variables in queries, refer to [Variable syntax](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/variable-syntax/).
