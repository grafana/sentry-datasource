import React from 'react';
import { render } from '@testing-library/react';
import { MetricsEditor } from './MetricsEditor';
import type { SentryMetricsQuery } from '../../types';

describe('MetricsEditor', () => {
  it('should render without error', () => {
    const query = {
      queryType: 'metrics',
      projectIds: [],
      environments: [],
      metricsQuery: '',
      metricsField: 'session.all',
      refId: 'A',
    } as SentryMetricsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<MetricsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
