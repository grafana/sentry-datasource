import React, { useState, useEffect } from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryOrganization } from '../../types';

export const OrgSlugSelector = (props: {
  datasource: SentryDataSource;
  orgSlug: string;
  onOrgSlugChange: (orgSlug: string, orgName: string, orgId: string) => void;
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
    return organizations.map((o) => {
      return {
        value: o.slug,
        label: o.name,
      };
    });
  };
  const onOrgSlugChange = (orgSlug: string) => {
    const matchingOrg = organizations.find((o) => o.slug === orgSlug);
    if (matchingOrg) {
      props.onOrgSlugChange(matchingOrg.slug, matchingOrg.name, matchingOrg.id);
    }
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
