# Sentry data source plugin for Grafana

The Sentry data source plugin lets you query and visualize [Sentry](https://sentry.io/) data within Grafana.

For user-facing documentation on configuration, query types, template variables, and troubleshooting, refer to the [Sentry data source documentation](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/).

## Requirements

- Grafana 10.4.0 or later
- An active Sentry account

## Install the plugin

To install the Sentry data source plugin in your Grafana instance, refer to [Installation](https://grafana.com/grafana/plugins/grafana-sentry-datasource/?tab=installation).

## Development

### Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

1. Build the plugin in development mode:

   ```bash
   npm run dev
   ```

1. Build the plugin in production mode:

   ```bash
   npm run build
   ```

### Backend

1. Build the backend plugin binaries:

   ```bash
   mage -v build:linux
   ```

1. List all available Mage targets:

   ```bash
   mage -l
   ```

### Run Grafana with the plugin

Use Docker Compose to start a Grafana instance with the plugin installed:

```bash
docker compose up
```

### Run tests

```bash
npm run test
```

## Learn more

- [Sentry data source documentation](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/)
- [Build a data source plugin tutorial](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
