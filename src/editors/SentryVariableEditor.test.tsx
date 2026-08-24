import React from 'react';
import * as runtime from '@grafana/runtime';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SentryDataSource } from './../datasource';
import { SentryVariableEditor } from './SentryVariableEditor';
import type { SentryProject, SentryVariableQuery } from './../types';
import { selectors } from 'selectors';

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
        expect(result.getByTestId(selectors.components.VariablesEditor.Project.id)).toBeInTheDocument();
      });
    });
  });
  describe('releases', () => {
    it(`should render the project filter for releases query`, async () => {
      const datasource = {} as SentryDataSource;
      datasource.getOrgSlug = jest.fn(() => 'foo');
      datasource.getProjects = jest.fn(() => Promise.resolve([]));
      datasource.getOrgTeams = jest.fn(() => Promise.resolve([]));
      const query = { type: 'releases' } as SentryVariableQuery;
      const onChange = jest.fn();
      const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      await waitFor(() => {
        expect(result.container.firstChild).not.toBeNull();
        expect(result.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(result.getByTestId(selectors.components.VariablesEditor.Project.id)).toBeInTheDocument();
      });
    });
    it(`should update the query when a project is selected for releases query`, async () => {
      const project: SentryProject = {
        id: '1',
        name: 'Project One',
        slug: 'project-one',
        environments: [],
        team: { id: 't1', name: 'Team One', slug: 'team-one' },
        teams: [],
      };
      const datasource = {} as SentryDataSource;
      datasource.getOrgSlug = jest.fn(() => 'foo');
      datasource.getProjects = jest.fn(() => Promise.resolve([project]));
      datasource.getOrgTeams = jest.fn(() => Promise.resolve([]));
      const query = { type: 'releases' } as SentryVariableQuery;
      const onChange = jest.fn();
      render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
      const projectSelector = await screen.findByTestId(selectors.components.VariablesEditor.Project.id);
      await userEvent.click(within(projectSelector).getByRole('combobox'));
      await userEvent.click(await screen.findByText('Project One (1)'));
      const expectedQuery = { type: 'releases', projectIds: ['1'] };
      expect(onChange).toHaveBeenCalledWith(expectedQuery, JSON.stringify(expectedQuery));
    });
  });
});
