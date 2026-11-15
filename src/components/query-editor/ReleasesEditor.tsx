import React from 'react';
import { Input } from '@grafana/ui';
import { selectors } from '../../selectors';
import type { SentryReleasesQuery } from '../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';

interface ReleasesEditorProps {
  query: SentryReleasesQuery;
  onChange: (value: SentryReleasesQuery) => void;
  onRunQuery: () => void;
}

export const ReleasesEditor = ({ query, onChange, onRunQuery }: ReleasesEditorProps) => {
  const onReleasesQueryChange = (releasesQuery: string) => {
    onChange({ ...query, releasesQuery: releasesQuery || undefined });
  };
  const onReleasesLimitChange = (releasesLimit?: number) => {
    onChange({ ...query, releasesLimit: releasesLimit || undefined });
  };
  return (
    <EditorRow>
      <EditorFieldGroup>
        <EditorField
          tooltip={selectors.components.QueryEditor.Releases.Query.tooltip}
          label={selectors.components.QueryEditor.Releases.Query.label}
        >
          <Input
            value={query.releasesQuery || ''}
            onChange={(e) => onReleasesQueryChange(e.currentTarget.value)}
            onBlur={onRunQuery}
            width={40}
            className="inline-element"
            placeholder={selectors.components.QueryEditor.Releases.Query.placeholder}
          />
        </EditorField>
        <EditorField
          tooltip={selectors.components.QueryEditor.Releases.Limit.tooltip}
          label={selectors.components.QueryEditor.Releases.Limit.label}
        >
          <Input
            value={query.releasesLimit}
            type="number"
            onChange={(e) => onReleasesLimitChange(e.currentTarget.valueAsNumber)}
            onBlur={onRunQuery}
            width={32}
            className="inline-element"
            placeholder={selectors.components.QueryEditor.Releases.Limit.placeholder}
          />
        </EditorField>
      </EditorFieldGroup>
    </EditorRow>
  );
};
