import React from 'react';
import { render } from '@testing-library/react';
import { SentryDataSource } from './../datasource';
import { SentryVariableEditor } from './SentryVariableEditor';
import { SentryQuery } from './../types';

describe('SentryVariableEditor', () => {
  it('render without error', () => {
    const datasource = {} as SentryDataSource;
    const query = {} as SentryQuery;
    const onChange = jest.fn();
    const result = render(<SentryVariableEditor datasource={datasource} query={query} onChange={onChange} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
