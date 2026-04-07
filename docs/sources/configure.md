---
aliases:
  - /docs/plugins/grafana-sentry-datasource/configure/
description: Configure the Sentry data source in Grafana, including authentication setup and provisioning.
keywords:
  - grafana
  - sentry
  - data source
  - configuration
  - authentication
  - auth token
  - provisioning
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Configure
title: Configure the Sentry data source
weight: 100
review_date: "2026-04-07"
---

# Configure the Sentry data source

This document explains how to configure the Sentry data source in Grafana.

## Before you begin

Before configuring the data source, ensure you have:

- **Grafana version:** Grafana 10.4.0 or later.
- **Grafana permissions:** Organization administrator role. Refer to [Permissions](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/roles-and-permissions/) for more information.
- **Sentry account:** An active Sentry account.
- **Sentry role:** The Admin, Manager, or Owner role in Sentry, required to create an internal integration token.

## Get an authentication token from Sentry

To configure the Sentry data source plugin, you need an internal integration token from Sentry:

1. Go to `https://sentry.io`.
1. Navigate to **Settings** > **Developer Settings** > **Custom Integrations**.
1. Click **Create New Integration** and select **Internal Integration**.
1. Enter a valid name, such as _Grafana_.
1. Under **Permissions**, grant **Read** access to the required resources, such as **Project**, **Issue & Event**, and **Organization**.
1. Click **Save Changes**, then scroll down to **Tokens** and click **New Token**.
1. Copy the token for use in the **Sentry Auth Token** field when configuring the data source in Grafana.

{{< admonition type="note" >}}
The Admin, Manager, or Owner role in Sentry is required to create internal integrations.
{{< /admonition >}}

## Add the data source

To add the Sentry data source in Grafana:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Type `Sentry` in the search bar.
1. Select **Sentry**.
1. Click **Add new data source**.

## Configure settings

The following table describes the available configuration settings.

### Sentry settings

| Setting              | Description                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sentry URL**       | The Sentry URL to connect to. If left blank, the default `https://sentry.io` is used. Set this to your self-hosted Sentry URL if you aren't using the hosted service.                        |
| **Sentry Org**       | The Sentry organization slug. This is the last segment of your organization URL: `https://sentry.io/organizations/{organization_slug}/`. Enter only the slug, not the full URL.              |
| **Sentry Auth Token** | The authentication token from Sentry. Create one from `https://sentry.io/settings/{organization_slug}/developer-settings/` using the steps in the previous section.                          |

### Additional settings

These optional settings provide more control over your data source connection.

| Setting                      | Description                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Skip TLS Verify**          | Skip TLS certificate verification. Use this option for self-hosted Sentry instances with self-signed certificates.       |
| **Enable Secure Socks Proxy** | Enable proxying the data source connection through the secure socks proxy to a different network. Available in Grafana 10.0.0 and later when the proxy is enabled in Grafana configuration. |

## Verify the connection

Click **Save & test** to verify the connection. A successful test displays the message: **plugin health check successful. N projects found.**, where _N_ is the number of projects accessible with the configured credentials.

## Provision the data source

You can define the Sentry data source in YAML files as part of Grafana's provisioning system.
For more information, refer to [Provisioning Grafana](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/provisioning/#data-sources).

```yaml
apiVersion: 1

datasources:
  - name: Sentry
    type: grafana-sentry-datasource
    access: proxy
    jsonData:
      url: https://sentry.io
      orgSlug: <ORGANIZATION_SLUG>
    secureJsonData:
      authToken: <AUTH_TOKEN>
```

The following table describes the provisioning keys.

| Key                               | Description                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `jsonData.url`                    | The Sentry URL. Defaults to `https://sentry.io`.                                                       |
| `jsonData.orgSlug`                | The Sentry organization slug.                                                                          |
| `jsonData.tlsSkipVerify`          | Set to `true` to skip TLS certificate verification for self-hosted Sentry.                             |
| `jsonData.enableSecureSocksProxy` | Set to `true` to proxy the connection through the secure socks proxy.                                  |
| `secureJsonData.authToken`        | The Sentry authentication token.                                                                       |
