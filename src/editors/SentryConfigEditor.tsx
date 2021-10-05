import React, { useState } from 'react';
import { InlineFormLabel, Input, Button } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Components } from './../selectors';
import { DEFAULT_SENTRY_URL, SentryConfig, SentrySecureConfig } from './../types';

type SentryConfigEditorProps = {} & DataSourcePluginOptionsEditorProps<SentryConfig, SentrySecureConfig>;

export const SentryConfigEditor = (props: SentryConfigEditorProps) => {
  const { options, onOptionsChange } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData: SentrySecureConfig = (options.secureJsonData || {}) as SentrySecureConfig;
  const [url, setURL] = useState<string>(jsonData?.url || DEFAULT_SENTRY_URL);
  const [authToken, setAuthToken] = useState<string>('');
  const { ConfigEditor: ConfigEditorSelectors } = Components;
  const labelWidth = 10;
  const valueWidth = 20;
  const onFieldChange = (field: keyof SentryConfig, value: string) => {
    onOptionsChange({ ...options, [field]: value });
  };
  const onSecureFieldChange = (key: keyof SentrySecureConfig, value: string) => {
    onOptionsChange({
      ...options,
      secureJsonData: { ...secureJsonData, [key]: value },
      secureJsonFields: { ...secureJsonFields, [key]: true },
    });
  };
  const onSecureFieldReset = (key: keyof SentrySecureConfig) => {
    onOptionsChange({
      ...options,
      secureJsonData: { ...secureJsonData, [key]: '' },
      secureJsonFields: { ...secureJsonFields, [key]: false },
    });
  };
  return (
    <div className="grafana-sentry-datasource config-editor">
      <h4 className="heading">{ConfigEditorSelectors.SentrySettings.GroupTitle}</h4>
      <div className="gf-form" data-testid="sentry-config-editor-url-row">
        <InlineFormLabel tooltip={ConfigEditorSelectors.SentrySettings.URL.tooltip} width={labelWidth}>
          {ConfigEditorSelectors.SentrySettings.URL.label}
        </InlineFormLabel>
        <Input
          data-testid="sentry-config-editor-url"
          placeholder={ConfigEditorSelectors.SentrySettings.URL.placeholder}
          aria-label={ConfigEditorSelectors.SentrySettings.URL.ariaLabel}
          value={url}
          onChange={(e) => setURL(e.currentTarget.value)}
          onBlur={() => onFieldChange('url', url)}
          width={valueWidth * 2}
        ></Input>
      </div>
      <div className="gf-form" data-testid="sentry-config-editor-auth-token-row">
        <InlineFormLabel tooltip={ConfigEditorSelectors.SentrySettings.AuthToken.tooltip} width={labelWidth}>
          {ConfigEditorSelectors.SentrySettings.AuthToken.label}
        </InlineFormLabel>
        {secureJsonFields?.authToken ? (
          <>
            <Input type="text" value="Configured" disabled={true} width={valueWidth * 2}></Input>
            <Button
              variant="secondary"
              className="reset-button"
              onClick={() => {
                setAuthToken('');
                onSecureFieldReset('authToken');
              }}
            >
              {ConfigEditorSelectors.SentrySettings.AuthToken.Reset.label}
            </Button>
          </>
        ) : (
          <>
            <Input
              type="password"
              placeholder={ConfigEditorSelectors.SentrySettings.AuthToken.placeholder}
              aria-label={ConfigEditorSelectors.SentrySettings.AuthToken.ariaLabel}
              value={authToken}
              width={valueWidth * 2}
              onChange={(e) => setAuthToken(e.currentTarget.value)}
              onBlur={() => onSecureFieldChange('authToken', authToken)}
            ></Input>
          </>
        )}
      </div>
      <br />
    </div>
  );
};
