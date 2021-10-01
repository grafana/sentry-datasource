import React, { useState, useEffect } from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryOrganization } from '../../types';

export const OrganizationSelector = (props: {
  datasource: SentryDataSource;
  orgSlug: string;
  onOrgSlugChange: (orgSlug: string) => void;
  label?: string;
  tooltip?: string;
}) => {
  const { datasource, orgSlug } = props;
  const { label, tooltip, container } = selectors.components.VariablesEditor.Organization;
  const [organizations, setOrganizations] = useState<SentryOrganization[]>([]);
  useEffect(() => {
    datasource.getOrganizations().then(setOrganizations).catch(console.error);
  }, [datasource]);
  const getOptions = () => {
    const templateVariables = getTemplateSrv()
      .getVariables()
      .map((v) => {
        return {
          value: `\${${v.name}}`,
          label: `var: \${${v.name}}`,
        };
      });
    const organizationsVariables = organizations.map((o) => {
      return {
        value: o.slug,
        label: o.name,
      };
    });
    return [...organizationsVariables, ...templateVariables];
  };
  const onOrgSlugChange = (orgSlug: string) => {
    props.onOrgSlugChange(orgSlug);
  };
  return (
    <>
      <InlineFormLabel tooltip={props.tooltip || tooltip}>{props.label || label}</InlineFormLabel>
      <div data-testid="variable-query-editor-org-select-container" aria-label={container.ariaLabel}>
        <Select value={orgSlug} options={getOptions()} onChange={(e) => onOrgSlugChange(e.value || '')} className="width-30"></Select>
      </div>
    </>
  );
};
