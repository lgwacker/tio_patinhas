import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('should render progress bar with correct percentage', () => {
    render(<ProgressBar percentage={45.5} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '45.5');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should display percentage text', () => {
    render(<ProgressBar percentage={32.7} />);

    expect(screen.getByText('32.7%')).toBeInTheDocument();
  });

  it('should clamp percentage at 0 minimum', () => {
    render(<ProgressBar percentage={-10} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('should clamp percentage at 100 maximum', () => {
    render(<ProgressBar percentage={150} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('should apply custom className', () => {
    render(<ProgressBar percentage={50} className="custom-class" />);

    const container = screen.getByRole('progressbar').parentElement?.parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
