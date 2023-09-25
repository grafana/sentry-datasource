import React from 'react';
import { Input, QueryField, Select } from '@grafana/ui';
import { selectors } from '../../selectors';
import { SentryIssueSortOptions } from '../../constants';
import type { SentryIssueSort, SentryIssuesQuery } from '../../types';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/experimental';

interface IssuesEditorProps {
  query: SentryIssuesQuery;
  onChange: (value: SentryIssuesQuery) => void;
  onRunQuery: () => void;
}

export const IssuesEditor = ({ query, onChange, onRunQuery }: IssuesEditorProps) => {
  const onIssuesQueryChange = (issuesQuery: string) => {
    onChange({ ...query, issuesQuery });
  };
  const onIssuesSortChange = (issuesSort: SentryIssueSort) => {
    onChange({ ...query, issuesSort: issuesSort || undefined });
    onRunQuery();
  };
  const onIssuesLimitChange = (issuesLimit?: number) => {
    onChange({ ...query, issuesLimit: issuesLimit || undefined });
  };
  return (
    <>
      <EditorRow>
        <EditorField
          tooltip={selectors.components.QueryEditor.Issues.Query.tooltip}
          label={selectors.components.QueryEditor.Issues.Query.label}
          width={'100%'}
        >
          {/* TODO: Replace input with CodeEditor */}
          <QueryField
            query={query.issuesQuery}
            onChange={(val) => onIssuesQueryChange(val)}
            onRunQuery={onRunQuery}
            placeholder={selectors.components.QueryEditor.Issues.Query.placeholder}
            portalOrigin="Sentry"
          />
        </EditorField>
      </EditorRow>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField
            tooltip={selectors.components.QueryEditor.Issues.Sort.tooltip}
            label={selectors.components.QueryEditor.Issues.Sort.label}
          >
            <Select
              options={SentryIssueSortOptions}
              value={query.issuesSort}
              width={28}
              onChange={(e) => onIssuesSortChange(e?.value!)}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Issues.Sort.placeholder}
              isClearable={true}
            />
          </EditorField>
          <EditorField
            tooltip={selectors.components.QueryEditor.Issues.Limit.tooltip}
            label={selectors.components.QueryEditor.Issues.Limit.label}
          >
            <Input
              value={query.issuesLimit}
              type="number"
              onChange={(e) => onIssuesLimitChange(e.currentTarget.valueAsNumber)}
              onBlur={onRunQuery}
              width={32}
              className="inline-element"
              placeholder={selectors.components.QueryEditor.Issues.Limit.placeholder}
            />
          </EditorField>
        </EditorFieldGroup>
      </EditorRow>
    </>
  );
};
