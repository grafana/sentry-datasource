import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricsEditor } from './MetricsEditor';
import { selectors } from '../../selectors';
import type { SentryMetricsQuery } from '../../types';

const sessionsFields = [
  'sum(session)',
  'count_unique(user)',
  'crash_free_rate(session)',
  'crash_free_rate(user)',
  'crash_rate(session)',
  'crash_rate(user)',
  'anr_rate()',
  'foreground_anr_rate()',
];

describe('MetricsEditor', () => {
  it('should render without error', () => {
    const query = {
      queryType: 'metrics',
      projectIds: [],
      environments: [],
      metricsQuery: '',
      metricsField: 'sum(session)',
      refId: 'A',
    } as SentryMetricsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<MetricsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
  it('should offer the sessions api fields', async () => {
    const query: SentryMetricsQuery = {
      queryType: 'metrics',
      projectIds: [],
      environments: [],
      metricsQuery: '',
      metricsField: 'sum(session)',
      refId: 'A',
    };
    render(<MetricsEditor query={query} onChange={jest.fn()} onRunQuery={jest.fn()} />);
    await userEvent.click(screen.getByText('sum(session)'));
    const menu = within(screen.getByLabelText('Select options menu'));
    for (const field of sessionsFields) {
      expect(menu.getByText(field)).toBeInTheDocument();
    }
  });
  it('should offer the sessions api fields for sorting but not release', async () => {
    const query: SentryMetricsQuery = {
      queryType: 'metrics',
      projectIds: [],
      environments: [],
      metricsQuery: '',
      metricsField: 'sum(session)',
      metricsGroupBy: 'project',
      refId: 'A',
    };
    render(<MetricsEditor query={query} onChange={jest.fn()} onRunQuery={jest.fn()} />);
    // the sort select renders before the order select, both with the same placeholder
    await userEvent.click(screen.getAllByText(selectors.components.QueryEditor.Metrics.Sort.placeholder)[0]);
    const menu = within(screen.getByLabelText('Select options menu'));
    for (const field of sessionsFields) {
      expect(menu.getByText(field)).toBeInTheDocument();
    }
    expect(menu.queryByText('release')).not.toBeInTheDocument();
  });
});
