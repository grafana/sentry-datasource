import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeSelector } from './TypeSelector';

describe('TypeSelector', () => {
  it('should render without error', () => {
    const onChange = jest.fn();
    const result = render(<TypeSelector onChange={onChange} variableQueryType="projects" />);
    expect(result.container.firstChild).not.toBeNull();
  });
  it('should offer all variable query types', async () => {
    const onChange = jest.fn();
    render(<TypeSelector onChange={onChange} variableQueryType="projects" />);
    await userEvent.click(screen.getByRole('combobox'));
    for (const option of ['Projects', 'Environments', 'Teams', 'Releases']) {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    }
  });
});
