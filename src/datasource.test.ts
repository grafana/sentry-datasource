import * as runtime from '@grafana/runtime';
import { SentryDataSource } from './datasource';
import type { DataSourceInstanceSettings } from '@grafana/data/types';
import type { SentryConfig, SentryProject, SentryTeam, SentryVariableQuery } from './types';

describe('SentryDataSource', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      updateTimeRange: jest.fn(),
      getVariables: jest.fn(),
      replace: (s: string) => {
        return s;
      },
    }));
  });
  describe('metricFindQuery', () => {
    it('expect no results when invalid query passed', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      const query = {} as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(0);
      expect(results).toStrictEqual([]);
    });
    it('should return no results when org slug not specified in projects query', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getResource = jest.fn(() => Promise.resolve([]));
      const query = { type: 'projects' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(0);
    });
    it('should return teams slug and name correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo' },
          { id: '2', name: 'Bar', slug: 'bar' },
        ] as SentryTeam[])
      );
      const query = { type: 'teams', orgSlug: 'dummy' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(2);
      expect(results).toStrictEqual([
        { text: 'Foo (foo)', value: 'foo' },
        { text: 'Bar (bar)', value: 'bar' },
      ]);
    });
    it('should return projects name and id correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo' },
          { id: '2', name: 'Bar', slug: 'bar' },
        ] as SentryProject[])
      );
      const query = { type: 'projects', orgSlug: 'dummy' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(2);
      expect(results).toStrictEqual([
        { text: 'Foo (1)', value: '1' },
        { text: 'Bar (2)', value: '2' },
      ]);
    });
    it('should return all unique environments when environments query selected and no projectId passed', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo', environments: ['foo', 'bar', 'baz', 'amma', 'boo'] },
          { id: '2', name: 'Bar', slug: 'bar', environments: ['amma', 'aadu', 'ilai', 'eetti'] },
        ] as SentryProject[])
      );
      const query = { type: 'environments', orgSlug: 'dummy', projectIds: [] } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(8);
    });
    it('should return environments name correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getResource = jest.fn(() =>
        Promise.resolve([
          { id: '1', name: 'Foo', slug: 'foo', environments: ['foo', 'bar', 'baz'] },
          { id: '2', name: 'Bar', slug: 'bar', environments: ['amma', 'aadu', 'ilai', 'eetti'] },
          { id: '3', name: 'Countries', slug: 'countries', environments: ['india', 'uk', 'usa', 'japan', 'egypt'] },
          { id: '4', name: 'Colors', slug: 'colors', environments: ['red', 'yellow', 'green', 'pink'] },
          { id: '5', name: 'Secondary Colors', slug: 'sec-colors', environments: ['yellow', 'purple', 'green'] },
        ] as SentryProject[])
      );
      const query = { type: 'environments', orgSlug: 'dummy', projectIds: ['2', '4', '5'] } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(9);
      expect(results).toStrictEqual([
        { text: 'amma', value: 'amma' },
        { text: 'aadu', value: 'aadu' },
        { text: 'ilai', value: 'ilai' },
        { text: 'eetti', value: 'eetti' },
        { text: 'red', value: 'red' },
        { text: 'yellow', value: 'yellow' },
        { text: 'green', value: 'green' },
        { text: 'pink', value: 'pink' },
        { text: 'purple', value: 'purple' },
      ]);
    });
  });
});
