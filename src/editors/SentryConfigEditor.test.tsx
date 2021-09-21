import React from 'react';
import { DataSourceSettings } from '@grafana/data';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SentryConfigEditor } from './SentryConfigEditor';
import { DEFAULT_SENTRY_URL, SentryConfig, SentrySecureConfig } from './../types';
import { selectors } from 'selectors';

describe('SentryConfigEditor', () => {
  it('render default editor without error', () => {
    const options = {} as DataSourceSettings<SentryConfig, SentrySecureConfig>;
    const onOptionsChange = jest.fn();
    const result = render(<SentryConfigEditor options={options} onOptionsChange={onOptionsChange} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('sentry-config-editor-url-row')).toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-url-row')).getByTestId('sentry-config-editor-url')).toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-url-row')).getByDisplayValue(DEFAULT_SENTRY_URL)).toBeInTheDocument();
    expect(result.getByTestId('sentry-config-editor-auth-token-row')).toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-auth-token-row')).queryByDisplayValue('Configured')).not.toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-auth-token-row')).queryByText(
        selectors.components.ConfigEditor.SentrySettings.AuthToken.Reset.label
      )
    ).not.toBeInTheDocument();
  });
  it('render existing datasource without error', () => {
    const options = { jsonData: { url: 'https://foo.com' }, secureJsonFields: { authToken: true } as any } as DataSourceSettings<
      SentryConfig,
      SentrySecureConfig
    >;
    const onOptionsChange = jest.fn();
    const result = render(<SentryConfigEditor options={options} onOptionsChange={onOptionsChange} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('sentry-config-editor-url-row')).toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-url-row')).getByTestId('sentry-config-editor-url')).toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-url-row')).queryByDisplayValue(DEFAULT_SENTRY_URL)).not.toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-url-row')).getByDisplayValue('https://foo.com')).toBeInTheDocument();
    expect(result.getByTestId('sentry-config-editor-auth-token-row')).toBeInTheDocument();
    expect(within(result.getByTestId('sentry-config-editor-auth-token-row')).getByDisplayValue('Configured')).toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-auth-token-row')).getByText(
        selectors.components.ConfigEditor.SentrySettings.AuthToken.Reset.label
      )
    ).toBeInTheDocument();
    expect(onOptionsChange).toBeCalledTimes(0);
    userEvent.click(
      within(result.getByTestId('sentry-config-editor-auth-token-row')).getByText(
        selectors.components.ConfigEditor.SentrySettings.AuthToken.Reset.label
      )
    );
    expect(onOptionsChange).toBeCalledTimes(1);
    expect(onOptionsChange).toHaveBeenNthCalledWith(1, {
      ...options,
      secureJsonData: { authToken: '' },
      secureJsonFields: { authToken: false },
    });
  });
});
