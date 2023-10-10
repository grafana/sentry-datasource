import React from 'react';
import { config } from '@grafana/runtime';
import { ConfigSection } from '@grafana/experimental';
import { Field, Switch } from '@grafana/ui';

import { Components } from '../../selectors';
import { isVersionGtOrEq } from 'utils/version';
import { SentryConfig } from 'types';
import { Divider } from './Divider';

interface AdditionalSettingsProps {
  jsonData: SentryConfig;
  onOptionChange: <Key extends keyof SentryConfig, Value extends SentryConfig[Key]>(option: Key, value: Value) => void;
}

export function AdditionalSettings({ jsonData, onOptionChange }: AdditionalSettingsProps) {
  return config.featureToggles['secureSocksDSProxyEnabled'] && isVersionGtOrEq(config.buildInfo.version, '10.0.0') ? (
    <>
      <Divider />
      <ConfigSection
        title="Additional settings"
        description="Additional settings are optional settings that can be configured for more control over your data source. This includes enabling the secure socks proxy."
        isCollapsible
        isInitiallyOpen={jsonData.enableSecureSocksProxy}
      >
        <Field
          label={Components.ConfigEditor.SecureSocksProxy.label}
          description={Components.ConfigEditor.SecureSocksProxy.tooltip}
        >
          <Switch
            className="gf-form"
            value={jsonData.enableSecureSocksProxy || false}
            onChange={(e) => onOptionChange('enableSecureSocksProxy', e.currentTarget.checked)}
          />
        </Field>
      </ConfigSection>
    </>
  ) : null;
}
