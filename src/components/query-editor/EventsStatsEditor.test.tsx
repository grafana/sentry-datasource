import React from 'react';
import { render } from '@testing-library/react';
import { EventsStatsEditor } from './EventsStatsEditor';
import type { SentryEventsStatsQuery } from '../../types';

describe('EventsStatsEditor', () => {
  it('should render without error', () => {
    const query = {
      queryType: 'eventsStats',
      projectIds: [],
      environments: [],
      eventsStatsQuery: '',
      eventsStatsGroups: [],
      eventsStatsYAxis: [],
      refId: 'A',
    } as SentryEventsStatsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<EventsStatsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
