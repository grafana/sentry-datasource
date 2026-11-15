import React from 'react';
import { Input } from '@grafana/ui';
import { selectors } from '../../selectors';
import type { SentryDeploysQuery } from '../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';

interface DeploysEditorProps {
  query: SentryDeploysQuery;
  onChange: (value: SentryDeploysQuery) => void;
  onRunQuery: () => void;
}

export const DeploysEditor = ({ query, onChange, onRunQuery }: DeploysEditorProps) => {
  const onReleaseVersionChange = (deploysReleaseVersion: string) => {
    onChange({ ...query, deploysReleaseVersion });
  };
  const onDeploysLimitChange = (deploysLimit?: number) => {
    onChange({ ...query, deploysLimit: deploysLimit || undefined });
  };
  return (
    <EditorRow>
      <EditorFieldGroup>
        <EditorField
          tooltip={selectors.components.QueryEditor.Deploys.ReleaseVersion.tooltip}
          label={selectors.components.QueryEditor.Deploys.ReleaseVersion.label}
        >
          <Input
            value={query.deploysReleaseVersion || ''}
            onChange={(e) => onReleaseVersionChange(e.currentTarget.value)}
            onBlur={onRunQuery}
            width={40}
            className="inline-element"
            placeholder={selectors.components.QueryEditor.Deploys.ReleaseVersion.placeholder}
          />
        </EditorField>
        <EditorField
          tooltip={selectors.components.QueryEditor.Deploys.Limit.tooltip}
          label={selectors.components.QueryEditor.Deploys.Limit.label}
        >
          <Input
            value={query.deploysLimit}
            type="number"
            onChange={(e) => onDeploysLimitChange(e.currentTarget.valueAsNumber)}
            onBlur={onRunQuery}
            width={32}
            className="inline-element"
            placeholder={selectors.components.QueryEditor.Deploys.Limit.placeholder}
          />
        </EditorField>
      </EditorFieldGroup>
    </EditorRow>
  );
};
