import React from 'react';
import { DataSourceSettings } from '@grafana/data';
import { render } from '@testing-library/react';
import { SentryConfigEditor } from './SentryConfigEditor';
import { SentryConfig, SentrySecureConfig } from './../types';

describe('SentryConfigEditor', () => {
  it('render without error', () => {
    const options = {} as DataSourceSettings<SentryConfig, SentrySecureConfig>;
    const onOptionsChange = jest.fn();
    const result = render(<SentryConfigEditor options={options} onOptionsChange={onOptionsChange} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
