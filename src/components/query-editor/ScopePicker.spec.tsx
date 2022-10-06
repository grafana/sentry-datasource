import React from 'react';
import * as runtime from '@grafana/runtime';
import { render } from '@testing-library/react';
import { DataSourceInstanceSettings } from '@grafana/data';
import { ScopePicker } from './ScopePicker';
import { SentryDataSource } from './../../datasource';
import type { SentryQuery, SentryConfig } from './../../types';

describe('ScopePicker', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      updateTimeRange: jest.fn(),
      getVariables: () => [],
      replace: (s: string) => s,
    }));
  });
  it('should render without error', () => {
    const datasource = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
    const query = {} as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<ScopePicker datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
