import React from 'react';
import { render } from '@testing-library/react';
import { QueryPreview } from './QueryPreview';
import type { SentryQuery } from './../../types';

describe('QueryPreview', () => {
  it('should render without error', () => {
    const query = {} as SentryQuery;
    const result = render(<QueryPreview query={query} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
