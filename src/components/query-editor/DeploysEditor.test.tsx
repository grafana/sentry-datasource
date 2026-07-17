import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DeploysEditor } from './DeploysEditor';
import { selectors } from '../../selectors';
import type { SentryDeploysQuery } from '../../types';

describe('DeploysEditor', () => {
  it('should render without error', () => {
    const query: SentryDeploysQuery = {
      queryType: 'deploys',
      projectIds: [],
      environments: [],
      deploysReleaseVersion: '',
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<DeploysEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(screen.getByText(selectors.components.QueryEditor.Deploys.ReleaseVersion.label)).toBeInTheDocument();
    expect(screen.getByText(selectors.components.QueryEditor.Deploys.Limit.label)).toBeInTheDocument();
  });
  it('should update the query when the release version changes and run it on blur', () => {
    const query: SentryDeploysQuery = {
      queryType: 'deploys',
      projectIds: [],
      environments: [],
      deploysReleaseVersion: '',
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<DeploysEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const versionInput = screen.getByPlaceholderText(
      selectors.components.QueryEditor.Deploys.ReleaseVersion.placeholder
    );
    fireEvent.change(versionInput, { target: { value: 'v1.0' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, deploysReleaseVersion: 'v1.0' });
    fireEvent.blur(versionInput);
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should pass template variables through as plain text', () => {
    const query: SentryDeploysQuery = {
      queryType: 'deploys',
      projectIds: [],
      environments: [],
      deploysReleaseVersion: '',
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<DeploysEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const versionInput = screen.getByPlaceholderText(
      selectors.components.QueryEditor.Deploys.ReleaseVersion.placeholder
    );
    fireEvent.change(versionInput, { target: { value: '${release}' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, deploysReleaseVersion: '${release}' });
  });
  it('should update the query when the limit changes and run it on blur', () => {
    const query: SentryDeploysQuery = {
      queryType: 'deploys',
      projectIds: [],
      environments: [],
      deploysReleaseVersion: '1.0.0',
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<DeploysEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const limitInput = screen.getByPlaceholderText(selectors.components.QueryEditor.Deploys.Limit.placeholder);
    fireEvent.change(limitInput, { target: { value: '50' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, deploysLimit: 50 });
    fireEvent.blur(limitInput);
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should set the limit to undefined when cleared', () => {
    const query: SentryDeploysQuery = {
      queryType: 'deploys',
      projectIds: [],
      environments: [],
      deploysReleaseVersion: '1.0.0',
      deploysLimit: 50,
      refId: 'A',
    };
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<DeploysEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    const limitInput = screen.getByPlaceholderText(selectors.components.QueryEditor.Deploys.Limit.placeholder);
    fireEvent.change(limitInput, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, deploysLimit: undefined });
  });
});
