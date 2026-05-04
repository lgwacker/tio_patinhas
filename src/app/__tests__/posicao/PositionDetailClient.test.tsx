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

  it('should have accessible name for back button', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    const backButton = screen.getByRole('button', { name: 'Voltar para carteira' });
    expect(backButton).toBeInTheDocument();
  });

  it('should have accessible name for edit price button when price is available', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    const editButton = screen.getByRole('button', { name: 'Definir preço manual' });
    expect(editButton).toBeInTheDocument();
  });

  it('should have accessible name for refresh price button', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    const refreshButton = screen.getByRole('button', { name: 'Atualizar preço' });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should not show edit price button when price is not available', () => {
    const positionWithoutPrice = {
      ...mockPosition,
      precoAtual: 0,
    };

    render(
      <PositionDetailClient
        position={positionWithoutPrice}
        operations={mockOperations}
      />
    );

    const editButton = screen.queryByRole('button', { name: 'Definir preço manual' });
    expect(editButton).not.toBeInTheDocument();
  });

  it('should still show refresh button when price is not available', () => {
    const positionWithoutPrice = {
      ...mockPosition,
      precoAtual: 0,
    };

    render(
      <PositionDetailClient
        position={positionWithoutPrice}
        operations={mockOperations}
      />
    );

    const refreshButton = screen.getByRole('button', { name: 'Atualizar preço' });
    expect(refreshButton).toBeInTheDocument();
  });

  describe('Nova Operação form', () => {
    it('should have quantidade input with valid max attribute for accessibility', () => {
      render(
        <PositionDetailClient
          position={mockPosition}
          operations={mockOperations}
        />
      );

      // Click the "Operação" button to show the form
      const operacaoButton = screen.getByRole('button', { name: /Operação/i });
      fireEvent.click(operacaoButton);

      const input = screen.getByPlaceholderText('100');
      expect(input).toHaveAttribute('max');
      const maxValue = parseFloat(input.getAttribute('max') || '0');
      const minValue = parseFloat(input.getAttribute('min') || '0');
      expect(maxValue).toBeGreaterThan(minValue);
    });

    it('should have valor_total input with valid max attribute for accessibility', () => {
      render(
        <PositionDetailClient
          position={mockPosition}
          operations={mockOperations}
        />
      );

      // Click the "Operação" button to show the form
      const operacaoButton = screen.getByRole('button', { name: /Operação/i });
      fireEvent.click(operacaoButton);

      const input = screen.getByPlaceholderText('2500.00');
      expect(input).toHaveAttribute('max');
      const maxValue = parseFloat(input.getAttribute('max') || '0');
      const minValue = parseFloat(input.getAttribute('min') || '0');
      expect(maxValue).toBeGreaterThan(minValue);
    });

    it('should accept positive values in quantidade input', () => {
      render(
        <PositionDetailClient
          position={mockPosition}
          operations={mockOperations}
        />
      );

      // Click the "Operação" button to show the form
      const operacaoButton = screen.getByRole('button', { name: /Operação/i });
      fireEvent.click(operacaoButton);

      const input = screen.getByPlaceholderText('100');
      fireEvent.change(input, { target: { value: '10' } });
      expect(input).toHaveValue(10);
    });

    it('should accept positive values in valor_total input', () => {
      render(
        <PositionDetailClient
          position={mockPosition}
          operations={mockOperations}
        />
      );

      // Click the "Operação" button to show the form
      const operacaoButton = screen.getByRole('button', { name: /Operação/i });
      fireEvent.click(operacaoButton);

      const input = screen.getByPlaceholderText('2500.00');
      fireEvent.change(input, { target: { value: '1000' } });
      expect(input).toHaveValue(1000);
    });
  });

  describe('Manual price form', () => {
    it('should have price input with valid max attribute for accessibility', () => {
      render(
        <PositionDetailClient
          position={mockPosition}
          operations={mockOperations}
        />
      );

      // Click the edit button to show the manual price form
      const editButton = screen.getByRole('button', { name: 'Definir preço manual' });
      fireEvent.click(editButton);

      const input = screen.getByPlaceholderText('Ex: 28.50');
      expect(input).toHaveAttribute('max');
      const maxValue = parseFloat(input.getAttribute('max') || '0');
      const minValue = parseFloat(input.getAttribute('min') || '0');
      expect(maxValue).toBeGreaterThan(minValue);
    });

    it('should accept positive values in manual price input', () => {
      render(
        <PositionDetailClient
          position={mockPosition}
          operations={mockOperations}
        />
      );

      // Click the edit button to show the manual price form
      const editButton = screen.getByRole('button', { name: 'Definir preço manual' });
      fireEvent.click(editButton);

      const input = screen.getByPlaceholderText('Ex: 28.50');
      fireEvent.change(input, { target: { value: '50.00' } });
      expect(input).toHaveValue(50);
    });
  });
});
