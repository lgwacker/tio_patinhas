import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoricoPage from '@/app/historico/page';

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: { href: string; children: React.ReactNode }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingDown: () => <span data-testid="trending-down">↓</span>,
  History: () => <span data-testid="history">History</span>,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HistoricoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display user-friendly error message when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar o histórico')).toBeInTheDocument();
    });

    expect(screen.getByText(/Ocorreu um problema ao carregar suas operações/)).toBeInTheDocument();
    expect(screen.getByText(/Por favor, tente novamente/)).toBeInTheDocument();
  });

  it('should not display technical error message to user', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Database connection failed'));

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar o histórico')).toBeInTheDocument();
    });

    expect(screen.queryByText('Database connection failed')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to fetch historico data')).not.toBeInTheDocument();
  });

  it('should display retry button when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar o histórico')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should retry fetching data when retry button is clicked', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          operations: [
            {
              id: 1,
              position_id: 1,
              tipo: 'compra',
              data: '2024-01-15',
              quantidade: 100,
              preco_unitario: 25.5,
              valor_total: 2550,
            },
          ],
          positions: [
            {
              id: 1,
              ticker: 'PETR4',
              nome: 'Petrobras PN',
              classe_ativo: 'Ação',
            },
          ],
        }),
      });

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar o histórico')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByText('Não foi possível carregar o histórico')).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should log technical error to console for debugging', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Database connection failed'));

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar o histórico')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Historico] Failed to fetch data:',
      expect.any(Error)
    );
  });

  it('should show loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<HistoricoPage />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should display historico data when API succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        operations: [
          {
            id: 1,
            position_id: 1,
            tipo: 'compra',
            data: '2024-01-15',
            quantidade: 100,
            preco_unitario: 25.5,
            valor_total: 2550,
          },
        ],
        positions: [
          {
            id: 1,
            ticker: 'PETR4',
            nome: 'Petrobras PN',
            classe_ativo: 'Ação',
          },
        ],
      }),
    });

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Histórico')).toBeInTheDocument();
    });

    expect(screen.getByText('Todas as operações registradas')).toBeInTheDocument();
    expect(screen.getByText('Operações (1)')).toBeInTheDocument();
  });

  it('should display empty state when no operations exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        operations: [],
        positions: [],
      }),
    });

    render(<HistoricoPage />);

    await waitFor(() => {
      expect(screen.getByText('Operações (0)')).toBeInTheDocument();
    });

    expect(screen.getByText('Nenhuma operação registrada ainda.')).toBeInTheDocument();
  });
});
