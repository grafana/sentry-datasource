import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReleasesEditor } from './ReleasesEditor';
import { selectors } from '../../selectors';
import type { SentryReleasesQuery } from '../../types';

describe('ReleasesEditor', () => {
  it('should render without error', () => {
    const query: SentryReleasesQuery = {
      queryType: 'releases',
      projectIds: [],
      environments: [],
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<ReleasesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(screen.getByText(selectors.components.QueryEditor.Releases.Query.label)).toBeInTheDocument();
    expect(screen.getByText(selectors.components.QueryEditor.Releases.Limit.label)).toBeInTheDocument();
  });
  it('should update the query when the filter changes and run it on blur', () => {
    const query: SentryReleasesQuery = {
      queryType: 'releases',
      projectIds: [],
      environments: [],
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<ReleasesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const filterInput = screen.getByPlaceholderText(selectors.components.QueryEditor.Releases.Query.placeholder);
    fireEvent.change(filterInput, { target: { value: 'v1.0' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, releasesQuery: 'v1.0' });
    fireEvent.blur(filterInput);
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should set the filter to undefined when cleared', () => {
    const query: SentryReleasesQuery = {
      queryType: 'releases',
      projectIds: [],
      environments: [],
      releasesQuery: 'v1.0',
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<ReleasesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const filterInput = screen.getByPlaceholderText(selectors.components.QueryEditor.Releases.Query.placeholder);
    fireEvent.change(filterInput, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, releasesQuery: undefined });
  });
  it('should update the query when the limit changes and run it on blur', () => {
    const query: SentryReleasesQuery = {
      queryType: 'releases',
      projectIds: [],
      environments: [],
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<ReleasesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const limitInput = screen.getByPlaceholderText(selectors.components.QueryEditor.Releases.Limit.placeholder);
    fireEvent.change(limitInput, { target: { value: '50' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, releasesLimit: 50 });
    fireEvent.blur(limitInput);
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should set the limit to undefined when cleared', () => {
    const query: SentryReleasesQuery = {
      queryType: 'releases',
      projectIds: [],
      environments: [],
      releasesLimit: 50,
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<ReleasesEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const limitInput = screen.getByPlaceholderText(selectors.components.QueryEditor.Releases.Limit.placeholder);
    fireEvent.change(limitInput, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, releasesLimit: undefined });
  });
});
