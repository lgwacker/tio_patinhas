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

    // Wait for positions to load (both table and card views render the same content)
    await waitFor(() => {
      expect(screen.getAllByText('PETR4').length).toBeGreaterThan(0);
    });

    // Check that count badges are displayed
    expect(screen.getByText('(2)')).toBeInTheDocument(); // Ações
  });

  it('should filter positions when clicking on a tab', async () => {
    render(<CarteiraPage />);

    // Wait for positions to load initially (both table and card views render)
    await waitFor(() => {
      expect(screen.getAllByText('PETR4').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('VALE3').length).toBeGreaterThan(0);

    // Click on FIIs tab
    fireEvent.click(screen.getByText(/FIIs/));

    // Should show only FII positions (both table and card views are filtered)
    await waitFor(() => {
      expect(screen.queryAllByText('PETR4')).toHaveLength(0);
    });
    expect(screen.queryAllByText('VALE3')).toHaveLength(0);
    expect(screen.getAllByText('HGLG11').length).toBeGreaterThan(0);
  });

  it('should show empty state when no positions in selected asset class', async () => {
    render(<CarteiraPage />);

    // Wait for positions to load (both table and card views render)
    await waitFor(() => {
      expect(screen.getAllByText('PETR4').length).toBeGreaterThan(0);
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

  it('should render both desktop table and mobile card views', async () => {
    const { container } = render(<CarteiraPage />);

    // Wait for positions to load (default tab is "acao") - both table and card views render
    await waitFor(() => {
      expect(screen.getAllByText('PETR4').length).toBeGreaterThan(0);
    });

    // Both table and card views should render the same content
    // Table view (desktop) has 'hidden md:block' class
    // Card view (mobile) has 'md:hidden' class

    // Verify table headers are present in table header elements (desktop view)
    // Using role 'columnheader' to distinguish from card labels
    const tableHeaders = screen.getAllByRole('columnheader');
    const headerTexts = tableHeaders.map(h => h.textContent);
    expect(headerTexts).toContain('Ticker');
    expect(headerTexts).toContain('Quantidade');
    expect(headerTexts).toContain('Valor Total');
    expect(headerTexts).toContain('Investido');
    expect(headerTexts).toContain('Ganho R$');
    expect(headerTexts).toContain('Ganho %');
    expect(headerTexts).toContain('% Carteira');

    // Verify the table container exists with responsive classes
    const tableContainer = container.querySelector('.hidden.md\\:block');
    expect(tableContainer).toBeInTheDocument();

    // Verify the card container exists with responsive classes  
    const cardContainer = container.querySelector('.md\\:hidden');
    expect(cardContainer).toBeInTheDocument();
  });
});
