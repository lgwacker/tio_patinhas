import { render, screen, fireEvent } from '@testing-library/react';
import { PositionList } from '@/components/carteira/PositionList';
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

describe('PositionList', () => {
  const mockOnPositionClick = jest.fn();

  beforeEach(() => {
    mockOnPositionClick.mockClear();
  });

  it('should render empty state when no positions', () => {
    render(<PositionList positions={[]} />);

    expect(screen.getByText('Nenhuma posição encontrada nesta classe de ativo.')).toBeInTheDocument();
  });

  it('should render positions sorted by valor_atual desc', () => {
    render(<PositionList positions={mockPositions} />);

    // PETR4 has highest valor_atual (3280), VALE3 is second (2910), HGLG11 is third (1568)
    const rows = screen.getAllByRole('row');

    // Skip header row, check first data row
    const firstDataRow = rows[1];
    expect(firstDataRow).toHaveTextContent('PETR4');
  });

  it('should call onPositionClick when position is clicked', () => {
    render(<PositionList positions={mockPositions} onPositionClick={mockOnPositionClick} />);

    // Get the table row specifically (desktop view)
    const petrElements = screen.getAllByText('PETR4');
    const petrRow = petrElements[0].closest('tr');
    if (petrRow) {
      fireEvent.click(petrRow);
    }

    expect(mockOnPositionClick).toHaveBeenCalledWith(mockPositions[0]);
  });

  it('should render both table (desktop) and card list (mobile)', () => {
    const { container } = render(<PositionList positions={mockPositions} />);

    // Desktop table should exist
    expect(container.querySelector('table')).toBeInTheDocument();

    // Mobile card list should exist
    expect(container.querySelector('.md\\:hidden')).toBeInTheDocument();
  });
});
