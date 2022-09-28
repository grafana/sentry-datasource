import * as runtime from '@grafana/runtime';
import { replaceProjectIDs } from './replace';

describe('replace', () => {
  describe('replaceProjectIDs', () => {
    it('default replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string) => s,
      }));
      const a = replaceProjectIDs(['hello', 'world']);
      expect(a).toStrictEqual(['hello', 'world']);
    });
    it('list with variables passed to replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string) => (s === '${attr}' ? 'foo' : s),
      }));
      const a = replaceProjectIDs(['hello', '${attr}', 'world']);
      expect(a).toStrictEqual(['hello', 'foo', 'world']);
    });
    it('var with multiple value replaceProjectIDs should return valid objects', () => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
        updateTimeRange: jest.fn(),
        getVariables: jest.fn(),
        replace: (s: string): any => (s === '${attr}' ? 'foo,bar' : s),
      }));
      const a = replaceProjectIDs(['hello', '${attr}', 'world']);
      expect(a).toStrictEqual(['hello', 'foo', 'bar', 'world']);
    });
  });
});
