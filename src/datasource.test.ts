import { DataSourceInstanceSettings } from '@grafana/data';
import { SentryDataSource } from './datasource';

describe('SentryDataSource', () => {
  describe('metricFindQuery', () => {
    it('expect error', () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings);
      expect(() => ds.metricFindQuery()).rejects.toEqual('not implemented');
    });
  });
});
