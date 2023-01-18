import { ScopedVars } from '@grafana/data';
import * as runtime from '@grafana/runtime';
import { SentryIssuesQuery, SentryStatsV2Query } from 'types';
import { applyTemplateVariables, replaceProjectIDs } from './replace';

describe('replace', () => {
  afterEach(jest.clearAllMocks);

  describe('replaceProjectIDs', () => {
    it('default replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
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
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string, vars: ScopedVars) => {
          for (const key in vars) {
            s = s.replace('${' + key + '}', vars[key].value);
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

    it('should interpolate template variables for statsV2', () => {
      const query: SentryStatsV2Query = {
        refId: '',
        queryType: 'statsV2',
        projectIds: ['${foo}', 'baz'],
        statsCategory: [],
        statsFields: [],
        statsGroupBy: [],
        statsOutcome: [],
        statsReason: [],
      };

      const output = applyTemplateVariables(query, { foo: { value: 'bar', text: 'bar' } }) as SentryStatsV2Query;
      expect(output.projectIds).toStrictEqual(['bar', 'baz']);
    });
  });
});
