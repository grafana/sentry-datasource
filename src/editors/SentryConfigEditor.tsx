import React, { useState } from 'react';
import { InlineFormLabel, Input, Button } from '@grafana/ui';
import { Components } from './../selectors';
import { DEFAULT_SENTRY_URL } from './../constants';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data/types';
import type { SentryConfig, SentrySecureConfig } from './../types';

type SentryConfigEditorProps = {} & DataSourcePluginOptionsEditorProps<SentryConfig, SentrySecureConfig>;

export const SentryConfigEditor = (props: SentryConfigEditorProps) => {
  const { options, onOptionsChange } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData: SentrySecureConfig = (options.secureJsonData || {}) as SentrySecureConfig;
  const [url, setURL] = useState<string>(jsonData?.url || DEFAULT_SENTRY_URL);
  const [orgSlug, setOrgSlug] = useState<string>(jsonData?.orgSlug || '');
  const [authToken, setAuthToken] = useState<string>('');
  const { ConfigEditor: ConfigEditorSelectors } = Components;
  const labelWidth = 10;
  const valueWidth = 20;
  const onOptionChange = <Key extends keyof SentryConfig, Value extends SentryConfig[Key]>(option: Key, value: Value) => {
    onOptionsChange({
      ...options,
      jsonData: { ...jsonData, [option]: value },
    });
  };
  const onSecureOptionChange = <Key extends keyof SentrySecureConfig, Value extends SentrySecureConfig[Key]>(
    option: Key,
    value: Value,
    set: boolean
  ) => {
    onOptionsChange({
      ...options,
      secureJsonData: { ...secureJsonData, [option]: value },
      secureJsonFields: { ...secureJsonFields, [option]: set },
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
          onBlur={() => onOptionChange('url', url)}
          width={valueWidth * 2}
        ></Input>
      </div>
      <div className="gf-form" data-testid="sentry-config-editor-org-slug-row">
        <InlineFormLabel tooltip={ConfigEditorSelectors.SentrySettings.OrgSlug.tooltip} width={labelWidth}>
          {ConfigEditorSelectors.SentrySettings.OrgSlug.label}
        </InlineFormLabel>
        <Input
          data-testid="sentry-config-editor-org-slug"
          placeholder={ConfigEditorSelectors.SentrySettings.OrgSlug.placeholder}
          aria-label={ConfigEditorSelectors.SentrySettings.OrgSlug.ariaLabel}
          value={orgSlug}
          onChange={(e) => setOrgSlug(e.currentTarget.value)}
          onBlur={() => onOptionChange('orgSlug', orgSlug)}
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
                onSecureOptionChange('authToken', authToken, false);
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
              onBlur={() => onSecureOptionChange('authToken', authToken, true)}
            ></Input>
          </>
        )}
      </div>
      <br />
    </div>
  );
};
