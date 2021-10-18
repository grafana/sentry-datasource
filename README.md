# Grafana data source plugin for Sentry

The Sentry data source plugin allows you to query and visualize Sentry data within Grafana.

## BETA DISCLAIMER

The plugin is in **BETA** stage and so you can expect bugs and breaking changes before the GA release (General Availability release). Should you encounter any bugs, glitches or other problems on the plugin, create a [github issue](https://github.com/grafana/sentry-datasource/issues/new) with relevant details.

## Requirements

The Sentry data source has the following requirements:

- Grafana user with a [server admin or org admin role](https://grafana.com/docs/grafana/latest/permissions/).
- An active Sentry account.

## Known Limitations

With the Grafana Sentry data source plugin, you will be able to visualize only certain part of the Sentry such as Issues, Stats.

## Install the sentry data source plugin

To install the data source in your grafana instance, refer to [Installation](https://grafana.com/grafana/plugins/grafana-sentry-datasource/?tab=installation).

## Get the Authentication token from Sentry

In order to configure the Sentry data source in Grafana, you need an internal integration token from Sentry. You can generate one with the following steps.

1. Go to `https://sentry.io`
2. Navigate to **Organization Settings** and then **Developer Settings**
3. Create an **Internal integration**. Give a valid name such as "Grafana".
4. Provide **Read** permissions to the required resources such as "Project", "Issue and Event" and "Organization"
5. Copy the token and then use this token when configuring the data source in Grafana.

## Configure the data source in Grafana

[Add a data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/) by filling in the following fields:

| Field Name        | Description                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sentry URL        | Sentry URL to be used. If left blank, defaults to `https://sentry.io`                                                                                                  |
| Sentry Org        | Sentry Org slug. Typically this will be in the url `https://sentry.io/organizations/{organization_slug}/`                                                              |
| Sentry Auth Token | Sentry Auth token. You can generate this from `https://sentry.io/settings/{organization_slug}/developer-settings/`) using the steps specified in the previous section. |

## Configure the data source via provisioning

Data sources can be configured with Grafana's provisioning system. You can read more about how it works and all the settings you can set for data sources on [Provisioning Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#datasources).

Here is an example for provisioning this data source

```yaml
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

The query editor allows you to query Sentry, get sentry issues and stats and display them in Grafana dashboard panels. You can choose one of the following query types, to get the relevant data.

### Sentry Issues

To get the list of sentry issues, select "Sentry Issues" as the query type. Issues will be filtered based on Grafana's selected time range.

| Field        | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| Query Type   | Choose **Issues** as query type                                  |
| Projects     | (optional) Select one or more projects to filter the results     |
| Environments | (optional) Select one or more environments to filter the results |
| Query        | (optional) Enter your sentry query to get the relevant results   |
| Sort By      | (optional) Select the order of results you want to display       |
| Limit        | (optional) Limit the number of results displayed                 |

### Sentry Stats

To get the trend of sentry stats, select "Stats" as the query type. Stats will be filtered bases on Grafana's selected time range.

| Field           | Description                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Query Type      | Choose **Stats** as query type                                                                                  |
| Field           | Select the field type you want to trend. Currently, you must choose either `sum(quantity)` or `sum(times_seen)` |
| Category Filter | Select the category you want to filter the results. You must to choose one the available option there           |
| Group By        | (optional) Select one or more fields you want to group the results                                              |
| Projects        | (optional) Select one or more projects to filter the results                                                    |
| Outcome Filter  | (optional) Select one of more outcomes to filter the results                                                    |
| Reason Filter   | (optional) Enter comma separated list of reasons you want to filter                                             |

## Templates and variables

In Grafana dashboards, you can use Sentry entities as dashboard variables. Sentry data source supports following variables

| Variable Name | Description                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Projects      | Lists the sentry projects. Project name will be used as display value and Project IDs will be used as actual values.             |
| Environments  | Lists the sentry environments for the selected projects. If no projects selects, all the applicable environments will be listed. |

## Annotations

Annotations give you the ability to overlay sentry issues on graphs. In the annotations editor, you have to choose "Issues" for creating annotations from Sentry Issues.

## Get the most out of the plugin

- Add [Annotations](https://grafana.com/docs/grafana/latest/dashboards/annotations/).
- Configure and use [Templates and variables](https://grafana.com/docs/grafana/latest/variables/).
- Add [Transformations](https://grafana.com/docs/grafana/latest/panels/transformations/).
- Set up alerting; refer to [Alerts overview](https://grafana.com/docs/grafana/latest/alerting/).
