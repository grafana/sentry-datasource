import React from 'react';
import { InlineLabel } from '@grafana/ui';

export const Error = (props: { message: string }) => {
  const { message } = props;
  return (
    <div className="gf-form" data-testid="error-message">
      <InlineLabel className="text-error" width="auto">
        {message}
      </InlineLabel>
    </div>
  );
};
