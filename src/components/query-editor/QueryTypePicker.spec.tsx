import React from 'react';
import { render } from '@testing-library/react';
import { QueryTypePicker } from './QueryTypePicker';
import { SentryQuery } from './../../types';

describe('QueryTypePicker', () => {
  it('should render without error', () => {
    const query = {} as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<QueryTypePicker query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
