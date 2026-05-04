import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/page';

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: { href: string; children: React.ReactNode }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: () => <span data-testid="trending-up">↑</span>,
  TrendingDown: () => <span data-testid="trending-down">↓</span>,
  Wallet: () => <span data-testid="wallet">Wallet</span>,
  PieChart: () => <span data-testid="pie-chart">Pie</span>,
  ArrowRight: () => <span data-testid="arrow-right">→</span>,
  Activity: () => <span data-testid="activity">Activity</span>,
  Plus: () => <span data-testid="plus">+</span>,
  History: () => <span data-testid="history">History</span>,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display user-friendly error message when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar dados')).toBeInTheDocument();
    });

    expect(screen.getByText(/Ocorreu um problema ao carregar suas informações/)).toBeInTheDocument();
    expect(screen.getByText(/Por favor, tente novamente/)).toBeInTheDocument();
  });

  it('should not display technical error message to user', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Database connection failed'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar dados')).toBeInTheDocument();
    });

    expect(screen.queryByText('Database connection failed')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to fetch dashboard data')).not.toBeInTheDocument();
  });

  it('should display retry button when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar dados')).toBeInTheDocument();
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
          summary: {
            totalValue: 10000,
            totalInvested: 9000,
            totalGainLoss: { value: 1000, percentage: 11.11 },
            positionCount: 2,
          },
          assetClassDistribution: [],
          recentOperations: [],
        }),
      });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar dados')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByText('Não foi possível carregar dados')).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should log technical error to console for debugging', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Database connection failed'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar dados')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Dashboard] Failed to fetch data:',
      expect.any(Error)
    );
  });

  it('should show loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should display dashboard data when API succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        summary: {
          totalValue: 10000,
          totalInvested: 9000,
          totalGainLoss: { value: 1000, percentage: 11.11 },
          positionCount: 2,
        },
        assetClassDistribution: [],
        recentOperations: [],
      }),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Visão geral da sua carteira')).toBeInTheDocument();
  });
});
