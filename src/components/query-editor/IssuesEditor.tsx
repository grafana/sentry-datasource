import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel, Input, Select } from '@grafana/ui';
import { SentryDataSource } from '../../datasource';
import { selectors } from '../../selectors';
import { SentryConfig, SentryQuery, SentryIssueSort, SentryIssueSortOptions } from '../../types';
import { styles } from '../../styles';

type IssuesEditorProps = Pick<QueryEditorProps<SentryDataSource, SentryQuery, SentryConfig>, 'query' | 'onChange' | 'onRunQuery'>;

export const IssuesEditor = ({ query, onChange, onRunQuery }: IssuesEditorProps) => {
  const onIssuesQueryChange = (issuesQuery: string) => {
    onChange({ ...query, issuesQuery });
  };
  const onIssuesSortChange = (issuesSort: SentryIssueSort) => {
    onChange({ ...query, issuesSort: issuesSort || undefined });
  };
  const onIssuesLimitChange = (issuesLimit?: number) => {
    onChange({ ...query, issuesLimit: issuesLimit || undefined });
  };
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Issues.Query.tooltip}>
          {selectors.components.QueryEditor.Issues.Query.label}
        </InlineFormLabel>
        {/* TODO: Replace input with CodeEditor */}
        <Input value={query.issuesQuery} onChange={(e) => onIssuesQueryChange(e.currentTarget.value)} onBlur={onRunQuery} />
      </div>
      <div className="gf-form">
        <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Issues.Sort.tooltip}>
          {selectors.components.QueryEditor.Issues.Sort.label}
        </InlineFormLabel>
        <Select
          options={SentryIssueSortOptions}
          value={query.issuesSort}
          width={30}
          onChange={(e) => onIssuesSortChange(e?.value!)}
          className={styles.Common.InlineElement}
          isClearable={true}
        />
        <InlineFormLabel width={10} className="query-keyword" tooltip={selectors.components.QueryEditor.Issues.Limit.tooltip}>
          {selectors.components.QueryEditor.Issues.Limit.label}
        </InlineFormLabel>
        <Input
          value={query.issuesLimit}
          type="number"
          onChange={(e) => onIssuesLimitChange(e.currentTarget.valueAsNumber)}
          onBlur={onRunQuery}
          width={24}
          className={styles.Common.InlineElement}
          placeholder={selectors.components.QueryEditor.Issues.Limit.placeholder}
        />
      </div>
    </>
  );
};
