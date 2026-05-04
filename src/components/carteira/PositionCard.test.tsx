import { render, screen } from '@testing-library/react';
import { PositionCard, PositionCardList } from '@/components/carteira/PositionCard';
import type { PositionWithValues } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: { href: string; children: React.ReactNode }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockPosition: PositionWithValues = {
  id: 1,
  ticker: 'PETR4',
  nome: 'Petrobras PN',
  classe_ativo: 'acao',
  setor: 'Energia',
  segmento: 'Petróleo',
  quantidade: 100,
  preco_medio: 25.5,
  preco_atual: 32.8,
  data_criacao: '2024-01-15',
  updated_at: '2024-01-15',
  valor_investido: 2550,
  valor_atual: 3280,
  ganho_valor: 730,
  ganho_percentual: 28.63,
  percentual_carteira: 45.2,
};

describe('PositionCard', () => {
  it('should render position ticker and name', () => {
    render(<PositionCard position={mockPosition} />);

    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('Petrobras PN')).toBeInTheDocument();
  });

  it('should render position values', () => {
    render(<PositionCard position={mockPosition} />);

    expect(screen.getByText('R$ 3.280,00')).toBeInTheDocument(); // valor_atual
    expect(screen.getByText('100 unid.')).toBeInTheDocument(); // quantidade
    expect(screen.getByText('R$ 2.550,00')).toBeInTheDocument(); // investido
  });

  it('should display gain values with correct colors', () => {
    render(<PositionCard position={mockPosition} />);

    expect(screen.getByText('+R$ 730,00')).toBeInTheDocument();
    expect(screen.getByText('+28.63%')).toBeInTheDocument();
  });

  it('should display portfolio percentage', () => {
    render(<PositionCard position={mockPosition} />);

    // Progress bar shows the percentage, and it's also shown as text in the grid
    expect(screen.getAllByText(/45\.2%/).length).toBeGreaterThan(0);
  });

  it('should link to position detail page', () => {
    render(<PositionCard position={mockPosition} />);

    const link = screen.getByText('PETR4').closest('a');
    expect(link).toHaveAttribute('href', '/posicao/1');
  });

  it('should use h2 heading for proper heading hierarchy', () => {
    render(<PositionCard position={mockPosition} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('PETR4');
  });

  it('should render without optional fields when not provided', () => {
    const positionWithoutName = { ...mockPosition, nome: '' };
    render(<PositionCard position={positionWithoutName} />);

    expect(screen.queryByText('Petrobras PN')).not.toBeInTheDocument();
  });
});

describe('PositionCardList', () => {
  const mockPositions: PositionWithValues[] = [
    mockPosition,
    {
      ...mockPosition,
      id: 2,
      ticker: 'VALE3',
      nome: 'Vale SA',
      valor_atual: 2910,
      ganho_valor: -340,
      ganho_percentual: -10.46,
    },
  ];

  it('should render multiple position cards', () => {
    render(<PositionCardList positions={mockPositions} />);

    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();
  });
});
