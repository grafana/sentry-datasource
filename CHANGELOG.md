# Changelog

## 2.2.1 (2025-06-30)

- Fix parsing of next links in paginated requests (#538)
- Dependency updates

## 2.2.0 (2025-06-24)

- Add support for spans (#517)

## 2.1.2 (2025-06-11)

- Dependency updates

## 2.1.1 (2025-05-29)

- Dependency updates

## 2.1.0 (2025-04-17)

- Support sorting direction in the events query builder ([#478](https://github.com/grafana/sentry-datasource/pull/478))
- Support tags auto-completion in the events query builder ([#477](https://github.com/grafana/sentry-datasource/pull/477))
- Dependency updates

## 2.0.0 (2025-04-02)

- Allow choosing fields to fetch for sentry events ([#400](https://github.com/grafana/sentry-datasource/pull/400))
- Create plugin update, bump minimum supported Grafana version to 10.4.0 ([#452](https://github.com/grafana/sentry-datasource/pull/452))
- Update config to support fork tests ([#438](https://github.com/grafana/sentry-datasource/pull/438))
- Dependency updates

## 1.9.0 (2025-02-19)

- Make substatus data available ([#393](https://github.com/grafana/sentry-datasource/pull/393))
- Allow sorting Events by a custom field ([#403](https://github.com/grafana/sentry-datasource/pull/403))
- Migrate from `@grafana/experimental` to `@grafana/plugin-ui` ([#415](https://github.com/grafana/sentry-datasource/pull/415))
- Dependency updates

## 1.8.5 (2024-11-28)

- Dependency updates

## 1.8.4 (2024-11-07)

- Dependency updates

## 1.8.3 (2024-09-26)

- Dependency updates

## 1.8.2 (2024-08-28)

- Add `errorsource` support ([#313](https://github.com/grafana/sentry-datasource/pull/313))
- Dependency updates

## 1.8.1 (2024-08-09)

- Fix timerange bug with Event Stats query ([#279](https://github.com/grafana/sentry-datasource/pull/279))
- Fix Event data link in ID field (with thanks @Pexers) ([#286](https://github.com/grafana/sentry-datasource/pull/286))
- Dependency updates

## 1.8.0 (2024-05-30)

- Add support for Metrics queries (with thanks again to @oblador) ([#254](https://github.com/grafana/sentry-datasource/pull/254))
- Dependency updates

## 1.7.0 (2024-05-07)

- Add support for Events Stats queries (with thanks to @oblador) ([#225](https://github.com/grafana/sentry-datasource/pull/225))
- Minor update to tooltip text when entering an organization slug
- Dependency updates

## 1.6.0 (2024-03-22)

- Dependency updates

## 1.5.0 (2023-12-11)

- Add interval to statsV2
- Bump github.com/grafana/grafana-plugin-sdk-go from 0.179.0 to 0.196.0
- Add getRequiredFields function
- Other dependency updates

## 1.4.0 (2023-11-15)

- Security and dependencies updates
- Support for Sentry Events ([#100](https://github.com/grafana/sentry-datasource/pull/100))
- Support for pagination ([#77](https://github.com/grafana/sentry-datasource/pull/77))
- Updates to Editors

## 1.3.0 (2023-08-29)

- Add support for the secure socks proxy
- Updates sdk version to 0.171.0
- Upgrade moment

## 1.2.1 (2023-05-03)

- Build with latest Go version 1.20.4

## 1.2.0 (2023-04-20)

- Update backend dependencies

## 1.1.0 (2022-12-19)

- Teams template variable support
- Filter projects by team in variables
- Update go to the latest version (1.19.4)
- Update grafana backend dependencies

## 1.0.1 (2022-02-07)

- Docs update to plugin requirements.

## 1.0.0 (2021-11-08)

- Initial release.
