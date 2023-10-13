import React from 'react';
import * as runtime from '@grafana/runtime';
import { render, waitFor } from '@testing-library/react';
import { SentryDataSource } from './../datasource';
import { SentryVariableEditor } from './SentryVariableEditor';
import type { SentryVariableQuery } from './../types';

describe('SentryVariableEditor', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      containsTemplate: jest.fn(),
      updateTimeRange: jest.fn(),
      getVariables: () => {
        return [];
      },
      replace: (s: string) => {
        return s;
      },
    }));
  });
  it('render error when orgId is not available', () => {
    const datasource = {} as SentryDataSource;
    datasource.getOrgSlug = jest.fn(() => '');
    datasource.getOrgTeams = jest.fn(() => Promise.resolve([]));
    const query = {} as SentryVariableQuery;
    const onChange = jest.fn();
    const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('error-message')).toBeInTheDocument();
  });
  it('render without error', () => {
    const datasource = {} as SentryDataSource;
    datasource.getOrgSlug = jest.fn(() => 'foo');
    datasource.getOrgTeams = jest.fn(() => Promise.resolve([]));
    const query = {} as SentryVariableQuery;
    const onChange = jest.fn();
    const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.queryByTestId('error-message')).not.toBeInTheDocument();
  });
  describe('projects', () => {
    it(`should render projects filter for projects query`, async () => {
      const datasource = {} as SentryDataSource;
      datasource.getOrgSlug = jest.fn(() => 'foo');
      datasource.getOrganizations = jest.fn(() => Promise.resolve([]));
      datasource.getOrgTeams = jest.fn(() => Promise.resolve([]));
      const query = { type: 'projects' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      await waitFor(() => {
        expect(result.container.firstChild).not.toBeNull();
        expect(result.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(result.queryByTestId('variable-query-editor-environments-filter')).not.toBeInTheDocument();
      });
    });
  });
  describe('environments', () => {
    it(`should render environments filters for environments query`, async () => {
      const datasource = {} as SentryDataSource;
      datasource.getOrgSlug = jest.fn(() => 'foo');
      datasource.getProjects = jest.fn(() => Promise.resolve([]));
      datasource.getOrgTeams = jest.fn(() => Promise.resolve([]));
      const query = { type: 'environments' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      await waitFor(() => {
        expect(result.container.firstChild).not.toBeNull();
        expect(result.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(result.getByTestId('variable-query-editor-project-select-container')).toBeInTheDocument();
      });
    });
  });
});
