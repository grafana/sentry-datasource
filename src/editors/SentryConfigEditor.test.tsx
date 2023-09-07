import React from 'react';
import { DataSourceSettings } from '@grafana/data';
import { render, within, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SentryConfigEditor } from './SentryConfigEditor';
import { DEFAULT_SENTRY_URL } from './../constants';
import { Components, selectors } from './../selectors';
import type { SentryConfig, SentrySecureConfig } from './../types';

describe('SentryConfigEditor', () => {
  it('render default editor without error', () => {
    const options = { jsonData: {} } as DataSourceSettings<SentryConfig, SentrySecureConfig>;
    const onOptionsChange = jest.fn();
    const result = render(<SentryConfigEditor options={options} onOptionsChange={onOptionsChange} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('sentry-config-editor-url')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(Components.ConfigEditor.SentrySettings.URL.placeholder)).toBeInTheDocument();
    expect(result.getByTestId('sentry-config-editor-org-slug')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(Components.ConfigEditor.SentrySettings.OrgSlug.placeholder)).toBeInTheDocument();

    expect(result.getByTestId('sentry-config-editor-auth-token')).toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-auth-token')).queryByDisplayValue('Configured')
    ).not.toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-auth-token')).queryByText(
        selectors.components.ConfigEditor.SentrySettings.AuthToken.Reset.label
      )
    ).not.toBeInTheDocument();
  });
  it('render existing datasource without error', () => {
    const options = {
      jsonData: { url: 'https://foo.com', orgSlug: 'my-org-slug' },
      secureJsonFields: { authToken: true } as any,
    } as DataSourceSettings<SentryConfig, SentrySecureConfig>;
    const onOptionsChange = jest.fn();
    const result = render(<SentryConfigEditor options={options} onOptionsChange={onOptionsChange} />);
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('sentry-config-editor-url')).toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-url')).queryByDisplayValue(DEFAULT_SENTRY_URL)
    ).not.toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-url')).getByDisplayValue('https://foo.com')
    ).toBeInTheDocument();
    expect(result.getByTestId('sentry-config-editor-org-slug')).toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-org-slug')).getByDisplayValue('my-org-slug')
    ).toBeInTheDocument();
    expect(result.getByTestId('sentry-config-editor-auth-token')).toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-auth-token')).getByDisplayValue('Configured')
    ).toBeInTheDocument();
    expect(
      within(result.getByTestId('sentry-config-editor-auth-token')).getByText(
        selectors.components.ConfigEditor.SentrySettings.AuthToken.Reset.label
      )
    ).toBeInTheDocument();
    expect(onOptionsChange).toBeCalledTimes(0);
    userEvent.click(
      within(result.getByTestId('sentry-config-editor-auth-token')).getByText(
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
