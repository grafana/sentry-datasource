import React from 'react';
import { render } from '@testing-library/react';
import { IssuesEditor } from './IssuesEditor';
import type { SentryIssuesQuery } from './../../types';

describe('IssuesEditor', () => {
  it('should render without error', () => {
    const query: SentryIssuesQuery = {
      queryType: 'issues',
      projectIds: [],
      environments: [],
      issuesQuery: '',
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<IssuesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
