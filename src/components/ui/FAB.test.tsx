import { render, screen, fireEvent } from '@testing-library/react';
import { FAB } from './FAB';
import { Plus, TrendingUp } from 'lucide-react';

describe('FAB', () => {
  it('renders as a button by default', () => {
    render(<FAB onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    render(<FAB href="/nova-posicao" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/nova-posicao');
  });

  it('renders with default Plus icon', () => {
    render(<FAB onClick={() => {}} />);
    // The Plus icon is an SVG, check for its presence in the button
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<FAB onClick={() => {}} icon={<TrendingUp size={24} data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<FAB onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays label on larger screens (hidden on mobile)', () => {
    render(<FAB onClick={() => {}} label="Nova Operação" />);
    // The label is hidden on mobile with 'hidden sm:inline'
    expect(screen.getByText('Nova Operação')).toBeInTheDocument();
  });

  it('uses custom aria-label', () => {
    render(<FAB onClick={() => {}} label="Adicionar Posição" />);
    expect(screen.getByLabelText('Adicionar Posição')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<FAB onClick={() => {}} className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('has proper touch target size', () => {
    render(<FAB onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-h-[56px]', 'min-w-[56px]');
  });

  it('has touch-manipulation class for mobile optimization', () => {
    render(<FAB onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('touch-manipulation');
  });

  it('is positioned fixed at bottom right', () => {
    render(<FAB onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-40');
  });

  it('has hover and active states', () => {
    render(<FAB onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:scale-105', 'active:scale-95', 'hover:shadow-xl');
  });
});
