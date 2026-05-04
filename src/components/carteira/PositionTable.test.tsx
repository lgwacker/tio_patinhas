import { render, screen } from '@testing-library/react';
import { PositionTable } from '@/components/carteira/PositionTable';
import type { PositionWithValues } from '@/lib/carteira-types';

const mockPositions: PositionWithValues[] = [
  {
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
    preco_atual: 58.2,
    data_criacao: '2024-02-10',
    updated_at: '2024-02-10',
    valor_investido: 3250,
    valor_atual: 2910,
    ganho_valor: -340,
    ganho_percentual: -10.46,
    percentual_carteira: 40.1,
  },
];

describe('PositionTable', () => {
  it('should render table headers correctly', () => {
    render(<PositionTable positions={mockPositions} />);

    expect(screen.getByText('Ticker')).toBeInTheDocument();
    expect(screen.getByText('Quantidade')).toBeInTheDocument();
    expect(screen.getByText('Valor Total')).toBeInTheDocument();
    expect(screen.getByText('Investido')).toBeInTheDocument();
    expect(screen.getByText('Ganho R$')).toBeInTheDocument();
    expect(screen.getByText('Ganho %')).toBeInTheDocument();
    expect(screen.getByText('% Carteira')).toBeInTheDocument();
  });

  it('should render position data correctly', () => {
    render(<PositionTable positions={mockPositions} />);

    // Check first position
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('R$ 3.280,00')).toBeInTheDocument();

    // Check second position
    expect(screen.getByText('VALE3')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('R$ 2.910,00')).toBeInTheDocument();
  });

  it('should display gain/loss with correct colors', () => {
    render(<PositionTable positions={mockPositions} />);

    const gainElement = screen.getByText('+R$ 730,00');
    expect(gainElement).toHaveClass('text-profit');

    const lossElement = screen.getByText('-R$ 340,00');
    expect(lossElement).toHaveClass('text-loss');
  });

  it('should link to position detail page', () => {
    render(<PositionTable positions={mockPositions} />);

    const petrLink = screen.getByText('PETR4').closest('a');
    expect(petrLink).toHaveAttribute('href', '/posicao/1');

    const valeLink = screen.getByText('VALE3').closest('a');
    expect(valeLink).toHaveAttribute('href', '/posicao/2');
  });

  it('should have accessible links with aria-label for screen readers', () => {
    render(<PositionTable positions={mockPositions} />);

    const petrLink = screen.getByLabelText('Ver detalhes de PETR4');
    expect(petrLink).toBeInTheDocument();
    expect(petrLink).toHaveAttribute('href', '/posicao/1');

    const valeLink = screen.getByLabelText('Ver detalhes de VALE3');
    expect(valeLink).toBeInTheDocument();
    expect(valeLink).toHaveAttribute('href', '/posicao/2');
  });

  it('should have hidden class on mobile viewport', () => {
    const { container } = render(<PositionTable positions={mockPositions} />);

    const tableContainer = container.querySelector('.hidden.md\\:block');
    expect(tableContainer).toBeInTheDocument();
  });
});
