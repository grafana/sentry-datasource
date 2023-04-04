import React from 'react';
import { InlineFormLabel, Input, Select } from '@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryIssueSortOptions } from '../../constants';
import type { QueryEditorProps } from '@grafana/data';
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
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Issues.Query.tooltip}>
          {selectors.components.QueryEditor.Issues.Query.label}
        </InlineFormLabel>
        {/* TODO: Replace input with CodeEditor */}
        <Input
          value={query.issuesQuery}
          onChange={(e) => onIssuesQueryChange(e.currentTarget.value)}
          onBlur={onRunQuery}
          placeholder={selectors.components.QueryEditor.Issues.Query.placeholder}
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Issues.Sort.tooltip}>
          {selectors.components.QueryEditor.Issues.Sort.label}
        </InlineFormLabel>
        <Select
          options={SentryIssueSortOptions}
          value={query.issuesSort}
          width={28}
          onChange={(e) => onIssuesSortChange(e?.value!)}
          className="inline-element"
          placeholder={selectors.components.QueryEditor.Issues.Sort.placeholder}
          isClearable={true}
        />
        <InlineFormLabel width={8} className="query-keyword" tooltip={selectors.components.QueryEditor.Issues.Limit.tooltip}>
          {selectors.components.QueryEditor.Issues.Limit.label}
        </InlineFormLabel>
        <Input
          value={query.issuesLimit}
          type="number"
          onChange={(e) => onIssuesLimitChange(e.currentTarget.valueAsNumber)}
          onBlur={onRunQuery}
          width={32}
          className="inline-element"
          placeholder={selectors.components.QueryEditor.Issues.Limit.placeholder}
        />
      </div>
    </>
  ) : (
    <></>
  );
};
