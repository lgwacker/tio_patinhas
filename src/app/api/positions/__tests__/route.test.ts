/**
 * @jest-environment node
 */

import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the database module
jest.mock('@/lib/database', () => ({
  getDatabase: jest.fn(),
  getDatabaseModule: jest.fn(),
  getPositionModule: jest.fn(),
  getQuoteService: jest.fn(),
}));

import { getPositionModule } from '@/lib/database';
import { PositionValidationError } from '@/domain/position/PositionModule';

describe('Positions API Route', () => {
  let mockPositionModule: {
    getAllPositions: jest.Mock;
    createPositionWithFirstOperation: jest.Mock;
  };

  beforeEach(() => {
    mockPositionModule = {
      getAllPositions: jest.fn(),
      createPositionWithFirstOperation: jest.fn(),
    };
    (getPositionModule as jest.Mock).mockReturnValue(mockPositionModule);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    it('should return all positions', async () => {
      const mockPositions = [
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
      mockPositionModule.getAllPositions.mockReturnValue(mockPositions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.positions).toEqual(mockPositions);
      expect(mockPositionModule.getAllPositions).toHaveBeenCalled();
    });

    it('should return empty array when no positions exist', async () => {
      mockPositionModule.getAllPositions.mockReturnValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.positions).toEqual([]);
    });

    it('should return 500 on internal error', async () => {
      mockPositionModule.getAllPositions.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch positions');
    });
  });

  describe('POST', () => {
    it('should create a new position successfully', async () => {
      const mockResult = {
        position: {
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
        operation: {
          id: 1,
          position_id: 1,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2550.0,
          preco_unitario: 25.5,
          created_at: '2024-01-15',
        },
      };
      mockPositionModule.createPositionWithFirstOperation.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: 'PETR4',
          nome: 'Petrobras PN',
          classe_ativo: 'acao',
          setor: 'Energia',
          segmento: 'Petróleo',
          operation: {
            tipo: 'compra',
            data: '2024-01-15',
            quantidade: 100,
            valor_total: 2550.0,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockResult);
    });

    it('should return 400 on validation error', async () => {
      const validationErrors = [
        { field: 'ticker', message: 'Ticker é obrigatório' },
      ];
      mockPositionModule.createPositionWithFirstOperation.mockRejectedValue(
        new PositionValidationError(validationErrors)
      );

      const request = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: '',
          nome: 'Test',
          classe_ativo: 'acao',
          operation: {
            tipo: 'compra',
            data: '2024-01-15',
            quantidade: 100,
            valor_total: 2550.0,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Erro de validação');
      expect(data.details).toEqual(validationErrors);
    });

    it('should return 500 on internal error', async () => {
      mockPositionModule.createPositionWithFirstOperation.mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: 'PETR4',
          nome: 'Petrobras PN',
          classe_ativo: 'acao',
          operation: {
            tipo: 'compra',
            data: '2024-01-15',
            quantidade: 100,
            valor_total: 2550.0,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });
  });
});
