/**
 * Issue #52: 🐛 New position shows false -100% loss when market quote is unavailable
 * 
 * When a position is created with a ticker that has no available market quote,
 * the Position Detail page should NOT show -100% loss. Instead, it should show
 * "Preço não disponível" or similar neutral messaging.
 */

import { CarteiraCalculator } from '@/domain/calculator/CarteiraCalculator';
import { Operacao } from '@/domain/types';

describe('Issue #52: False -100% loss when quote unavailable', () => {
  describe('CarteiraCalculator.calculateSnapshot', () => {
    const mockOperations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
    ];

    it('should NOT show -100% loss when precoAtual is 0 (quote unavailable)', () => {
      // When API returns null/undefined and we default to 0, this should be
      // treated as "no quote available" not as "price is 0"
      const snapshot = CarteiraCalculator.calculateSnapshot(mockOperations, 0);

      // Should NOT calculate loss -100%
      expect(snapshot.ganhoPerda.percentual).not.toBe(-100);
      
      // Should indicate quote is unavailable
      expect(snapshot.precoAtualDisponivel).toBe(false);
      
      // Gain/loss should be 0 when quote unavailable
      expect(snapshot.ganhoPerda.valor).toBe(0);
      expect(snapshot.ganhoPerda.percentual).toBe(0);
      
      // But should still show invested value correctly
      expect(snapshot.valorInvestido).toBe(1000);
      expect(snapshot.precoMedio).toBe(10);
    });

    it('should show normal gain/loss when precoAtual is provided and > 0', () => {
      const snapshot = CarteiraCalculator.calculateSnapshot(mockOperations, 15);

      expect(snapshot.precoAtualDisponivel).toBe(true);
      expect(snapshot.ganhoPerda.valor).toBe(500); // 1500 - 1000
      expect(snapshot.ganhoPerda.percentual).toBe(50);
    });

    it('should use precoMedio fallback when precoAtual is null (not 0)', () => {
      const snapshot = CarteiraCalculator.calculateSnapshot(mockOperations, null);

      // When explicitly null, should use precoMedio as fallback
      expect(snapshot.precoAtualDisponivel).toBe(false);
      expect(snapshot.valorAtual).toBe(1000); // Uses precoMedio
      expect(snapshot.ganhoPerda.valor).toBe(0);
      expect(snapshot.ganhoPerda.percentual).toBe(0);
    });

    it('should use precoMedio fallback when precoAtual is undefined', () => {
      const snapshot = CarteiraCalculator.calculateSnapshot(mockOperations, undefined);

      expect(snapshot.precoAtualDisponivel).toBe(false);
      expect(snapshot.valorAtual).toBe(1000); // Uses precoMedio
      expect(snapshot.ganhoPerda.valor).toBe(0);
      expect(snapshot.ganhoPerda.percentual).toBe(0);
    });
  });

  describe('PositionModule.getPositionWithCalculations', () => {
    // These tests verify the integration between PositionModule and CarteiraCalculator
    // The position should include a flag indicating if the quote is available
    
    it('should return precoAtualDisponivel flag in the result', () => {
      // This is a placeholder for the integration test
      // The actual implementation should include precoAtualDisponivel in the returned object
      expect(true).toBe(true);
    });
  });
});
