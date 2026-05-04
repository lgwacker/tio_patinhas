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

import { getQuoteService } from '@/lib/database';

describe('Quotes API Route', () => {
  let mockQuoteService: {
    fetchQuote: jest.Mock;
    setManualPrice: jest.Mock;
  };

  beforeEach(() => {
    mockQuoteService = {
      fetchQuote: jest.fn(),
      setManualPrice: jest.fn(),
    };
    (getQuoteService as jest.Mock).mockReturnValue(mockQuoteService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    it('should return quote data when fetch is successful', async () => {
      const mockResult = {
        success: true,
        data: {
          ticker: 'PETR4',
          preco: 28.45,
          fonte: 'yahoo',
          updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
      };
      mockQuoteService.fetchQuote.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4');
      const response = await GET(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ticker).toBe('PETR4');
      expect(data.preco).toBe(28.45);
      expect(data.fonte).toBe('yahoo');
      expect(data.updated_at).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should return 400 when ticker is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/quotes/%20');
      const response = await GET(request, { params: { ticker: '   ' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Ticker é obrigatório');
    });

    it('should return 503 when all APIs fail', async () => {
      mockQuoteService.fetchQuote.mockResolvedValue({
        success: false,
        error: 'Failed to fetch from all sources',
      });

      const request = new NextRequest('http://localhost:3000/api/quotes/INVALID');
      const response = await GET(request, { params: { ticker: 'INVALID' } });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Failed to fetch from all sources');
      expect(data.ticker).toBe('INVALID');
    });

    it('should return 500 on internal error', async () => {
      mockQuoteService.fetchQuote.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4');
      const response = await GET(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });
  });

  describe('POST', () => {
    it('should set manual price successfully', async () => {
      mockQuoteService.setManualPrice.mockReturnValue({
        ticker: 'PETR4',
        preco: 30.0,
        fonte: 'manual',
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      });

      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4', {
        method: 'POST',
        body: JSON.stringify({ preco: 30.0 }),
      });

      const response = await POST(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ticker).toBe('PETR4');
      expect(data.preco).toBe(30.0);
      expect(data.fonte).toBe('manual');
      expect(mockQuoteService.setManualPrice).toHaveBeenCalledWith('PETR4', 30.0);
    });

    it('should return 400 when ticker is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/quotes/%20', {
        method: 'POST',
        body: JSON.stringify({ preco: 30.0 }),
      });

      const response = await POST(request, { params: { ticker: '   ' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Ticker é obrigatório');
    });

    it('should return 400 when preco is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Preço é obrigatório');
    });

    it('should return 400 when preco is not a positive number', async () => {
      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4', {
        method: 'POST',
        body: JSON.stringify({ preco: -10 }),
      });

      const response = await POST(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Preço deve ser um número maior que zero');
    });

    it('should return 400 when preco is zero', async () => {
      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4', {
        method: 'POST',
        body: JSON.stringify({ preco: 0 }),
      });

      const response = await POST(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Preço deve ser um número maior que zero');
    });

    it('should return 500 when setManualPrice throws', async () => {
      mockQuoteService.setManualPrice.mockImplementation(() => {
        throw new Error('Preço deve ser maior que zero');
      });

      const request = new NextRequest('http://localhost:3000/api/quotes/PETR4', {
        method: 'POST',
        body: JSON.stringify({ preco: 30.0 }),
      });

      const response = await POST(request, { params: { ticker: 'PETR4' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Preço deve ser maior que zero');
    });

    it('should pass ticker as-is to service (service handles normalization)', async () => {
      mockQuoteService.setManualPrice.mockReturnValue({
        ticker: 'PETR4',
        preco: 30.0,
        fonte: 'manual',
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/quotes/petr4', {
        method: 'POST',
        body: JSON.stringify({ preco: 30.0 }),
      });

      await POST(request, { params: { ticker: 'petr4' } });

      // Route passes ticker as-is, service handles normalization
      expect(mockQuoteService.setManualPrice).toHaveBeenCalledWith('petr4', 30.0);
    });
  });
});
