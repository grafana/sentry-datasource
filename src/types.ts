import { DataSourceJsonData, DataQuery } from '@grafana/data';

//#region Constants
//#endregion

//#region Sentry Objects
export type SentryOrganization = {
  id: string;
  name: string;
  slug: string;
  dateCreated: string;
  status: {
    id: string;
    name: string;
  };
};
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

//#region Resource call Query
export type ResourceCallOrganizations = {
  type: 'organizations';
};
export type SentryResourceCallQuery = ResourceCallOrganizations;
//#endregion

//#region Resource call Response
export type ResourceCallOrganizationsResponse = SentryOrganization[];
export type SentryResourceCallResponse = ResourceCallOrganizationsResponse;
//#endregion

//#region Selectable values
//#endregion

//#region Default values
export const DEFAULT_SENTRY_URL = `https://sentry.io`;
//#endregion
