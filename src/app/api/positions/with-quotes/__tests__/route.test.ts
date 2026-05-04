/**
 * @jest-environment node
 */

import { GET } from '../route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  getDatabase: jest.fn(),
  getPositionModule: jest.fn(),
}));

import { getDatabase, getPositionModule } from '@/lib/database';
import type { Position } from '@/types';

describe('Positions With Quotes API Route', () => {
  let mockDb: {
    prepare: jest.Mock;
  };
  let mockPositionModule: {
    getAllPositions: jest.Mock;
  };

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn(),
    };
    mockPositionModule = {
      getAllPositions: jest.fn(),
    };
    (getDatabase as jest.Mock).mockReturnValue(mockDb);
    (getPositionModule as jest.Mock).mockReturnValue(mockPositionModule);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return empty array when no positions exist', async () => {
    mockPositionModule.getAllPositions.mockReturnValue([]);
    
    // Mock the quotes query to return empty
    mockDb.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([]),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.positions).toEqual([]);
  });

  it('should return positions with preco_medio fallback when no quotes exist', async () => {
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
    ];

    mockPositionModule.getAllPositions.mockReturnValue(mockPositions);
    
    // Mock the quotes query to return empty (no quotes in DB)
    mockDb.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([]),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.positions).toHaveLength(1);
    
    const position = data.positions[0];
    expect(position.ticker).toBe('PETR4');
    expect(position.preco_atual).toBe(25.5); // Fallback to preco_medio
    expect(position.valor_investido).toBe(2550); // 100 * 25.5
    expect(position.valor_atual).toBe(2550); // 100 * 25.5
    expect(position.ganho_valor).toBe(0);
    expect(position.ganho_percentual).toBe(0);
    expect(position.percentual_carteira).toBe(100);
  });

  it('should calculate gain/loss using market prices when quotes exist', async () => {
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
    ];

    mockPositionModule.getAllPositions.mockReturnValue(mockPositions);
    
    // Mock the quotes query to return a market price
    mockDb.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([{ ticker: 'PETR4', preco: 30.0 }]),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.positions).toHaveLength(1);
    
    const position = data.positions[0];
    expect(position.ticker).toBe('PETR4');
    expect(position.preco_atual).toBe(30.0); // Market price from quote
    expect(position.valor_investido).toBe(2550); // 100 * 25.5
    expect(position.valor_atual).toBe(3000); // 100 * 30.0
    expect(position.ganho_valor).toBe(450); // 3000 - 2550
    expect(position.ganho_percentual).toBeCloseTo(17.65, 1); // (450 / 2550) * 100
    expect(position.percentual_carteira).toBe(100);
  });

  it('should calculate gain/loss for loss scenario when market price is lower', async () => {
    const mockPositions: Position[] = [
      {
        id: 2,
        ticker: 'VALE3',
        nome: 'Vale SA',
        classe_ativo: 'acao',
        setor: 'Materiais',
        segmento: 'Mineração',
        quantidade: 50,
        preco_medio: 50.0,
        data_criacao: '2024-02-10',
        updated_at: '2024-02-10',
      },
    ];

    mockPositionModule.getAllPositions.mockReturnValue(mockPositions);
    
    // Mock the quotes query to return a lower market price
    mockDb.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([{ ticker: 'VALE3', preco: 45.0 }]),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.positions).toHaveLength(1);
    
    const position = data.positions[0];
    expect(position.ticker).toBe('VALE3');
    expect(position.preco_atual).toBe(45.0);
    expect(position.valor_investido).toBe(2500); // 50 * 50.0
    expect(position.valor_atual).toBe(2250); // 50 * 45.0
    expect(position.ganho_valor).toBe(-250); // 2250 - 2500
    expect(position.ganho_percentual).toBe(-10); // (-250 / 2500) * 100
    expect(position.percentual_carteira).toBe(100);
  });

  it('should calculate portfolio percentages correctly for multiple positions', async () => {
    const mockPositions: Position[] = [
      {
        id: 1,
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        setor: 'Energia',
        segmento: 'Petróleo',
        quantidade: 100,
        preco_medio: 25.0,
        data_criacao: '2024-01-15',
        updated_at: '2024-01-15',
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
    ];

    mockPositionModule.getAllPositions.mockReturnValue(mockPositions);
    
    // Mock the quotes query to return market prices for both positions
    mockDb.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([
        { ticker: 'PETR4', preco: 30.0 },
        { ticker: 'HGLG11', preco: 160.0 },
      ]),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.positions).toHaveLength(2);

    // PETR4: 100 * 30 = 3000
    // HGLG11: 10 * 160 = 1600
    // Total: 4600
    
    const petr4 = data.positions.find((p: { ticker: string }) => p.ticker === 'PETR4');
    const hglg11 = data.positions.find((p: { ticker: string }) => p.ticker === 'HGLG11');

    expect(petr4).toBeDefined();
    expect(petr4?.valor_atual).toBe(3000);
    expect(petr4?.ganho_valor).toBe(500); // 3000 - 2500
    expect(petr4?.percentual_carteira).toBeCloseTo(65.22, 1);

    expect(hglg11).toBeDefined();
    expect(hglg11?.valor_atual).toBe(1600);
    expect(hglg11?.ganho_valor).toBe(100); // 1600 - 1500
    expect(hglg11?.percentual_carteira).toBeCloseTo(34.78, 1);
  });

  it('should handle mixed positions with and without quotes', async () => {
    const mockPositions: Position[] = [
      {
        id: 1,
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        setor: 'Energia',
        segmento: 'Petróleo',
        quantidade: 100,
        preco_medio: 25.0,
        data_criacao: '2024-01-15',
        updated_at: '2024-01-15',
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

    mockPositionModule.getAllPositions.mockReturnValue(mockPositions);
    
    // Mock the quotes query to return only PETR4 quote (not BTC)
    mockDb.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([{ ticker: 'PETR4', preco: 30.0 }]),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.positions).toHaveLength(2);

    const petr4 = data.positions.find((p: { ticker: string }) => p.ticker === 'PETR4');
    const btc = data.positions.find((p: { ticker: string }) => p.ticker === 'BTC');

    // PETR4 has quote, so uses market price
    expect(petr4?.preco_atual).toBe(30.0);
    expect(petr4?.valor_atual).toBe(3000);

    // BTC has no quote, so falls back to preco_medio
    expect(btc?.preco_atual).toBe(120000.0);
    expect(btc?.valor_atual).toBe(60000); // 0.5 * 120000
    expect(btc?.ganho_valor).toBe(0);
  });
});
