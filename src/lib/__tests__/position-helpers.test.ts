import { enrichPositionsWithCalculatedValues } from '@/lib/position-helpers';
import type { Position } from '@/types';

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
];

describe('enrichPositionsWithCalculatedValues', () => {
  it('should return empty array when no positions', () => {
    const result = enrichPositionsWithCalculatedValues([]);
    expect(result).toEqual([]);
  });

  it('should calculate values using preco_medio as fallback when no quotes provided', () => {
    const result = enrichPositionsWithCalculatedValues(mockPositions);

    // PETR4: 100 * 25.5 = 2550 (both valor_investido and valor_atual)
    expect(result[0].valor_investido).toBe(2550);
    expect(result[0].valor_atual).toBe(2550);
    expect(result[0].ganho_valor).toBe(0);
    expect(result[0].ganho_percentual).toBe(0);
    expect(result[0].preco_atual).toBe(25.5);
  });

  it('should calculate values using provided quotes', () => {
    const quotes = {
      PETR4: 32.8,
      VALE3: 58.2,
    };

    const result = enrichPositionsWithCalculatedValues(mockPositions, quotes);

    // PETR4: valor_investido = 100 * 25.5 = 2550, valor_atual = 100 * 32.8 = 3280
    expect(result[0].valor_investido).toBe(2550);
    expect(result[0].valor_atual).toBe(3280);
    expect(result[0].ganho_valor).toBe(730);
    expect(result[0].ganho_percentual).toBeCloseTo(28.63, 1);
    expect(result[0].preco_atual).toBe(32.8);

    // VALE3: valor_investido = 50 * 65 = 3250, valor_atual = 50 * 58.2 = 2910
    expect(result[1].valor_investido).toBe(3250);
    expect(result[1].valor_atual).toBe(2910);
    expect(result[1].ganho_valor).toBe(-340);
    expect(result[1].ganho_percentual).toBeCloseTo(-10.46, 1);
  });

  it('should calculate percentual_carteira correctly', () => {
    const quotes = {
      PETR4: 32.8,
      VALE3: 58.2,
    };

    const result = enrichPositionsWithCalculatedValues(mockPositions, quotes);

    // Total value = 3280 + 2910 = 6190
    // PETR4: 3280 / 6190 = 53%
    // VALE3: 2910 / 6190 = 47%
    expect(result[0].percentual_carteira).toBeCloseTo(53.02, 1);
    expect(result[1].percentual_carteira).toBeCloseTo(47.01, 1);
  });

  it('should preserve all original position fields', () => {
    const result = enrichPositionsWithCalculatedValues(mockPositions);

    expect(result[0].id).toBe(1);
    expect(result[0].ticker).toBe('PETR4');
    expect(result[0].nome).toBe('Petrobras PN');
    expect(result[0].classe_ativo).toBe('acao');
    expect(result[0].quantidade).toBe(100);
    expect(result[0].preco_medio).toBe(25.5);
  });
});
