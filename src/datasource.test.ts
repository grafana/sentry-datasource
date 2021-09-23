import { DataSourceInstanceSettings } from '@grafana/data';
import { SentryConfig, SentryVariableQuery } from './types';
import { SentryDataSource } from './datasource';

describe('SentryDataSource', () => {
  describe('metricFindQuery', () => {
    it('expect error', () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      const query = {} as SentryVariableQuery;
      expect(() => ds.metricFindQuery(query)).rejects.toEqual('invalid query');
    });
    it('should return organizations name and slug correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.postResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo' },
          { id: '2', name: 'Bar', slug: 'bar' },
        ])
      );
      const query = { type: 'organizations' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(2);
      expect(results).toStrictEqual([
        { text: 'Foo', value: 'foo' },
        { text: 'Bar', value: 'bar' },
      ]);
    });
    it('should return no results when org slug not specified in projects query', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      const query = { type: 'projects' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(0);
    });
    it('should return projects name and slug correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.postResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo' },
          { id: '2', name: 'Bar', slug: 'bar' },
        ])
      );
      const query = { type: 'projects', orgSlug: 'dummy' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(2);
      expect(results).toStrictEqual([
        { text: 'Foo', value: 'foo' },
        { text: 'Bar', value: 'bar' },
      ]);
    });
    it('should return no results when environments query selected and no projectId passed', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.postResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo', environments: ['foo', 'bar', 'baz'] },
          { id: '2', name: 'Bar', slug: 'bar', environments: ['amma', 'aadu', 'ilai', 'eetti'] },
        ])
      );
      const query = { type: 'environments', orgSlug: 'dummy' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(0);
      expect(results).toStrictEqual([]);
    });
    it('should return environments name correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.postResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo', environments: ['foo', 'bar', 'baz'] },
          { id: '2', name: 'Bar', slug: 'bar', environments: ['amma', 'aadu', 'ilai', 'eetti'] },
        ])
      );
      const query = { type: 'environments', orgSlug: 'dummy', projectId: '2' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(4);
      expect(results).toStrictEqual([
        { text: 'amma', value: 'amma' },
        { text: 'aadu', value: 'aadu' },
        { text: 'ilai', value: 'ilai' },
        { text: 'eetti', value: 'eetti' },
      ]);
    });
  });
});
