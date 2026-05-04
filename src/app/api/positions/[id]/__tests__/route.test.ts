/**
 * @jest-environment node
 */

import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock the database module
jest.mock('@/lib/database', () => ({
  getPositionModule: jest.fn(),
  getQuoteService: jest.fn(),
}));

import { getPositionModule, getQuoteService } from '@/lib/database';

describe('GET /api/positions/[id]', () => {
  let mockPositionModule: {
    getPositionById: jest.Mock;
    getPositionWithCalculations: jest.Mock;
  };
  let mockQuoteService: {
    fetchPrice: jest.Mock;
  };

  beforeEach(() => {
    mockPositionModule = {
      getPositionById: jest.fn(),
      getPositionWithCalculations: jest.fn(),
    };
    mockQuoteService = {
      fetchPrice: jest.fn(),
    };
    (getPositionModule as jest.Mock).mockReturnValue(mockPositionModule);
    (getQuoteService as jest.Mock).mockReturnValue(mockQuoteService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const createMockRequest = (id: string): NextRequest => {
    return new NextRequest(`http://localhost:3000/api/positions/${id}`);
  };

  describe('basic validations', () => {
    it('should return 400 for invalid ID', async () => {
      const response = await GET(createMockRequest('invalid'), {
        params: { id: 'invalid' },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID inválido');
    });

    it('should return 404 when position not found', async () => {
      mockPositionModule.getPositionById.mockReturnValue(null);

      const response = await GET(createMockRequest('999'), {
        params: { id: '999' },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Posição não encontrada');
    });
  });

  describe('gain/loss calculations with market price', () => {
    it('should fetch market price and calculate correct gain/loss', async () => {
      const mockPosition = {
        id: 1,
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        setor: 'Energia',
        segmento: 'Petróleo',
        quantidade: 150,
        preco_medio: 26.67,
        data_criacao: '2024-01-15',
        updated_at: '2024-01-15',
      };

      const mockCalculatedPosition = {
        ...mockPosition,
        operations: [],
        valorInvestido: 4000.5,
        valorAtual: 7423.5,
        ganhoValor: 3423,
        ganhoPercentual: 85.56,
        precoAtual: 49.49,
      };

      mockPositionModule.getPositionById.mockReturnValue(mockPosition);
      mockQuoteService.fetchPrice.mockResolvedValue(49.49);
      mockPositionModule.getPositionWithCalculations.mockReturnValue(mockCalculatedPosition);

      const response = await GET(createMockRequest('1'), {
        params: { id: '1' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockQuoteService.fetchPrice).toHaveBeenCalledWith('PETR4');
      expect(mockPositionModule.getPositionWithCalculations).toHaveBeenCalledWith(1, 49.49);
      expect(data.position.valorAtual).toBe(7423.5);
      expect(data.position.ganhoValor).toBe(3423);
      expect(data.position.ganhoPercentual).toBe(85.56);
      expect(data.position.precoAtual).toBe(49.49);
    });

    it('should calculate loss when market price is lower than average price', async () => {
      const mockPosition = {
        id: 2,
        ticker: 'VALE3',
        nome: 'Vale SA',
        classe_ativo: 'acao',
        setor: 'Materiais',
        segmento: 'Mineração',
        quantidade: 100,
        preco_medio: 65.0,
        data_criacao: '2024-01-15',
        updated_at: '2024-01-15',
      };

      const mockCalculatedPosition = {
        ...mockPosition,
        operations: [],
        valorInvestido: 6500,
        valorAtual: 5500,
        ganhoValor: -1000,
        ganhoPercentual: -15.38,
        precoAtual: 55.0,
      };

      mockPositionModule.getPositionById.mockReturnValue(mockPosition);
      mockQuoteService.fetchPrice.mockResolvedValue(55.0);
      mockPositionModule.getPositionWithCalculations.mockReturnValue(mockCalculatedPosition);

      const response = await GET(createMockRequest('2'), {
        params: { id: '2' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockQuoteService.fetchPrice).toHaveBeenCalledWith('VALE3');
      expect(mockPositionModule.getPositionWithCalculations).toHaveBeenCalledWith(2, 55.0);
      expect(data.position.ganhoValor).toBe(-1000);
      expect(data.position.ganhoPercentual).toBe(-15.38);
    });

    it('should use 0 as price when quote service returns null', async () => {
      const mockPosition = {
        id: 3,
        ticker: 'UNKNOWN',
        nome: 'Unknown Company',
        classe_ativo: 'acao',
        setor: null,
        segmento: null,
        quantidade: 100,
        preco_medio: 50.0,
        data_criacao: '2024-01-15',
        updated_at: '2024-01-15',
      };

      const mockCalculatedPosition = {
        ...mockPosition,
        operations: [],
        valorInvestido: 5000,
        valorAtual: 0,
        ganhoValor: -5000,
        ganhoPercentual: -100,
        precoAtual: 0,
      };

      mockPositionModule.getPositionById.mockReturnValue(mockPosition);
      mockQuoteService.fetchPrice.mockResolvedValue(null);
      mockPositionModule.getPositionWithCalculations.mockReturnValue(mockCalculatedPosition);

      const response = await GET(createMockRequest('3'), {
        params: { id: '3' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockQuoteService.fetchPrice).toHaveBeenCalledWith('UNKNOWN');
      expect(mockPositionModule.getPositionWithCalculations).toHaveBeenCalledWith(3, 0);
      expect(data.position.precoAtual).toBe(0);
    });

    it('should include operations in the response', async () => {
      const mockPosition = {
        id: 1,
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        setor: 'Energia',
        segmento: 'Petróleo',
        quantidade: 150,
        preco_medio: 26.67,
        data_criacao: '2024-01-15',
        updated_at: '2024-01-15',
      };

      const mockOperations = [
        {
          id: 1,
          position_id: 1,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 150,
          valor_total: 4000.5,
          preco_unitario: 26.67,
          created_at: '2024-01-15',
        },
      ];

      const mockCalculatedPosition = {
        ...mockPosition,
        operations: mockOperations,
        valorInvestido: 4000.5,
        valorAtual: 7423.5,
        ganhoValor: 3423,
        ganhoPercentual: 85.56,
        precoAtual: 49.49,
      };

      mockPositionModule.getPositionById.mockReturnValue(mockPosition);
      mockQuoteService.fetchPrice.mockResolvedValue(49.49);
      mockPositionModule.getPositionWithCalculations.mockReturnValue(mockCalculatedPosition);

      const response = await GET(createMockRequest('1'), {
        params: { id: '1' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.operations).toEqual(mockOperations);
      expect(data.position.operations).toEqual(mockOperations);
    });
  });

  describe('error handling', () => {
    it('should return 500 on internal error', async () => {
      mockPositionModule.getPositionById.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await GET(createMockRequest('1'), {
        params: { id: '1' },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });
  });
});
