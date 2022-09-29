import React from 'react';
import { Input, Select } from '@grafana/ui';
import { EditorRow, EditorField } from './@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryIssueSortOptions } from '../../constants';
import type { QueryEditorProps } from '@grafana/data/types';
import type { SentryConfig, SentryQuery, SentryIssueSort } from '../../types';

type IssuesEditorProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query' | 'onChange' | 'onRunQuery'>;

export const IssuesEditor = ({ query, onChange, onRunQuery }: IssuesEditorProps) => {
  const onIssuesQueryChange = (issuesQuery: string) => {
    onChange({ ...query, issuesQuery } as SentryQuery);
  };
  const onIssuesSortChange = (issuesSort: SentryIssueSort) => {
    onChange({ ...query, issuesSort: issuesSort || undefined } as SentryQuery);
    onRunQuery();
  };
  const onIssuesLimitChange = (issuesLimit?: number) => {
    onChange({ ...query, issuesLimit: issuesLimit || undefined } as SentryQuery);
  };
  return query.queryType === 'issues' ? (
    <>
      <EditorRow>
        <EditorField
          label={selectors.components.QueryEditor.Issues.Query.label}
          tooltip={selectors.components.QueryEditor.Issues.Query.tooltip}
        >
          <Input
            width={78}
            value={query.issuesQuery}
            onChange={(e) => onIssuesQueryChange(e.currentTarget.value)}
            onBlur={onRunQuery}
            placeholder={selectors.components.QueryEditor.Issues.Query.placeholder}
          />
        </EditorField>
        <EditorField
          label={selectors.components.QueryEditor.Issues.Sort.label}
          tooltip={selectors.components.QueryEditor.Issues.Sort.tooltip}
        >
          <Select
            options={SentryIssueSortOptions}
            value={query.issuesSort}
            width={28}
            onChange={(e) => onIssuesSortChange(e?.value!)}
            placeholder={selectors.components.QueryEditor.Issues.Sort.placeholder}
            isClearable={true}
          />
        </EditorField>
        <EditorField
          label={selectors.components.QueryEditor.Issues.Limit.label}
          tooltip={selectors.components.QueryEditor.Issues.Limit.tooltip}
        >
          <Input
            value={query.issuesLimit}
            type="number"
            onChange={(e) => onIssuesLimitChange(e.currentTarget.valueAsNumber)}
            onBlur={onRunQuery}
            width={30}
            placeholder={selectors.components.QueryEditor.Issues.Limit.placeholder}
          />
        </EditorField>
      </EditorRow>
    </>
  ) : (
    <></>
  );
};
