import { ScopedVars } from '@grafana/data';
import * as runtime from '@grafana/runtime';
import {
  SentryDeploysQuery,
  SentryEventsQuery,
  SentryIssuesQuery,
  SentryReleasesQuery,
  SentrySpansQuery,
  SentrySpansStatsQuery,
  SentryStatsV2Query,
  SentryVariableQuery,
} from 'types';
import { applyTemplateVariables, applyTemplateVariablesToVariableQuery, replaceProjectIDs } from './replace';

describe('replace', () => {
  afterEach(jest.clearAllMocks);

  describe('replaceProjectIDs', () => {
    it('default replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        containsTemplate: jest.fn(),
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string) => {
          return s;
        },
      }));
      const a = replaceProjectIDs(['hello', 'world']);
      expect(a).toStrictEqual(['hello', 'world']);
    });
    it('list with variables passed to replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        containsTemplate: jest.fn(),
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string) => {
          return s === '${attr}' ? 'foo' : s;
        },
      }));
      const a = replaceProjectIDs(['hello', '${attr}', 'world']);
      expect(a).toStrictEqual(['hello', 'foo', 'world']);
    });
    it('var with multiple value replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        containsTemplate: jest.fn(),
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string): any => {
          return s === '${attr}' ? 'foo,bar' : s;
        },
      }));
      const a = replaceProjectIDs(['hello', '${attr}', 'world']);
      expect(a).toStrictEqual(['hello', 'foo', 'bar', 'world']);
    });
  });

  describe('applyTemplateVariables', () => {
    beforeEach(() => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        containsTemplate: jest.fn(),
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string, vars: ScopedVars) => {
          for (const key in vars) {
            s = s.replace('${' + key + '}', vars[key]?.value);
          }
          return s;
        },
      }));
    });

    it('should interpolate template variables for issues', () => {
      const query: SentryIssuesQuery = {
        refId: '',
        queryType: 'issues',
        projectIds: ['${foo}', 'baz'],
        environments: [],
        issuesQuery: 'hello ${foo}',
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentryIssuesQuery;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
      expect(output.issuesQuery).toStrictEqual('hello bar');
    });

    it('should interpolate template variables for events', () => {
      const query: SentryEventsQuery = {
        refId: '',
        queryType: 'events',
        projectIds: ['${foo}', 'baz'],
        environments: ['${foo}', 'baz'],
        eventsQuery: 'hello ${foo}',
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentryEventsQuery;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
      expect(output.environments).toStrictEqual(['bar', 'baz']);
      expect(output.eventsQuery).toStrictEqual('hello bar');
    });

    it('should interpolate template variables for spans', () => {
      const query: SentrySpansQuery = {
        refId: '',
        queryType: 'spans',
        projectIds: ['${foo}', 'baz'],
        environments: ['${foo}', 'baz'],
        eventsQuery: 'hello ${foo}',
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentrySpansQuery;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
      expect(output.environments).toStrictEqual(['bar', 'baz']);
      expect(output.eventsQuery).toStrictEqual('hello bar');
    });

    it('should interpolate template variables for spansStats', () => {
      const query: SentrySpansStatsQuery = {
        refId: '',
        queryType: 'spansStats',
        projectIds: ['${foo}', 'baz'],
        environments: ['${foo}', 'baz'],
        eventsStatsQuery: 'hello ${foo}',
        eventsStatsYAxis: [],
        eventsStatsGroups: [],
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentrySpansStatsQuery;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
      expect(output.environments).toStrictEqual(['bar', 'baz']);
      expect(output.eventsStatsQuery).toStrictEqual('hello bar');
    });

    it('should interpolate template variables for statsV2', () => {
      const query: SentryStatsV2Query = {
        refId: '',
        queryType: 'statsV2',
        projectIds: ['${foo}', 'baz'],
        statsCategory: [],
        statsFields: [],
        statsGroupBy: [],
        statsInterval: '',
        statsOutcome: [],
        statsReason: [],
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentryStatsV2Query;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
    });

    it('should interpolate the interval for statsV2', () => {
      const query: SentryStatsV2Query = {
        refId: '',
        queryType: 'statsV2',
        projectIds: [],
        statsCategory: [],
        statsFields: [],
        statsGroupBy: [],
        statsInterval: '${__interval}',
        statsOutcome: [],
        statsReason: [],
      };

      const output = applyTemplateVariables(query, { __interval: { value: '30s', text: '30s' } }) as SentryStatsV2Query;
      expect(output.statsInterval).toStrictEqual('30s');
    });

    it('should interpolate template variables for releases', () => {
      const query: SentryReleasesQuery = {
        refId: '',
        queryType: 'releases',
        projectIds: ['${foo}', 'baz'],
        environments: ['${foo}', 'baz'],
        releasesQuery: 'hello ${foo}',
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentryReleasesQuery;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
      expect(output.environments).toStrictEqual(['bar', 'baz']);
      expect(output.releasesQuery).toStrictEqual('hello bar');
    });

    it('should interpolate template variables for deploys', () => {
      const query: SentryDeploysQuery = {
        refId: '',
        queryType: 'deploys',
        projectIds: ['${foo}', 'baz'],
        environments: [],
        deploysReleaseVersion: '${foo}',
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentryDeploysQuery;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
      expect(output.deploysReleaseVersion).toStrictEqual('bar');
    });
  });

  describe('applyTemplateVariablesToVariableQuery', () => {
    beforeEach(() => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        containsTemplate: jest.fn(),
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string) => {
          return s === '${project}' ? '42' : s;
        },
      }));
    });

    it('should interpolate project ids for the releases variable query', () => {
      const query: SentryVariableQuery = { type: 'releases', projectIds: ['${project}', '7'] };
      const output = applyTemplateVariablesToVariableQuery(query);
      expect(output).toStrictEqual({ type: 'releases', projectIds: ['42', '7'] });
    });

    it('should expand multi-value project variables for the releases variable query', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        containsTemplate: jest.fn(),
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string) => {
          return s === '${project}' ? '42,43' : s;
        },
      }));
      const query: SentryVariableQuery = { type: 'releases', projectIds: ['${project}', '7'] };
      const output = applyTemplateVariablesToVariableQuery(query);
      expect(output).toStrictEqual({ type: 'releases', projectIds: ['42', '43', '7'] });
    });
  });
});
