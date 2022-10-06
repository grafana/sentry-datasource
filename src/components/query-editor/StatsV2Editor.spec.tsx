import React from 'react';
import { render } from '@testing-library/react';
import { StatsV2Editor } from './StatsV2Editor';
import type { SentryQuery } from './../../types';

describe('StatsV2Editor', () => {
  it('should render without error', () => {
    const query = { queryType: 'statsV2' } as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<StatsV2Editor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
