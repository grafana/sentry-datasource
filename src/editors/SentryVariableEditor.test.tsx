import React from 'react';
import * as runtime from '@grafana/runtime';
import { render, waitFor } from '@testing-library/react';
import { SentryDataSource } from './../datasource';
import { SentryVariableEditor } from './SentryVariableEditor';
import { SentryVariableQuery } from './../types';

describe('SentryVariableEditor', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      getVariables: () => {
        return [];
      },
      replace: (s: string) => {
        return s;
      },
    }));
  });
  it('render without error', () => {
    const datasource = {} as SentryDataSource;
    const query = {} as SentryVariableQuery;
    const onChange = jest.fn();
    const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
    expect(result.container.firstChild).not.toBeNull();
  });
  describe('organization', () => {
    it('render type selector correctly', () => {
      const datasource = {} as SentryDataSource;
      const query = { type: 'organizations' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      expect(result.container.firstChild).not.toBeNull();
      expect(result.getByTestId('variable-query-editor-query-type-selector-container')).toBeInTheDocument();
      expect(result.queryByTestId('variable-query-editor-environments-filter')).not.toBeInTheDocument();
    });
  });
  describe('projects', () => {
    it(`shouldn't render projects filter for non project query`, () => {
      const datasource = {} as SentryDataSource;
      const query = { type: 'organizations' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      expect(result.container.firstChild).not.toBeNull();
      expect(result.queryByTestId('variable-query-editor-projects-filter')).not.toBeInTheDocument();
      expect(result.queryByTestId('variable-query-editor-environments-filter')).not.toBeInTheDocument();
    });
    it(`should render projects filter for projects query`, async () => {
      const datasource = {} as SentryDataSource;
      datasource.getOrganizations = jest.fn(() => Promise.resolve([]));
      const query = { type: 'projects' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      await waitFor(() => {
        expect(result.container.firstChild).not.toBeNull();
        expect(result.getByTestId('variable-query-editor-projects-filter')).toBeInTheDocument();
        expect(result.queryByTestId('variable-query-editor-environments-filter')).not.toBeInTheDocument();
      });
    });
  });
  describe('environments', () => {
    it(`should render environments filters for environments query`, async () => {
      const datasource = {} as SentryDataSource;
      datasource.getOrganizations = jest.fn(() => Promise.resolve([]));
      const query = { type: 'environments' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      await waitFor(() => {
        expect(result.container.firstChild).not.toBeNull();
        expect(result.getByTestId('variable-query-editor-projects-filter')).toBeInTheDocument();
        expect(result.getByTestId('variable-query-editor-environments-filter')).toBeInTheDocument();
      });
    });
  });
});
