import { DataSourceInstanceSettings } from '@grafana/data';
import { SentryConfig } from './types';
import { SentryDataSource } from './datasource';

describe('SentryDataSource', () => {
  describe('metricFindQuery', () => {
    it('expect error', () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      expect(() => ds.metricFindQuery()).rejects.toEqual('not implemented');
    });
  });
});
