import { render, screen } from '@testing-library/react';
import { PositionList } from '@/components/carteira/PositionList';
import type { PositionWithValues } from '@/types';

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
  {
    id: 3,
    ticker: 'HGLG11',
    nome: 'CSHG Logística',
    classe_ativo: 'fii',
    setor: 'Logística',
    segmento: null,
    quantidade: 10,
    preco_medio: 150.0,
    preco_atual: 156.8,
    data_criacao: '2024-03-05',
    updated_at: '2024-03-05',
    valor_investido: 1500,
    valor_atual: 1568,
    ganho_valor: 68,
    ganho_percentual: 4.53,
    percentual_carteira: 21.6,
  },
];

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: { href: string; children: React.ReactNode }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('PositionList', () => {
  it('should render positions sorted by valor_atual desc', () => {
    render(<PositionList positions={mockPositions} />);

    // PETR4 has highest valor_atual (3280), VALE3 is second (2910), HGLG11 is third (1568)
    const rows = screen.getAllByRole('row');

    // Skip header row, check first data row
    const firstDataRow = rows[1];
    expect(firstDataRow).toHaveTextContent('PETR4');
  });

  it('should render both table (desktop) and card list (mobile)', () => {
    const { container } = render(<PositionList positions={mockPositions} />);

    // Desktop table should exist
    expect(container.querySelector('table')).toBeInTheDocument();

    // Mobile card list should exist
    expect(container.querySelector('.md\\:hidden')).toBeInTheDocument();
  });

  it('should link to correct position detail pages', () => {
    render(<PositionList positions={mockPositions} />);

    // Check that positions link to their detail pages (table and card both render same content)
    const petrLinks = screen.getAllByText('PETR4').map(el => el.closest('a'));
    expect(petrLinks[0]).toHaveAttribute('href', '/posicao/1');

    const valeLinks = screen.getAllByText('VALE3').map(el => el.closest('a'));
    expect(valeLinks[0]).toHaveAttribute('href', '/posicao/2');
  });
});
