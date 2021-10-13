import React from 'react';
import { InlineFormLabel } from '@grafana/ui';

export const Error = (props: { message: string }) => {
  const { message } = props;
  return (
    <div className="gf-form" data-testid="error-message">
      <InlineFormLabel className="text-error" width="auto">
        {message}
      </InlineFormLabel>
    </div>
  );
};
