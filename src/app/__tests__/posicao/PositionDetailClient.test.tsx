import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PositionDetailClient } from '../../posicao/[id]/PositionDetailClient';
import type { Position, Operation } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('PositionDetailClient Accessibility', () => {
  const mockPosition: Position & {
    valorInvestido: number;
    valorAtual: number;
    ganhoValor: number;
    ganhoPercentual: number;
    precoAtual: number;
    precoAtualDisponivel: boolean;
  } = {
    id: 1,
    ticker: 'PETR4',
    nome: 'Petrobras',
    classe_ativo: 'acao',
    setor: null,
    segmento: null,
    quantidade: 100,
    preco_medio: 28.5,
    data_criacao: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    valorInvestido: 2850,
    valorAtual: 3200,
    ganhoValor: 350,
    ganhoPercentual: 12.28,
    precoAtual: 32.0,
    precoAtualDisponivel: true,
  };

  const mockOperations: Operation[] = [
    {
      id: 1,
      position_id: 1,
      tipo: 'compra',
      data: '2024-01-15',
      quantidade: 100,
      preco_unitario: 28.5,
      valor_total: 2850,
      created_at: '2024-01-15T10:00:00Z',
    },
  ];

  function renderComponent(props: { position?: typeof mockPosition; operations?: Operation[] } = {}) {
    const { position = mockPosition, operations = mockOperations } = props;
    return render(<PositionDetailClient position={position} operations={operations} />);
  }

  function openNovaOperacaoForm() {
    const operacaoButton = screen.getByRole('button', { name: /Operação/i });
    fireEvent.click(operacaoButton);
  }

  function openManualPriceForm() {
    const editButton = screen.getByRole('button', { name: 'Definir preço manual' });
    fireEvent.click(editButton);
  }

  it('should have accessible name for back button', () => {
    renderComponent();

    const backButton = screen.getByRole('button', { name: 'Voltar para carteira' });
    expect(backButton).toBeInTheDocument();
  });

  it('should have accessible name for edit price button when price is available', () => {
    renderComponent();

    const editButton = screen.getByRole('button', { name: 'Definir preço manual' });
    expect(editButton).toBeInTheDocument();
  });

  it('should have accessible name for refresh price button', () => {
    renderComponent();

    const refreshButton = screen.getByRole('button', { name: 'Atualizar preço' });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should not show edit price button when price is not available', () => {
    const positionWithoutPrice = { ...mockPosition, precoAtual: 0 };

    renderComponent({ position: positionWithoutPrice });

    const editButton = screen.queryByRole('button', { name: 'Definir preço manual' });
    expect(editButton).not.toBeInTheDocument();
  });

  it('should still show refresh button when price is not available', () => {
    const positionWithoutPrice = { ...mockPosition, precoAtual: 0 };

    renderComponent({ position: positionWithoutPrice });

    const refreshButton = screen.getByRole('button', { name: 'Atualizar preço' });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should show unavailable price message when quote is not available (Issue #52)', () => {
    const positionWithoutQuote = { ...mockPosition, precoAtual: 0, precoAtualDisponivel: false };

    renderComponent({ position: positionWithoutQuote });

    // Should show "Preço não disponível" message in the Ganho/Perda section
    // There are multiple "—" on the page (Preço Atual and Ganho/Perda), so we look for the message
    const ganhoPerdaSection = screen.getByText('Ganho/Perda').closest('div');
    expect(ganhoPerdaSection).toHaveTextContent('Preço não disponível');
  });

  it('should NOT show -100% loss when quote is unavailable (Issue #52)', () => {
    const positionWithoutQuote = { 
      ...mockPosition, 
      precoAtual: 0, 
      precoAtualDisponivel: false,
      ganhoValor: 0,
      ganhoPercentual: 0,
    };

    renderComponent({ position: positionWithoutQuote });

    // Should NOT show -100.00% 
    const lossPercentage = screen.queryByText(/-100.00%/);
    expect(lossPercentage).not.toBeInTheDocument();
    
    // Should NOT show the invested value as a loss
    const lossValue = screen.queryByText('-R$ 2.850,00');
    expect(lossValue).not.toBeInTheDocument();
  });

  describe('Nova Operação form', () => {
    it('should have quantidade input with valid max attribute for accessibility', () => {
      renderComponent();
      openNovaOperacaoForm();

      const input = screen.getByPlaceholderText('100');
      expect(input).toHaveAttribute('max');
      const maxValue = parseFloat(input.getAttribute('max') || '0');
      const minValue = parseFloat(input.getAttribute('min') || '0');
      expect(maxValue).toBeGreaterThan(minValue);
    });

    it('should have valor_total input with valid max attribute for accessibility', () => {
      renderComponent();
      openNovaOperacaoForm();

      const input = screen.getByPlaceholderText('2500.00');
      expect(input).toHaveAttribute('max');
      const maxValue = parseFloat(input.getAttribute('max') || '0');
      const minValue = parseFloat(input.getAttribute('min') || '0');
      expect(maxValue).toBeGreaterThan(minValue);
    });

    it('should accept positive values in quantidade input', () => {
      renderComponent();
      openNovaOperacaoForm();

      const input = screen.getByPlaceholderText('100');
      fireEvent.change(input, { target: { value: '10' } });
      expect(input).toHaveValue(10);
    });

    it('should accept positive values in valor_total input', () => {
      renderComponent();
      openNovaOperacaoForm();

      const input = screen.getByPlaceholderText('2500.00');
      fireEvent.change(input, { target: { value: '1000' } });
      expect(input).toHaveValue(1000);
    });
  });

  describe('Manual price form', () => {
    it('should have price input with valid max attribute for accessibility', () => {
      renderComponent();
      openManualPriceForm();

      const input = screen.getByPlaceholderText('Ex: 28.50');
      expect(input).toHaveAttribute('max');
      const maxValue = parseFloat(input.getAttribute('max') || '0');
      const minValue = parseFloat(input.getAttribute('min') || '0');
      expect(maxValue).toBeGreaterThan(minValue);
    });

    it('should accept positive values in manual price input', () => {
      renderComponent();
      openManualPriceForm();

      const input = screen.getByPlaceholderText('Ex: 28.50');
      fireEvent.change(input, { target: { value: '50.00' } });
      expect(input).toHaveValue(50);
    });
  });
});
