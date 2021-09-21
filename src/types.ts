import { DataSourceJsonData, DataQuery } from '@grafana/data';

//#region Constants
//#endregion

//#region Config
export interface SentryConfig extends DataSourceJsonData {
  url: string;
}
export interface SentrySecureConfig {
  authToken: string;
}
//#endregion

//#region Query
export interface SentryQuery extends DataQuery {}
//#endregion

//#region Variable Query
export interface SentryVariableQuery {}
//#endregion

//#region Selectable values
//#endregion

//#region Default values
export const DEFAULT_SENTRY_URL = `https://sentry.io`;
//#endregion
