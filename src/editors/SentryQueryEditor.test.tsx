import React from 'react';
import * as runtime from '@grafana/runtime';
import { render, waitFor } from '@testing-library/react';
import { SentryDataSource } from './../datasource';
import { SentryQueryEditor } from './SentryQueryEditor';
import type { SentryQuery } from './../types';

describe('SentryQueryEditor', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      containsTemplate: jest.fn(),
      updateTimeRange: jest.fn(),
      getVariables: () => [],
      replace: (s: string) => s,
    }));
  });
  it('render error when orgSlug missing', () => {
    const datasource = {} as SentryDataSource;
    datasource.getOrgSlug = jest.fn(() => '');
    const query = {} as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<SentryQueryEditor datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('error-message')).toBeInTheDocument();
  });
  it('render without error', () => {
    const datasource = {} as SentryDataSource;
    datasource.getOrgSlug = jest.fn(() => 'foo');
    datasource.getProjects = jest.fn(() => Promise.resolve([]));
    const query = {} as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<SentryQueryEditor datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    waitFor(() => {
      expect(result.container.firstChild).not.toBeNull();
      expect(result.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });
});
