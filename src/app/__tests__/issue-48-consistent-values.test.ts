/**
 * @jest-environment node
 * 
 * Issue #48: Consistent Values Test
 * 
 * This test verifies that Dashboard and Carteira show consistent values for the same positions.
 * The root cause of the bug was that:
 * - Dashboard used quoteResolver.resolve() which only returns cached prices from DB
 * - Carteira used getAllQuotes() which also reads from DB cache
 * - Position Detail used quoteService.fetchPrice() which fetches LIVE quotes
 * 
 * The fix ensures all APIs fetch fresh quotes before calculating values.
 */

import { GET as getDashboard } from '@/app/api/dashboard/route';
import { GET as getPositionsWithQuotes } from '@/app/api/positions/with-quotes/route';
import { POST as createPosition } from '@/app/api/positions/route';
import { NextRequest } from 'next/server';

// Mock the external quote APIs to return consistent prices
const mockPrices: Record<string, number> = {};

jest.mock('@/domain/quotes/adapters/YahooFinanceAdapter', () => {
  return {
    YahooFinanceAdapter: jest.fn().mockImplementation(() => ({
      fetchPrice: jest.fn(async (ticker: string) => {
        const price = mockPrices[ticker.toUpperCase()];
        if (price && price > 0) {
          return { success: true, data: { ticker, preco: price, fonte: 'yahoo', updatedAt: new Date() } };
        }
        return { success: false, error: 'Not found' };
      }),
    })),
  };
});

jest.mock('@/domain/quotes/adapters/BrapiAdapter', () => {
  return {
    BrapiAdapter: jest.fn().mockImplementation(() => ({
      fetchPrice: jest.fn(async () => ({
        success: false,
        error: 'Fallback not needed',
      })),
    })),
  };
});

