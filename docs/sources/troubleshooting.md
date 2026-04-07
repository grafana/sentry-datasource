---
aliases:
  - /docs/plugins/grafana-sentry-datasource/troubleshooting/
description: Troubleshooting guide for the Sentry data source in Grafana.
keywords:
  - grafana
  - sentry
  - troubleshooting
  - errors
  - authentication
  - query
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Troubleshooting
title: Troubleshoot Sentry data source issues
weight: 500
review_date: "2026-04-07"
---

# Troubleshoot Sentry data source issues

This document provides solutions to common issues you may encounter when configuring or using the Sentry data source. For configuration instructions, refer to [Configure the Sentry data source](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/configure/).

## Authentication errors

These errors occur when the Sentry authentication token is invalid, missing, or doesn't have the required permissions.

### "401 Unauthorized" or "Invalid token"

**Symptoms:**

- Save & test fails with authorization errors
- Queries return access denied messages
- Project and environment drop-downs don't populate

**Possible causes and solutions:**

| Cause                        | Solution                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invalid or expired token     | Generate a new authentication token in Sentry under **Settings** > **Developer Settings** > **Custom Integrations** and update the data source.       |
| Insufficient permissions     | Verify the internal integration has **Read** permissions for **Project**, **Issue & Event**, and **Organization** in Sentry.                          |
| Wrong organization slug      | Verify the **Sentry Org** field matches the slug in your Sentry URL: `https://sentry.io/organizations/{slug}/`.                                      |
| Token created with wrong integration type | Ensure you created an **Internal Integration**, not a public integration. Only internal integrations generate auth tokens suitable for this plugin. |

### "0 projects found" on save and test

**Symptoms:**

- Save & test succeeds but reports "plugin health check successful. 0 projects found."
- No projects appear in the query editor drop-down

**Solutions:**

1. Verify the authentication token's integration has **Read** access to **Project** in Sentry.
1. Confirm the Sentry organization has at least one project.
1. Check that the **Sentry Org** slug matches the organization where projects exist.

## Connection errors

These errors occur when Grafana can't reach the Sentry API.

### "Connection refused" or timeout errors

**Symptoms:**

- Data source test times out
- Queries fail with network errors

**Possible causes and solutions:**

| Cause                            | Solution                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incorrect Sentry URL             | Verify the **Sentry URL** field. For hosted Sentry, leave blank or use `https://sentry.io`. For self-hosted instances, enter your Sentry server URL.            |
| Firewall blocking outbound HTTPS | Ensure firewall rules allow outbound HTTPS (port 443) from the Grafana server to the Sentry API endpoint.                                                     |
| Self-hosted TLS issues           | For self-hosted Sentry with self-signed certificates, enable **Skip TLS Verify** in the data source's additional settings.                                     |
| Network isolation                | For Grafana Cloud accessing a private Sentry instance, configure [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/). |

## Query errors

These errors occur when executing queries against Sentry.

### "No data" or empty results

**Symptoms:**

- Query executes without error but returns no data
- Charts show "No data" message

**Possible causes and solutions:**

| Cause                          | Solution                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Time range doesn't contain data | Expand the dashboard time range or verify data exists in Sentry for the selected period.            |
| Wrong project or environment   | Verify you've selected the correct project and environment in the query editor.                    |
| Query filter too restrictive   | Simplify or remove the query filter to verify data exists, then refine the filter.                 |
| Missing field permissions      | Verify the authentication token has read access to the data type you're querying (issues, events). |

### Query timeout

**Symptoms:**

- Query runs for a long time then fails
- Error mentions timeout or rate limits

**Solutions:**

1. Narrow the dashboard time range to reduce the volume of data returned.
1. Add project and environment filters to reduce the result set.
1. Reduce the **Limit** value in the query editor.
1. For Events Stats or Spans Stats queries, reduce the number of **Group** fields.

### "404" errors on span queries

**Symptoms:**

- Spans or Spans Stats queries return 404 errors
- Other query types work correctly

**Solutions:**

1. Ensure you're running plugin version 2.2.4 or later, which includes a fix for 404 responses when querying spans with attribute aggregation.
1. Verify your Sentry plan includes access to the spans/tracing API.

## Template variable errors

These errors occur when using template variables with the Sentry data source.

### Variables return no values

**Solutions:**

1. Verify the data source connection is working by running **Save & test** in the data source settings.
1. For **Environments** variables, ensure the selected project IDs are valid and the projects have environments configured in Sentry.
1. For **Projects** variables filtered by team, verify the team slug is correct.
1. Check that the authentication token has **Read** permissions for the resources the variable queries.

### Variables are slow to load

**Solutions:**

1. Set variable refresh to **On dashboard load** instead of **On time range change**.
1. For **Projects** variables, filter by team slug to reduce the number of results.

## Performance issues

These issues relate to slow queries or Sentry API limits.

### API rate limit errors

**Symptoms:**

- "Rate limit exceeded" or throttling errors
- Dashboard panels intermittently fail to load

**Solutions:**

1. Reduce the frequency of dashboard auto-refresh.
1. Use larger time intervals in Stats queries to reduce the number of API calls.
1. Reduce the number of panels querying the same Sentry data source on a single dashboard.
1. Enable query caching in Grafana (available in Grafana Enterprise and Grafana Cloud).

## Enable debug logging

To capture detailed error information for troubleshooting:

1. Set the Grafana log level to `debug` in the configuration file:

   ```ini
   [log]
   level = debug
   ```

1. Review logs in `/var/log/grafana/grafana.log` (or your configured log location).
1. Look for entries containing `sentry` for request and response details.
1. Reset the log level to `info` after troubleshooting to avoid excessive log volume.

## Get additional help

If you've tried the solutions in this document and still encounter issues:

1. Check the [Grafana community forums](https://community.grafana.com/) for similar issues.
1. Review the [Sentry data source GitHub issues](https://github.com/grafana/sentry-datasource/issues) for known bugs.
1. Consult the [Sentry documentation](https://docs.sentry.io/) for Sentry-specific guidance.
1. Contact Grafana Support if you're a Cloud Pro, Cloud Contracted, or Enterprise user.
1. When reporting issues, include:
   - Grafana version and Sentry plugin version
   - Error messages (redact sensitive information)
   - Steps to reproduce
   - Relevant configuration (redact credentials)
