import React from 'react';
import { render } from '@testing-library/react';
import { TypeSelector } from './TypeSelector';

describe('TypeSelector', () => {
  it('should render without error', () => {
    const onChange = jest.fn();
    const result = render(<TypeSelector onChange={onChange} variableQueryType="projects" />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