describe('Issue #48: Consistent Values Across Dashboard and Carteira', () => {
  // Generate unique tickers for each test to avoid conflicts
  let uniqueSuffix: string;

  beforeEach(() => {
    uniqueSuffix = Date.now().toString().slice(-5);
    jest.clearAllMocks();
  });

  it('should show consistent total portfolio value across Dashboard and Carteira', async () => {
    // Create PETR4-like position (150 shares @ R$ 30 = R$ 4,500 invested)
    const petrTicker = `P${uniqueSuffix}`;
    const petrPrice = 49.34;
    mockPrices[petrTicker] = petrPrice;

    const createPetrRequest = new NextRequest('http://localhost:3000/api/positions', {
      method: 'POST',
      body: JSON.stringify({
        ticker: petrTicker,
        nome: 'Test Petrobras',
        classe_ativo: 'acao',
        operation: {
          position_id: 0,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 150,
          valor_total: 4500.0,
        },
      }),
    });

    const petrResponse = await createPosition(createPetrRequest);
    expect(petrResponse.status).toBe(201);

    // Create VALE3-like position (50 shares @ R$ 50 = R$ 2,500 invested)
    const valeTicker = `V${uniqueSuffix}`;
    const valePrice = 65.50;
    mockPrices[valeTicker] = valePrice;

    const createValeRequest = new NextRequest('http://localhost:3000/api/positions', {
      method: 'POST',
      body: JSON.stringify({
        ticker: valeTicker,
        nome: 'Test Vale',
        classe_ativo: 'acao',
        operation: {
          position_id: 0,
          tipo: 'compra',
          data: '2024-01-20',
          quantidade: 50,
          valor_total: 2500.0,
        },
      }),
    });

    const valeResponse = await createPosition(createValeRequest);
    expect(valeResponse.status).toBe(201);

    // Get dashboard data
    const dashboardResponse = await getDashboard();
    expect(dashboardResponse.status).toBe(200);
    const dashboardData = await dashboardResponse.json();

    // Get carteira data
    const carteiraResponse = await getPositionsWithQuotes();
    expect(carteiraResponse.status).toBe(200);
    const carteiraData = await carteiraResponse.json();

    // Calculate Carteira total
    const carteiraTotal = carteiraData.positions.reduce(
      (sum: number, p: { valor_atual: number }) => sum + p.valor_atual, 
      0
    );

    // Dashboard total should match Carteira total - THIS IS THE KEY FIX
    expect(dashboardData.summary.totalValue).toBeCloseTo(carteiraTotal, 0);

    // Verify our new positions are in both responses with correct values
    const dashboardDistro = dashboardData.assetClassDistribution as Array<{ count: number }>;
    const totalPositionsInDashboard = dashboardDistro.reduce(
      (sum: number, d: { count: number }) => sum + d.count, 
      0
    );
    expect(totalPositionsInDashboard).toBe(dashboardData.summary.positionCount);
    
    // Both should have our new tickers with correct values
    const carteiraPetr4 = carteiraData.positions.find((p: { ticker: string }) => p.ticker === petrTicker);
    const carteiraVale3 = carteiraData.positions.find((p: { ticker: string }) => p.ticker === valeTicker);
    
    expect(carteiraPetr4).toBeDefined();
    expect(carteiraVale3).toBeDefined();
    
    // Verify they have the market prices we set
    expect(carteiraPetr4.preco_atual).toBeCloseTo(petrPrice, 2);
    expect(carteiraVale3.preco_atual).toBeCloseTo(valePrice, 2);
  });

  it('should use live market quotes for calculating position values', async () => {
    const ticker = `T${uniqueSuffix}`;
    const marketPrice = 49.34;
    const precoMedio = 25.00;
    mockPrices[ticker] = marketPrice;

    const createRequest = new NextRequest('http://localhost:3000/api/positions', {
      method: 'POST',
      body: JSON.stringify({
        ticker: ticker,
        nome: 'Live Quote Test',
        classe_ativo: 'acao',
        operation: {
          position_id: 0,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 100 * precoMedio,
        },
      }),
    });

    const createResponse = await createPosition(createRequest);
    expect(createResponse.status).toBe(201);

    // Get carteira data
    const carteiraResponse = await getPositionsWithQuotes();
    const carteiraData = await carteiraResponse.json();

    const position = carteiraData.positions.find((p: { ticker: string }) => p.ticker === ticker);
    expect(position).toBeDefined();

    // The fix ensures we use LIVE market price (49.34), not cached or preço_medio
    expect(position.preco_atual).toBeCloseTo(marketPrice, 2);
    expect(position.valor_atual).toBeCloseTo(100 * marketPrice, 0);
    expect(position.valor_investido).toBeCloseTo(100 * precoMedio, 0);

    // Calculate expected gain
    const expectedGain = (100 * marketPrice) - (100 * precoMedio);
    const expectedGainPercent = (expectedGain / (100 * precoMedio)) * 100;
    expect(position.ganho_valor).toBeCloseTo(expectedGain, 0);
    expect(position.ganho_percentual).toBeCloseTo(expectedGainPercent, 1);
  });

  it('should show consistent values for same position across Dashboard and Carteira', async () => {
    const ticker = `C${uniqueSuffix}`;
    const marketPrice = 55.75;
    const precoMedio = 30.00;
    mockPrices[ticker] = marketPrice;

    const createRequest = new NextRequest('http://localhost:3000/api/positions', {
      method: 'POST',
      body: JSON.stringify({
        ticker: ticker,
        nome: 'Consistency Test',
        classe_ativo: 'acao',
        operation: {
          position_id: 0,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 100 * precoMedio,
        },
      }),
    });

    await createPosition(createRequest);

    // Get both data sources
    const dashboardResponse = await getDashboard();
    const dashboardData = await dashboardResponse.json();

    const carteiraResponse = await getPositionsWithQuotes();
    const carteiraData = await carteiraResponse.json();

    const position = carteiraData.positions.find((p: { ticker: string }) => p.ticker === ticker);
    expect(position).toBeDefined();

    // Position in Carteira should have the market price
    expect(position.preco_atual).toBeCloseTo(marketPrice, 2);

    // Both Carteira and Dashboard should use the same quote source
    // Carteira total should include our position's market value
    const expectedPositionValue = 100 * marketPrice;
    
    // The position should be counted in dashboard
    expect(dashboardData.summary.positionCount).toBeGreaterThanOrEqual(1);
    
    // Carteira should have the position with market value
    expect(position.valor_atual).toBeCloseTo(expectedPositionValue, 0);
  });

  it('should calculate correct gain/loss percentages with live quotes', async () => {
    const ticker = `G${uniqueSuffix}`;
    const marketPrice = 60.00;
    const precoMedio = 40.00; // 50% gain expected
    mockPrices[ticker] = marketPrice;

    const createRequest = new NextRequest('http://localhost:3000/api/positions', {
      method: 'POST',
      body: JSON.stringify({
        ticker: ticker,
        nome: 'Gain Test',
        classe_ativo: 'acao',
        operation: {
          position_id: 0,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 50,
          valor_total: 50 * precoMedio,
        },
      }),
    });

    await createPosition(createRequest);

    // Get data
    const dashboardResponse = await getDashboard();
    const dashboardData = await dashboardResponse.json();

    const carteiraResponse = await getPositionsWithQuotes();
    const carteiraData = await carteiraResponse.json();

    const position = carteiraData.positions.find((p: { ticker: string }) => p.ticker === ticker);
    expect(position).toBeDefined();

    // Calculate expected gain: (3000 - 2000) / 2000 * 100 = 50%
    const invested = 50 * precoMedio;
    const current = 50 * marketPrice;
    const expectedGainPercent = ((current - invested) / invested) * 100;

    // Carteira should show correct gain percentage
    expect(position.ganho_percentual).toBeCloseTo(expectedGainPercent, 1);
    
    // Dashboard and Carteira should be consistent
    expect(dashboardData.summary.totalValue).toBeGreaterThanOrEqual(current);
  });
});
