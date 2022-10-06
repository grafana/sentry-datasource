import React, { useState, useEffect } from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import type { SentryTeam } from './../../types';

export const TeamSelector = (props: {
  datasource: SentryDataSource;
  orgSlug: string;
  teamSlug: string;
  onValuesChange: (teamSlug: string | null) => void;
}) => {
  const { datasource, orgSlug, teamSlug, onValuesChange } = props;
  const { label, tooltip } = selectors.components.VariablesEditor.Team;
  const [teams, setTeams] = useState<SentryTeam[]>([]);
  useEffect(() => {
    datasource.getOrgTeams(orgSlug).then(setTeams);
  }, [datasource, orgSlug]);
  const getOptions = () => {
    const templateVariables = getTemplateSrv()
      .getVariables()
      .map((v) => {
        return {
          value: `\${${v.name}}`,
          label: `var: \${${v.name}}`,
        };
      });
    const teamsVariables = (teams || []).map((t) => {
      return {
        label: t.name,
        value: t.slug,
      };
    });
    return [...templateVariables, ...teamsVariables];
  };
  return (
    <>
      <InlineFormLabel tooltip={tooltip}>{label}</InlineFormLabel>
      <Select value={teamSlug || ''} isClearable={true} options={getOptions()} onChange={(e) => onValuesChange(e?.value || null)}></Select>
    </>
  );
};
