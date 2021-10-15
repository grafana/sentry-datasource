import React from 'react';
import { render } from '@testing-library/react';
import { IssuesEditor } from './IssuesEditor';
import { SentryQuery } from './../../types';

describe('IssuesEditor', () => {
  it('should render without error', () => {
    const query = { queryType: 'issues' } as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<IssuesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
