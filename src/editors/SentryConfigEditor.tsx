import React, { useState } from 'react';
import { Field, Input, Button } from '@grafana/ui';
import { Components } from './../selectors';
import { DEFAULT_SENTRY_URL } from './../constants';

import { DataSourceDescription, ConfigSection } from '@grafana/plugin-ui';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

import type { SentryConfig, SentrySecureConfig } from './../types';
import { Divider } from 'components/config-editor/Divider';
import { AdditionalSettings } from 'components/config-editor/AdditionalSettings';

type SentryConfigEditorProps = {} & DataSourcePluginOptionsEditorProps<SentryConfig, SentrySecureConfig>;

export const SentryConfigEditor = (props: SentryConfigEditorProps) => {
  const { options, onOptionsChange } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData: SentrySecureConfig = (options.secureJsonData || {}) as SentrySecureConfig;
  const [url, setURL] = useState<string>(jsonData?.url || DEFAULT_SENTRY_URL);
  const [orgSlug, setOrgSlug] = useState<string>(jsonData?.orgSlug || '');
  const [authToken, setAuthToken] = useState<string>('');
  const { ConfigEditor: ConfigEditorSelectors } = Components;
  const valueWidth = 20;
  const onOptionChange = <Key extends keyof SentryConfig, Value extends SentryConfig[Key]>(
    option: Key,
    value: Value
  ) => {
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
    <>
      <DataSourceDescription
        dataSourceName="Sentry"
        docsLink="https://grafana.com/grafana/plugins/grafana-sentry-datasource/"
        hasRequiredFields
      />
      <Divider />
      <ConfigSection title={ConfigEditorSelectors.SentrySettings.GroupTitle}>
        <Field
          required
          label={ConfigEditorSelectors.SentrySettings.URL.label}
          description={ConfigEditorSelectors.SentrySettings.URL.tooltip}
          invalid={!url}
          error={'URL is required'}
          data-testid="sentry-config-editor-url"
        >
          <Input
            placeholder={ConfigEditorSelectors.SentrySettings.URL.placeholder}
            aria-label={ConfigEditorSelectors.SentrySettings.URL.ariaLabel}
            value={url}
            onChange={(e) => setURL(e.currentTarget.value)}
            onBlur={() => onOptionChange('url', url)}
            width={valueWidth * 2}
          />
        </Field>
        <Field
          description={ConfigEditorSelectors.SentrySettings.OrgSlug.tooltip}
          label={ConfigEditorSelectors.SentrySettings.OrgSlug.label}
          required
          invalid={!jsonData.orgSlug}
          error={'Organization is required'}
          data-testid="sentry-config-editor-org-slug"
        >
          <Input
            placeholder={ConfigEditorSelectors.SentrySettings.OrgSlug.placeholder}
            aria-label={ConfigEditorSelectors.SentrySettings.OrgSlug.ariaLabel}
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.currentTarget.value)}
            onBlur={() => onOptionChange('orgSlug', orgSlug)}
            width={valueWidth * 2}
          ></Input>
        </Field>
        {secureJsonFields?.authToken ? (
          <Field
            label={ConfigEditorSelectors.SentrySettings.AuthToken.label}
            description={ConfigEditorSelectors.SentrySettings.AuthToken.tooltip}
            required
            data-testid="sentry-config-editor-auth-token"
          >
            <div className="width-30" style={{ display: 'flex', gap: '4px' }}>
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
            </div>
          </Field>
        ) : (
          <Field
            label={ConfigEditorSelectors.SentrySettings.AuthToken.label}
            description={ConfigEditorSelectors.SentrySettings.AuthToken.tooltip}
            required
            invalid={!secureJsonData.authToken || !secureJsonFields?.authToken}
            error={'Auth token is required'}
            data-testid="sentry-config-editor-auth-token"
          >
            <Input
              type="password"
              autoComplete="new-password"
              placeholder={ConfigEditorSelectors.SentrySettings.AuthToken.placeholder}
              aria-label={ConfigEditorSelectors.SentrySettings.AuthToken.ariaLabel}
              value={authToken}
              width={valueWidth * 2}
              onChange={(e) => setAuthToken(e.currentTarget.value)}
              onBlur={() => {
                if (authToken !== '') {
                  onSecureOptionChange('authToken', authToken, true);
                }
              }}
            ></Input>
          </Field>
        )}
      </ConfigSection>
      <AdditionalSettings jsonData={jsonData} onOptionChange={onOptionChange} />
    </>
  );
};
