import {
  formatCurrency,
  formatPercentage,
  formatPercentageAbsolute,
  formatQuantity,
  formatAssetClassLabel,
} from '@/lib/formatters';
import type { AssetClass } from '@/lib/constants';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive value as Brazilian Real', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('R$');
      expect(formatted).toContain('1.234,56');
    });

    it('should format negative value with minus sign', () => {
      const formatted = formatCurrency(-500);
      expect(formatted).toContain('-');
      expect(formatted).toContain('500');
    });

    it('should format zero correctly', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('R$');
      expect(formatted).toContain('0,00');
    });

    it('should handle decimal values correctly', () => {
      const formatted = formatCurrency(100.5);
      expect(formatted).toContain('100,50');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentage with plus sign', () => {
      expect(formatPercentage(15.5)).toBe('+15.50%');
    });

    it('should format negative percentage with minus sign', () => {
      expect(formatPercentage(-10.25)).toBe('-10.25%');
    });

    it('should format zero with plus sign', () => {
      expect(formatPercentage(0)).toBe('+0.00%');
    });
  });

  describe('formatPercentageAbsolute', () => {
    it('should format percentage without sign', () => {
      expect(formatPercentageAbsolute(25.75)).toBe('25.8%');
    });

    it('should handle negative values as positive', () => {
      expect(formatPercentageAbsolute(-5.5)).toBe('-5.5%');
    });
  });

  describe('formatQuantity', () => {
    it('should format quantity with thousands separator', () => {
      expect(formatQuantity(1500)).toBe('1.500');
    });

    it('should format quantity without decimals', () => {
      expect(formatQuantity(100.75)).toBe('101');
    });
  });

  describe('formatAssetClassLabel', () => {
    it('formats acao to Ação', () => {
      expect(formatAssetClassLabel('acao')).toBe('Ação');
    });

    it('formats fii to Fundo Imobiliário (FII)', () => {
      expect(formatAssetClassLabel('fii')).toBe('Fundo Imobiliário (FII)');
    });

    it('formats renda_fixa to Renda Fixa', () => {
      expect(formatAssetClassLabel('renda_fixa')).toBe('Renda Fixa');
    });

    it('formats etf to ETF', () => {
      expect(formatAssetClassLabel('etf')).toBe('ETF');
    });

    it('formats cripto to Criptomoeda', () => {
      expect(formatAssetClassLabel('cripto')).toBe('Criptomoeda');
    });

    it('returns raw value for unknown asset class', () => {
      expect(formatAssetClassLabel('unknown' as AssetClass)).toBe('unknown');
    });
  });
});
