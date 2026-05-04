import { render, screen, fireEvent } from '@testing-library/react';
import { PositionDetailClient } from '@/app/posicao/[id]/PositionDetailClient';
import type { Position, Operation } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">↑</span>,
  TrendingDown: () => <span data-testid="trending-down-icon">↓</span>,
  Plus: () => <span data-testid="plus-icon">+</span>,
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  DollarSign: () => <span data-testid="dollar-icon">$</span>,
  Edit2: () => <span data-testid="edit-icon">✎</span>,
  RefreshCw: () => <span data-testid="refresh-icon">↻</span>,
}));

describe('PositionDetailClient - Heading Order Accessibility', () => {
  const mockPosition = {
    id: 1,
    ticker: 'PETR4',
    nome: 'Petrobras PN',
    quantidade: 100,
    preco_medio: 28.5,
    valorInvestido: 2850,
    valorAtual: 3200,
    ganhoValor: 350,
    ganhoPercentual: 12.28,
    precoAtual: 32.0,
    precoAtualDisponivel: true,
    // Position base fields
    classe_ativo: 'acao' as const,
    setor: 'Energia',
    segmento: 'Petróleo',
    data_criacao: '2024-01-15',
    updated_at: '2024-01-15',
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
      created_at: '2024-01-15',
    },
  ];

  beforeEach(() => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });
    
    // Mock fetch
    global.fetch = jest.fn();
  });

  it('should have h1 as the page title', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('PETR4');
  });

  it('should have section headings as h2 (not h3) for accessibility', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    // Click the "Operação" button to show the form
    const operationButton = screen.getByRole('button', { name: /operação/i });
    fireEvent.click(operationButton);

    // Check for h2 headings (not h3)
    const novaOperacaoHeading = screen.getByRole('heading', { 
      level: 2,
      name: /nova operação/i 
    });
    expect(novaOperacaoHeading).toBeInTheDocument();

    const historicoHeading = screen.getByRole('heading', { 
      level: 2,
      name: /histórico de operações/i 
    });
    expect(historicoHeading).toBeInTheDocument();
  });

  it('should not have any h3 headings on the page', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    // Show the form to reveal all headings
    const operationButton = screen.getByRole('button', { name: /operação/i });
    fireEvent.click(operationButton);

    // Check that there are no h3 elements
    const h3Elements = document.querySelectorAll('h3');
    expect(h3Elements).toHaveLength(0);
  });

  it('should maintain proper heading hierarchy (h1 -> h2)', () => {
    render(
      <PositionDetailClient
        position={mockPosition}
        operations={mockOperations}
      />
    );

    // Show the form
    const operationButton = screen.getByRole('button', { name: /operação/i });
    fireEvent.click(operationButton);

    // Get all heading levels
    const h1Elements = document.querySelectorAll('h1');
    const h2Elements = document.querySelectorAll('h2');
    const h3Elements = document.querySelectorAll('h3');

    // Should have exactly 1 h1
    expect(h1Elements).toHaveLength(1);

    // Should have exactly 2 h2 elements (Nova Operação, Histórico)
    expect(h2Elements).toHaveLength(2);

    // Should have no h3 elements
    expect(h3Elements).toHaveLength(0);
  });
});
