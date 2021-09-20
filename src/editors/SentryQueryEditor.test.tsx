import React from 'react';
import { render } from '@testing-library/react';
import { SentryDataSource } from './../datasource';
import { SentryQueryEditor } from './SentryQueryEditor';
import { SentryQuery } from './../types';

describe('SentryQueryEditor', () => {
  it('render without error', () => {
    const datasource = {} as SentryDataSource;
    const query = {} as SentryQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<SentryQueryEditor datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
