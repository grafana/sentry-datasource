import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { SentryConfig, SentryOrganization, SentryQuery, SentryResourceCallQuery, SentryResourceCallResponse } from './types';

export class SentryDataSource extends DataSourceWithBackend<SentryQuery, SentryConfig> {
  constructor(instanceSettings: DataSourceInstanceSettings<SentryConfig>) {
    super(instanceSettings);
  }
  metricFindQuery(): Promise<MetricFindValue[]> {
    return new Promise((resolve, reject) => {
      reject('not implemented');
    });
  }
  private postResourceLocal(body: SentryResourceCallQuery): Promise<SentryResourceCallResponse> {
    return this.postResource('', body);
  }
  getOrganizations(): Promise<SentryOrganization[]> {
    return this.postResourceLocal({ type: 'organizations' });
  }
}
