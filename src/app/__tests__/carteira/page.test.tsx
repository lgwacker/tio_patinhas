import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CarteiraPage from '@/app/carteira/page';
import type { Position } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: { href: string; children: React.ReactNode }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockPositions: Position[] = [
  {
    id: 1,
    ticker: 'PETR4',
    nome: 'Petrobras PN',
    classe_ativo: 'acao',
    setor: 'Energia',
    segmento: 'Petróleo',
    quantidade: 100,
    preco_medio: 25.5,
    data_criacao: '2024-01-15',
    updated_at: '2024-01-15',
  },
  {
    id: 2,
    ticker: 'VALE3',
    nome: 'Vale SA',
    classe_ativo: 'acao',
    setor: 'Materiais',
    segmento: 'Mineração',
    quantidade: 50,
    preco_medio: 65.0,
    data_criacao: '2024-02-10',
    updated_at: '2024-02-10',
  },
  {
    id: 3,
    ticker: 'HGLG11',
    nome: 'CSHG Logística',
    classe_ativo: 'fii',
    setor: 'Logística',
    segmento: null,
    quantidade: 10,
    preco_medio: 150.0,
    data_criacao: '2024-03-05',
    updated_at: '2024-03-05',
  },
  {
    id: 4,
    ticker: 'BTC',
    nome: 'Bitcoin',
    classe_ativo: 'cripto',
    setor: 'Criptomoeda',
    segmento: null,
    quantidade: 0.5,
    preco_medio: 120000.0,
    data_criacao: '2024-04-01',
    updated_at: '2024-04-01',
  },
];

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CarteiraPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ positions: mockPositions }),
    });
  });

  it('should render asset class tabs', async () => {
    render(<CarteiraPage />);

    await waitFor(() => {
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });
    expect(screen.getByText('FIIs')).toBeInTheDocument();
    expect(screen.getByText('Renda Fixa')).toBeInTheDocument();
    expect(screen.getByText('ETFs')).toBeInTheDocument();
    expect(screen.getByText('Cripto')).toBeInTheDocument();
  });

  it('should show position count for each asset class in tabs', async () => {
    render(<CarteiraPage />);

    // Wait for positions to load
    await waitFor(() => {
      expect(screen.getByText('PETR4')).toBeInTheDocument();
    });

    // Check that count badges are displayed
    expect(screen.getByText('(2)')).toBeInTheDocument(); // Ações
  });

  it('should filter positions when clicking on a tab', async () => {
    render(<CarteiraPage />);

    // Wait for positions to load initially
    await waitFor(() => {
      expect(screen.getByText('PETR4')).toBeInTheDocument();
    });
    expect(screen.getByText('VALE3')).toBeInTheDocument();

    // Click on FIIs tab
    fireEvent.click(screen.getByText(/FIIs/));

    // Should show only FII positions
    await waitFor(() => {
      expect(screen.queryByText('PETR4')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('VALE3')).not.toBeInTheDocument();
    expect(screen.getByText('HGLG11')).toBeInTheDocument();
  });

  it('should show empty state when no positions in selected asset class', async () => {
    render(<CarteiraPage />);

    // Wait for positions to load
    await waitFor(() => {
      expect(screen.getByText('PETR4')).toBeInTheDocument();
    });

    // Click on Renda Fixa tab (no positions)
    fireEvent.click(screen.getByText(/Renda Fixa/));

    await waitFor(() => {
      expect(screen.getByText('Nenhuma posição encontrada nesta classe de ativo.')).toBeInTheDocument();
    });
  });

  it('should mark active tab correctly', async () => {
    render(<CarteiraPage />);

    await waitFor(() => {
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    const acoesTab = screen.getByText('Ações').closest('button');
    const fiisTab = screen.getByText('FIIs').closest('button');

    // Ações should be active by default
    expect(acoesTab).toHaveAttribute('aria-selected', 'true');
    expect(fiisTab).toHaveAttribute('aria-selected', 'false');

    // Click on FIIs
    fireEvent.click(screen.getByText(/FIIs/));

    // Now FIIs should be active
    expect(fiisTab).toHaveAttribute('aria-selected', 'true');
    expect(acoesTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should render page header with total positions count', async () => {
    render(<CarteiraPage />);

    expect(screen.getByText('Carteira')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/4 posições/)).toBeInTheDocument();
    });
  });

  it('should render "Nova Posição" button', async () => {
    render(<CarteiraPage />);

    await waitFor(() => {
      expect(screen.getByText('Nova Posição')).toBeInTheDocument();
    });
  });

  it('should render positions with correct asset class badges', async () => {
    render(<CarteiraPage />);

    // Wait for positions to load (default tab is "acao")
    await waitFor(() => {
      expect(screen.getByText('PETR4')).toBeInTheDocument();
    });

    // Should show asset class labels (rendered as classe_ativo value)
    // Default tab is "acao", so only acao positions are shown (PETR4 and VALE3)
    expect(screen.getAllByText('acao').length).toBe(2);

    // Switch to FIIs tab to see fii badge
    fireEvent.click(screen.getByText(/FIIs/));
    await waitFor(() => {
      expect(screen.getByText('HGLG11')).toBeInTheDocument();
    });
    expect(screen.getByText('fii')).toBeInTheDocument();

    // Switch to Cripto tab to see cripto badge
    fireEvent.click(screen.getByText(/Cripto/));
    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });
    expect(screen.getByText('cripto')).toBeInTheDocument();
  });
});
