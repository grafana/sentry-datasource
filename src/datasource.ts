import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { SentryConfig, SentryQuery } from './types';

export class SentryDataSource extends DataSourceWithBackend<SentryQuery, SentryConfig> {
  constructor(instanceSettings: DataSourceInstanceSettings<SentryConfig>) {
    super(instanceSettings);
  }
  metricFindQuery(): Promise<MetricFindValue[]> {
    return new Promise((resolve, reject) => {
      reject('not implemented');
    });
  }
}
