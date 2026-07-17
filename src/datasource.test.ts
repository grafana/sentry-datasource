import * as runtime from '@grafana/runtime';
import { SentryDataSource } from './datasource';
import type { DataSourceInstanceSettings } from '@grafana/data';
import type { SentryConfig, SentryProject, SentryRelease, SentryTeam, SentryVariableQuery } from './types';

describe('SentryDataSource', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      containsTemplate: jest.fn(),
      updateTimeRange: jest.fn(),
      getVariables: jest.fn(),
      replace: (s: string) => {
        return s;
      },
    }));
  });
  describe('resource paths', () => {
    it('getTags should request the tags resource', async () => {
      const ds = new SentryDataSource({ jsonData: { orgSlug: 'my-org' } } as DataSourceInstanceSettings<SentryConfig>);
      const getResourceSpy = jest.spyOn(ds, 'getResource').mockResolvedValue([]);
      await ds.getTags();
      expect(getResourceSpy).toHaveBeenCalledWith('api/0/organizations/my-org/tags');
    });
    it('getAttributes should request the trace-items attributes resource without a trailing slash', async () => {
      const ds = new SentryDataSource({ jsonData: { orgSlug: 'my-org' } } as DataSourceInstanceSettings<SentryConfig>);
      const getResourceSpy = jest.spyOn(ds, 'getResource').mockResolvedValue([]);
      await ds.getAttributes();
      expect(getResourceSpy).toHaveBeenCalledWith('api/0/organizations/my-org/trace-items/attributes');
    });
    it('getReleases should request the releases resource', async () => {
      const ds = new SentryDataSource({ jsonData: { orgSlug: 'my-org' } } as DataSourceInstanceSettings<SentryConfig>);
      const getResourceSpy = jest.spyOn(ds, 'getResource').mockResolvedValue([]);
      await ds.getReleases();
      expect(getResourceSpy).toHaveBeenCalledWith('api/0/organizations/my-org/releases', {});
    });
    it('getReleases should pass project ids as query params', async () => {
      const ds = new SentryDataSource({ jsonData: { orgSlug: 'my-org' } } as DataSourceInstanceSettings<SentryConfig>);
      const getResourceSpy = jest.spyOn(ds, 'getResource').mockResolvedValue([]);
      await ds.getReleases('my-org', ['1', '2']);
      expect(getResourceSpy).toHaveBeenCalledWith('api/0/organizations/my-org/releases', { project: ['1', '2'] });
    });
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
      ds.getProjects = jest.fn(() => Promise.resolve([]));
      const query = { type: 'projects' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(results.length).toBe(0);
    });
    it('should return teams slug and name correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getOrgTeams = jest.fn(() =>
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
      ds.getProjects = jest.fn(() =>
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
    it('should return release versions correctly', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getReleases = jest.fn(() =>
        Promise.resolve([{ version: 'v1.0.0' }, { version: 'v1.1.0' }] as SentryRelease[])
      );
      const query = { type: 'releases' } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(ds.getReleases).toHaveBeenCalledWith('', []);
      expect(results.length).toBe(2);
      expect(results).toStrictEqual([
        { text: 'v1.0.0', value: 'v1.0.0' },
        { text: 'v1.1.0', value: 'v1.1.0' },
      ]);
    });
    it('should pass the project filter to getReleases for releases query', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getReleases = jest.fn(() => Promise.resolve([{ version: 'v1.0.0' }] as SentryRelease[]));
      const query = { type: 'releases', projectIds: ['1', '2'] } as SentryVariableQuery;
      const results = await ds.metricFindQuery(query);
      expect(ds.getReleases).toHaveBeenCalledWith('', ['1', '2']);
      expect(results).toStrictEqual([{ text: 'v1.0.0', value: 'v1.0.0' }]);
    });
    it('should return all unique environments when environments query selected and no projectId passed', async () => {
      const ds = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
      ds.getProjects = jest.fn(() =>
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
      ds.getProjects = jest.fn(() =>
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
