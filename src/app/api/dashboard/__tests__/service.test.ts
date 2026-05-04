import Database from 'better-sqlite3';
import { MigrationRunner } from '@/data/MigrationRunner';
import { DatabaseModule } from '@/data/DatabaseModule';
import { QuoteResolver } from '@/domain/quotes/types';
import { DashboardService } from '../service';

class StubQuoteResolver implements QuoteResolver {
  private prices: Map<string, number> = new Map();

  setPrice(ticker: string, price: number): void {
    this.prices.set(ticker.toUpperCase(), price);
  }

  resolve(ticker: string): number | null {
    return this.prices.get(ticker.toUpperCase()) ?? null;
  }

  clear(): void {
    this.prices.clear();
  }
}

describe('DashboardService', () => {
  let db: Database.Database;
  let service: DashboardService;
  let dataModule: DatabaseModule;
  let quoteResolver: StubQuoteResolver;

  beforeEach(() => {
    db = new Database(':memory:');
    const migrations = new MigrationRunner(db);
    migrations.runMigrations();
    
    dataModule = new DatabaseModule(db);
    quoteResolver = new StubQuoteResolver();
    service = new DashboardService(dataModule, quoteResolver);
  });

  afterEach(() => {
    db.close();
  });

  describe('getDashboardData', () => {
    it('should return empty dashboard when no positions', () => {
      const data = service.getDashboardData();

      expect(data.summary.totalValue).toBe(0);
      expect(data.summary.totalInvested).toBe(0);
      expect(data.summary.totalGainLoss.value).toBe(0);
      expect(data.summary.totalGainLoss.percentage).toBe(0);
      expect(data.summary.positionCount).toBe(0);
      expect(data.assetClassDistribution).toEqual([]);
      expect(data.recentOperations).toEqual([]);
    });

    it('should calculate totals correctly with single position', () => {
      const position = dataModule.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.5,
      });

      dataModule.createOperation({
        position_id: position.id,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2550,
      });

      const data = service.getDashboardData();

      // Without quotes, preco_atual = preco_medio, so no gain/loss
      expect(data.summary.totalValue).toBe(2550);
      expect(data.summary.totalInvested).toBe(2550);
      expect(data.summary.totalGainLoss.value).toBe(0);
      expect(data.summary.totalGainLoss.percentage).toBe(0);
      expect(data.summary.positionCount).toBe(1);
    });

    it('should calculate gain/loss when quote exists', () => {
      dataModule.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.5,
      });

      quoteResolver.setPrice('PETR4', 30.0);

      const data = service.getDashboardData();

      // 100 shares at 30.0 = 3000
      expect(data.summary.totalValue).toBe(3000);
      // 100 shares at 25.5 = 2550
      expect(data.summary.totalInvested).toBe(2550);
      // Gain: 3000 - 2550 = 450
      expect(data.summary.totalGainLoss.value).toBe(450);
      // Percentage: (450 / 2550) * 100 = 17.65
      expect(data.summary.totalGainLoss.percentage).toBeCloseTo(17.65, 1);
    });

    it('should calculate asset class distribution', () => {
      dataModule.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.0,
      });

      dataModule.createPosition({
        ticker: 'HGLG11',
        nome: 'CSHG Logística',
        classe_ativo: 'fii',
        quantidade: 10,
        preco_medio: 150.0,
      });

      quoteResolver.setPrice('PETR4', 30.0);
      quoteResolver.setPrice('HGLG11', 160.0);

      const data = service.getDashboardData();

      // PETR4: 100 * 30 = 3000
      // HGLG11: 10 * 160 = 1600
      // Total: 4600
      
      expect(data.assetClassDistribution).toHaveLength(2);
      
      const acoes = data.assetClassDistribution.find(d => d.classe_ativo === 'acao');
      expect(acoes).toBeDefined();
      expect(acoes?.value).toBe(3000);
      expect(acoes?.percentage).toBeCloseTo(65.22, 1);
      expect(acoes?.count).toBe(1);
      expect(acoes?.label).toBe('Ações');

      const fiis = data.assetClassDistribution.find(d => d.classe_ativo === 'fii');
      expect(fiis).toBeDefined();
      expect(fiis?.value).toBe(1600);
      expect(fiis?.percentage).toBeCloseTo(34.78, 1);
      expect(fiis?.count).toBe(1);
      expect(fiis?.label).toBe('Fundos Imobiliários');
    });

    it('should return recent operations with position details', () => {
      const position = dataModule.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.5,
      });

      dataModule.createOperation({
        position_id: position.id,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2550,
      });

      const data = service.getDashboardData();

      expect(data.recentOperations).toHaveLength(1);
      expect(data.recentOperations[0].ticker).toBe('PETR4');
      expect(data.recentOperations[0].nome).toBe('Petrobras PN');
      expect(data.recentOperations[0].tipo).toBe('compra');
    });

    it('should return only last 5 operations', () => {
      const position = dataModule.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.5,
      });

      for (let i = 0; i < 7; i++) {
        dataModule.createOperation({
          position_id: position.id,
          tipo: 'compra',
          data: `2024-01-${15 + i}`,
          quantidade: 10,
          valor_total: 255,
        });
      }

      const data = service.getDashboardData();

      expect(data.recentOperations).toHaveLength(5);
      expect(data.recentOperations[0].data).toBe('2024-01-21');
    });

    it('should use stubbed quote resolver without database seeding', () => {
      dataModule.createPosition({
        ticker: 'AAPL',
        nome: 'Apple Inc',
        classe_ativo: 'acao',
        quantidade: 50,
        preco_medio: 100.0,
      });

      expect(quoteResolver.resolve('AAPL')).toBeNull();
      
      quoteResolver.setPrice('AAPL', 150.0);
      expect(quoteResolver.resolve('AAPL')).toBe(150.0);
      
      const data = service.getDashboardData();
      expect(data.summary.totalValue).toBe(7500);
      expect(data.summary.totalInvested).toBe(5000);
    });

    it('should isolate tests by clearing stub resolver between tests', () => {
      quoteResolver.setPrice('TEST', 100.0);
      expect(quoteResolver.resolve('TEST')).toBe(100.0);
      
      quoteResolver.clear();
      expect(quoteResolver.resolve('TEST')).toBeNull();
    });

    it('should include positions without quotes using preco_medio fallback', () => {
      // This test reproduces issue #49: positions without quotes should still appear
      // Create a position with a fake ticker that has no quote
      dataModule.createPosition({
        ticker: 'ABCD3',
        nome: 'Fake Company Ltda',
        classe_ativo: 'acao',
        quantidade: 10,
        preco_medio: 100.0,
      });

      dataModule.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.5,
      });

      // Only set quote for PETR4, not ABCD3
      quoteResolver.setPrice('PETR4', 30.0);

      const data = service.getDashboardData();

      // Both positions should be counted
      expect(data.summary.positionCount).toBe(2);
      
      // PETR4: 100 * 30 = 3000
      // ABCD3: 10 * 100 (preco_medio fallback) = 1000
      // Total: 4000
      expect(data.summary.totalValue).toBe(4000);
      expect(data.summary.totalInvested).toBe(3550); // 2550 + 1000
      
      // Check asset class distribution includes both positions
      const acoes = data.assetClassDistribution.find(d => d.classe_ativo === 'acao');
      expect(acoes).toBeDefined();
      expect(acoes?.count).toBe(2);
    });
  });
});
