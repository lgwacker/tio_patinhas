import { CarteiraCalculator, PositionSnapshot } from '../CarteiraCalculator';
import { Operacao } from '../../types';
import type { Position } from '@/types';

describe('CarteiraCalculator', () => {
  describe('calculateSnapshot', () => {
    it('should return zero snapshot for empty operations array', () => {
      const snapshot = CarteiraCalculator.calculateSnapshot([]);

      expect(snapshot.quantidade).toBe(0);
      expect(snapshot.precoMedio).toBe(0);
      expect(snapshot.valorInvestido).toBe(0);
      expect(snapshot.valorAtual).toBe(0);
      expect(snapshot.ganhoPerda.valor).toBe(0);
      expect(snapshot.ganhoPerda.percentual).toBe(0);
      expect(snapshot.percentualCarteira).toBe(0);
    });

    it('should calculate snapshot for single buy operation', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations);

      expect(snapshot.quantidade).toBe(100);
      expect(snapshot.precoMedio).toBe(10.0);
      expect(snapshot.valorInvestido).toBe(1000);
      expect(snapshot.valorAtual).toBe(1000); // precoAtual defaults to precoMedio
      expect(snapshot.ganhoPerda.valor).toBe(0);
      expect(snapshot.ganhoPerda.percentual).toBe(0);
    });

    it('should calculate snapshot for multiple buy operations', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
        { data: new Date('2024-02-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1200 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations);

      expect(snapshot.quantidade).toBe(200);
      expect(snapshot.precoMedio).toBe(11.0);
      expect(snapshot.valorInvestido).toBe(2200);
      expect(snapshot.valorAtual).toBe(2200);
      expect(snapshot.ganhoPerda.valor).toBe(0);
    });

    it('should calculate snapshot with partial sell', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
        { data: new Date('2024-02-01'), tipo: 'VENDA', quantidade: 50, valorTotal: 600 },
        { data: new Date('2024-03-01'), tipo: 'COMPRA', quantidade: 50, valorTotal: 650 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations);

      expect(snapshot.quantidade).toBe(100); // 100 - 50 + 50
      expect(snapshot.precoMedio).toBe(11.5); // (500 + 650) / 100
      expect(snapshot.valorInvestido).toBe(1150);
    });

    it('should handle sell-all-then-rebuy scenario', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
        { data: new Date('2024-02-01'), tipo: 'VENDA', quantidade: 100, valorTotal: 1200 },
        { data: new Date('2024-03-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1500 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations);

      expect(snapshot.quantidade).toBe(100);
      expect(snapshot.precoMedio).toBe(15.0); // Only the last buy matters
      expect(snapshot.valorInvestido).toBe(1500);
    });

    it('should handle selling more than owned (zero-out behavior)', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
        { data: new Date('2024-02-01'), tipo: 'VENDA', quantidade: 150, valorTotal: 1800 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations);

      expect(snapshot.quantidade).toBe(0); // Cannot go negative
      expect(snapshot.precoMedio).toBe(0);
      expect(snapshot.valorInvestido).toBe(0);
    });

    it('should ignore negative quantities and values', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: -100, valorTotal: -1000 },
        { data: new Date('2024-02-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations);

      expect(snapshot.quantidade).toBe(100); // Only the valid one counts
      expect(snapshot.precoMedio).toBe(10.0);
    });

    it('should calculate gain/loss when current price is provided', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, 15.0);

      expect(snapshot.quantidade).toBe(100);
      expect(snapshot.precoMedio).toBe(10.0);
      expect(snapshot.valorInvestido).toBe(1000);
      expect(snapshot.valorAtual).toBe(1500); // 100 * 15.0
      expect(snapshot.ganhoPerda.valor).toBe(500);
      expect(snapshot.ganhoPerda.percentual).toBe(50);
    });

    it('should calculate loss when current price is lower', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, 8.0);

      expect(snapshot.valorInvestido).toBe(1000);
      expect(snapshot.valorAtual).toBe(800);
      expect(snapshot.ganhoPerda.valor).toBe(-200);
      expect(snapshot.ganhoPerda.percentual).toBe(-20);
    });

    it('should calculate portfolio percentage when total value provided', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, 15.0, 3000);

      expect(snapshot.valorAtual).toBe(1500);
      expect(snapshot.percentualCarteira).toBe(50); // 1500 / 3000 = 50%
    });

    it('should return zero portfolio percentage when total value is zero or null', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshotWithZero = CarteiraCalculator.calculateSnapshot(operations, 15.0, 0);
      const snapshotWithNull = CarteiraCalculator.calculateSnapshot(operations, 15.0, null);

      expect(snapshotWithZero.percentualCarteira).toBe(0);
      expect(snapshotWithNull.percentualCarteira).toBe(0);
    });

    it('should use precoMedio as fallback when precoAtual is null', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, null);

      expect(snapshot.valorAtual).toBe(1000); // Uses precoMedio (10.0) as fallback
      expect(snapshot.ganhoPerda.valor).toBe(0);
    });

    it('should handle only sell operations (return zero)', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'VENDA', quantidade: 100, valorTotal: 1000 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, 15.0);

      expect(snapshot.quantidade).toBe(0);
      expect(snapshot.precoMedio).toBe(0);
      expect(snapshot.valorInvestido).toBe(0);
      expect(snapshot.valorAtual).toBe(0);
    });

    it('should round all values to two decimal places', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 3333.3333 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, 44.4444);

      expect(snapshot.precoMedio).toBe(33.33);
      expect(snapshot.valorInvestido).toBe(3333.33);
      expect(snapshot.valorAtual).toBe(4444.44);
    });

    it('should handle fractional percentual calculation correctly', () => {
      const operations: Operacao[] = [
        { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 3333 },
      ];

      const snapshot = CarteiraCalculator.calculateSnapshot(operations, 35.0);

      expect(snapshot.ganhoPerda.valor).toBeCloseTo(167, 0);
      expect(snapshot.ganhoPerda.percentual).toBeCloseTo(5.01, 2);
    });
  });

  describe('enrichPositions', () => {
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

    it('should return empty array when no positions', () => {
      const result = CarteiraCalculator.enrichPositions([]);
      expect(result).toEqual([]);
    });

    it('should calculate values using preco_medio as fallback when no quotes provided', () => {
      const result = CarteiraCalculator.enrichPositions(mockPositions);

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

      const result = CarteiraCalculator.enrichPositions(mockPositions, quotes);

      expect(result[0].valor_investido).toBe(2550);
      expect(result[0].valor_atual).toBe(3280);
      expect(result[0].ganho_valor).toBe(730);
      expect(result[0].ganho_percentual).toBeCloseTo(28.63, 1);
      expect(result[0].preco_atual).toBe(32.8);

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

      const result = CarteiraCalculator.enrichPositions(mockPositions, quotes);

      expect(result[0].percentual_carteira).toBeCloseTo(53.02, 1);
      expect(result[1].percentual_carteira).toBeCloseTo(47.01, 1);
    });

    it('should preserve all original position fields', () => {
      const result = CarteiraCalculator.enrichPositions(mockPositions);

      expect(result[0].id).toBe(1);
      expect(result[0].ticker).toBe('PETR4');
      expect(result[0].nome).toBe('Petrobras PN');
      expect(result[0].classe_ativo).toBe('acao');
      expect(result[0].quantidade).toBe(100);
      expect(result[0].preco_medio).toBe(25.5);
    });
  });
});
