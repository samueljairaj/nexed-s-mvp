import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge'; // Assuming 'badge.tsx' is in the same directory

describe('Badge component', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    render(<Badge>Default Badge</Badge>);
    // Check for a class that is part of the "default" variant
    // According to badge.tsx, "default" includes "bg-primary"
    expect(screen.getByText('Default Badge')).toHaveClass('bg-primary');
  });

  it('applies destructive variant class when specified', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    // Check for a class that is part of the "destructive" variant
    // According to badge.tsx, "destructive" includes "bg-destructive"
    expect(screen.getByText('Destructive Badge')).toHaveClass('bg-destructive');
  });

  it('applies outline variant class when specified', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    // Check for a class that is part of the "outline" variant
    // According to badge.tsx, "outline" includes "text-foreground"
    expect(screen.getByText('Outline Badge')).toHaveClass('text-foreground');
  });
});
