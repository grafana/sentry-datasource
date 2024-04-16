# Sentry data source plugin with Grafana

The Sentry data source plugin allows you to query and visualize Sentry data within Grafana.

## Requirements

The Sentry data source has the following requirements:

- Grafana user with a server or organization administration role; refer to [Permissions](https://grafana.com/docs/grafana/latest/permissions/).
- An active Sentry account
- In Sentry, The Admin, Manager, or Owner role is required to get an internal integration token

## Known limitations

With the Grafana Sentry data source plugin, you are able to visualize issues, events or usage statistics within an organization. For more information, see [Issues](https://docs.sentry.io/product/issues/), [Events](https://docs.sentry.io/product/discover-queries/) and [Org Stats](https://docs.sentry.io/product/accounts/quotas/org-stats/).

## Install the Sentry data source plugin

To install the Sentry data source plugin in your Grafana instance, refer to [Installation](https://grafana.com/grafana/plugins/grafana-sentry-datasource/?tab=installation).

## Get an authentication token from Sentry

To configure the Sentry data source plugin within Grafana, get an internal integration token from Sentry:

1. Go to `https://sentry.io`.
2. Navigate to **Organization Settings**
3. Under **Developer Settings** select **Custom Integration**.
4. Click **Create New Integration** and then select **Internal Integration**
5. Use a valid name such as _Grafana_.
6. Go to **PERMISSIONS**, provide **Read** permissions to the required resources such as "Project", "Issue and Event", and "Organization".
7. Click **Save Changes** then scroll down to **TOKENS** and click **+ New Token**
8. Copy the token for the **Sentry Auth Token** field when configuring the data source within Grafana.

> Note: In Sentry, The Admin, Manager, or Owner role is required to get an internal integration token

## Configure the data source in Grafana

[Add a data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/) by filling in the following fields:

| Field name        | Description                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sentry URL        | Sentry URL to be used. If left blank, the default is `https://sentry.io`.                                                                                              |
| Sentry Org        | Sentry Org slug. Typically this is in the URL, such as `https://sentry.io/organizations/{organization_slug}/`.                                                         |
| Sentry Auth Token | Sentry Auth token. You can generate this from `https://sentry.io/settings/{organization_slug}/developer-settings/`) using the steps specified in the previous section. |

## Configure the data source via provisioning

You can configure data sources to use Grafana’s provisioning system. For more information about how provisioning works, and all of the settings that you can set for data sources, see [Provisioning Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#datasources).

Here is an example for provisioning this data source:

```yml
apiVersion: 1
datasources:
  - name: Sentry
    type: grafana-sentry-datasource
    access: proxy
    orgId: 1
    version: 1
    editable: false
    jsonData:
      url: https://sentry.io
      orgSlug: xxxxxxxxxxxxx
    secureJsonData:
      authToken: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Query the data source

The query editor allows you to query Sentry, get sentry issues, events and stats and display them in Grafana dashboard panels. You can choose one of the following query types, to get the relevant data.

### Sentry issues

To get the list of Sentry issues, select **Sentry Issues** as the query type. Issues are filtered based on Grafana’s selected time range.

| Field        | Description                                                       |
| ------------ | ----------------------------------------------------------------- |
| Query Type   | Choose **Issues** as query type.                                  |
| Projects     | (optional) Select one or more projects to filter the results.     |
| Environments | (optional) Select one or more environments to filter the results. |
| Query        | (optional) Enter your sentry query to get the relevant results.   |
| Sort By      | (optional) Select the order of results you want to display.       |
| Limit        | (optional) Limit the number of results displayed.                 |

### Sentry events

To get the list of Sentry events, select **Sentry Events** as the query type. Events are filtered based on Grafana’s selected time range.

| Field        | Description                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Query Type   | Choose **Events** as query type.                                                                                                             |
| Projects     | (optional) Select one or more projects to filter the results.                                                                                |
| Environments | (optional) Select one or more environments to filter the results.                                                                            |
| Query        | (optional) Enter your sentry query to get the relevant results. More on [query syntax](https://docs.sentry.io/product/sentry-basics/search/) |
| Sort By      | (optional) Select the order of results you want to display.                                                                                  |
| Limit        | (optional) Limit the number of results displayed. Max limit - 100.                                                                           |

### Sentry Org stats

To get the trend of Sentry Org stats, select **Stats** as the query type. Org stats are filtered based on Grafana’s selected time range.

| Field           | Description                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Query Type      | Choose **Stats** as query type.                                                                                  |
| Field           | Select the field type you want to trend. Currently, you must choose either `sum(quantity)` or `sum(times_seen)`. |
| Category Filter | Select the category you want to filter the results. You must to choose one the available option there.           |
| Group By        | (optional) Select one or more fields you want to group the results.                                              |
| Projects        | (optional) Select one or more projects to filter the results.                                                    |
| Outcome Filter  | (optional) Select one of more outcomes to filter the results.                                                    |
| Reason Filter   | (optional) Enter comma separated list of reasons you want to filter.                                             |

## Templates and variables

In Grafana dashboards, you can use Sentry entities as dashboard variables. Sentry data source supports following variables:

| Variable name | Description                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Teams         | Lists the Sentry teams. The team name is used as the display value, and team slug is used as as actual value.                           |
| Projects      | Lists the Sentry projects. The project name is used as the display value, and each project ID is used as an actual value.               |
| Environments  | Lists the Sentry environments for the selected projects. If you do not select a project, all of the applicable environments are listed. |

## Annotations

Annotations give you the ability to overlay Sentry issues on graphs. In the annotations editor, you have to choose **Issues** for creating annotations from Sentry issues.

## Get the most out of the plugin

- Add [Annotations](https://grafana.com/docs/grafana/latest/dashboards/annotations/).
- Configure and use [Templates and variables](https://grafana.com/docs/grafana/latest/variables/).
- Add [Transformations](https://grafana.com/docs/grafana/latest/panels/transformations/).
- Set up alerting; refer to [Alerts overview](https://grafana.com/docs/grafana/latest/alerting/).
