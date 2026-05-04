import { CarteiraCalculator, PositionSnapshot } from '../CarteiraCalculator';
import { Operacao } from '../../types';

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
});
