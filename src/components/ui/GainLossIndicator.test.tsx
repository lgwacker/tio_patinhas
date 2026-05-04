import { render, screen } from '@testing-library/react';
import { GainLossIndicator, GainLossCurrency } from '@/components/ui/GainLossIndicator';

describe('GainLossIndicator', () => {
  it('should display positive percentage with profit color', () => {
    render(<GainLossIndicator value={15.5} />);

    expect(screen.getByText('+15.50%')).toBeInTheDocument();
    expect(screen.getByText('+15.50%')).toHaveClass('text-profit');
  });

  it('should display negative percentage with loss color', () => {
    render(<GainLossIndicator value={-8.25} />);

    expect(screen.getByText('-8.25%')).toBeInTheDocument();
    expect(screen.getByText('-8.25%')).toHaveClass('text-loss');
  });

  it('should display zero as positive (profit color)', () => {
    render(<GainLossIndicator value={0} />);

    expect(screen.getByText('+0.00%')).toBeInTheDocument();
    expect(screen.getByText('+0.00%')).toHaveClass('text-profit');
  });

  it('should show arrow icons by default', () => {
    render(<GainLossIndicator value={10} />);

    // Lucide icons are rendered as SVG elements
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should hide icon when showIcon is false', () => {
    render(<GainLossIndicator value={10} showIcon={false} />);

    // No SVG should be present when icon is hidden
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<GainLossIndicator value={10} className="custom-class" />);

    expect(screen.getByText('+10.00%')).toHaveClass('custom-class');
  });
});

describe('GainLossCurrency', () => {
  it('should display positive value with profit color', () => {
    render(<GainLossCurrency value={1250.75} />);

    expect(screen.getByText('+R$ 1.250,75')).toBeInTheDocument();
    expect(screen.getByText('+R$ 1.250,75')).toHaveClass('text-profit');
  });

  it('should display negative value with loss color', () => {
    render(<GainLossCurrency value={-500} />);

    expect(screen.getByText('-R$ 500,00')).toBeInTheDocument();
    expect(screen.getByText('-R$ 500,00')).toHaveClass('text-loss');
  });

  it('should show currency with plus sign for positive values', () => {
    render(<GainLossCurrency value={0} />);

    expect(screen.getByText('+R$ 0,00')).toBeInTheDocument();
  });
});
