import { render, screen, fireEvent } from '@testing-library/react';
import { AssetClassTabs } from '@/components/carteira/AssetClassTabs';
import type { AssetClass } from '@/types';

describe('AssetClassTabs', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('should render all asset class tabs', () => {
    render(<AssetClassTabs activeTab="acao" onTabChange={mockOnTabChange} />);

    expect(screen.getByText('Ações')).toBeInTheDocument();
    expect(screen.getByText('FIIs')).toBeInTheDocument();
    expect(screen.getByText('Renda Fixa')).toBeInTheDocument();
    expect(screen.getByText('ETFs')).toBeInTheDocument();
    expect(screen.getByText('Cripto')).toBeInTheDocument();
  });

  it('should mark active tab correctly', () => {
    render(<AssetClassTabs activeTab="fii" onTabChange={mockOnTabChange} />);

    const fiiTab = screen.getByText('FIIs').closest('button');
    expect(fiiTab).toHaveAttribute('aria-selected', 'true');

    const acaoTab = screen.getByText('Ações').closest('button');
    expect(acaoTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should call onTabChange when tab is clicked', () => {
    render(<AssetClassTabs activeTab="acao" onTabChange={mockOnTabChange} />);

    fireEvent.click(screen.getByText('FIIs'));

    expect(mockOnTabChange).toHaveBeenCalledWith('fii');
  });

  it('should call onTabChange with correct asset class for each tab', () => {
    render(<AssetClassTabs activeTab="acao" onTabChange={mockOnTabChange} />);

    const tabs: Array<{ label: string; value: AssetClass }> = [
      { label: 'Ações', value: 'acao' },
      { label: 'FIIs', value: 'fii' },
      { label: 'Renda Fixa', value: 'renda_fixa' },
      { label: 'ETFs', value: 'etf' },
      { label: 'Cripto', value: 'cripto' },
    ];

    tabs.forEach(({ label, value }) => {
      fireEvent.click(screen.getByText(label));
      expect(mockOnTabChange).toHaveBeenCalledWith(value);
    });

    expect(mockOnTabChange).toHaveBeenCalledTimes(5);
  });
});
