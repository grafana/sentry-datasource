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

## Release

Releases are automated with [release-please](https://github.com/googleapis/release-please). The version number and the changelog both come from commit messages. There is nothing to edit by hand.

### What you do

Give your pull request a [Conventional Commits](https://www.conventionalcommits.org/) title. The `PR Title` check makes sure of this. The repository squash-merges, so the pull request title becomes the commit subject that release-please reads.

| Prefix                                                             | Effect on the next release               |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `fix:`                                                             | patch version                            |
| `feat:`                                                            | minor version                            |
| `feat!:`, or a `BREAKING CHANGE:` footer                           | major version                            |
| `chore:`                                                           | no release, hidden from the changelog    |
| `docs:`, `test:`, `build:`, `ci:`, `refactor:`, `perf:`, `revert:` | no version bump, listed in the changelog |

### What happens next

1. release-please opens a `chore(main): release X.Y.Z` pull request. It keeps that pull request current as more commits land.
2. When you merge that pull request, the tag and the GitHub release are created, and the plugin is published to the prod catalog.
3. Each other push to `main` is published to the dev catalog instead.

### Do not

Do not change the version in `package.json`, and do not write `CHANGELOG.md` entries by hand. release-please owns both files. A manual edit puts `package.json` out of step with `.release-please-manifest.json`, and the next release then gets a wrong version.

To release a specific version, add a `Release-As: X.Y.Z` footer to a commit instead of changing the version.

## Learn more

- [Sentry data source documentation](https://grafana.com/docs/plugins/grafana-sentry-datasource/latest/)
- [Build a data source plugin tutorial](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana tutorials](https://grafana.com/tutorials/)
