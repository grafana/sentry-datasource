import React from 'react';
import * as runtime from '@grafana/runtime';
import { render, waitFor } from '@testing-library/react';
import { DataSourceInstanceSettings } from '@grafana/data';
import { ProjectSelector } from './ProjectSelector';
import { SentryDataSource } from './../../datasource';
import { SentryConfig } from './../../types';

describe('ProjectSelector', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      getVariables: () => [],
      replace: (s: string) => s,
    }));
  });
  it('should render without error', () => {
    const datasource = new SentryDataSource({} as DataSourceInstanceSettings<SentryConfig>);
    datasource.postResource = jest.fn(() => Promise.resolve([]));
    datasource.getProjects = jest.fn(() => Promise.resolve([]));
    const onChange = jest.fn();
    const result = render(<ProjectSelector datasource={datasource} onValuesChange={onChange} mode="id" orgSlug="foo" values={[]} />);
    waitFor(() => {
      expect(result.container.firstChild).not.toBeNull();
    });
  });
});
