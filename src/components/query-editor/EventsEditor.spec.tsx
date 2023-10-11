import React from 'react';
import { render } from '@testing-library/react';
import { EventsEditor } from './EventsEditor';
import type { SentryEventsQuery } from '../../types';

describe('EventsEditor', () => {
  it('should render without error', () => {
    const query = {
      queryType: 'events',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      refId: 'A',
    } as SentryEventsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
