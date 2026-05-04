import {
  formatAssetClassLabel,
  VALID_ASSET_CLASSES,
  ASSET_CLASSES,
} from '@/lib/constants';
import type { AssetClass } from '@/lib/constants';

describe('constants', () => {
  describe('formatAssetClassLabel', () => {
    it('should format acao to Ação', () => {
      expect(formatAssetClassLabel('acao')).toBe('Ação');
    });

    it('should format fii to Fundo Imobiliário (FII)', () => {
      expect(formatAssetClassLabel('fii')).toBe('Fundo Imobiliário (FII)');
    });

    it('should format renda_fixa to Renda Fixa', () => {
      expect(formatAssetClassLabel('renda_fixa')).toBe('Renda Fixa');
    });

    it('should format etf to ETF', () => {
      expect(formatAssetClassLabel('etf')).toBe('ETF');
    });

    it('should format cripto to Criptomoeda', () => {
      expect(formatAssetClassLabel('cripto')).toBe('Criptomoeda');
    });

    it('should return raw value for unknown asset class', () => {
      expect(formatAssetClassLabel('unknown' as AssetClass)).toBe('unknown');
    });
  });

  describe('VALID_ASSET_CLASSES', () => {
    it('should contain all valid asset classes', () => {
      expect(VALID_ASSET_CLASSES).toContain('acao');
      expect(VALID_ASSET_CLASSES).toContain('fii');
      expect(VALID_ASSET_CLASSES).toContain('renda_fixa');
      expect(VALID_ASSET_CLASSES).toContain('etf');
      expect(VALID_ASSET_CLASSES).toContain('cripto');
      expect(VALID_ASSET_CLASSES).toHaveLength(5);
    });
  });

  describe('ASSET_CLASSES', () => {
    it('should have correct mapping for all asset classes', () => {
      ASSET_CLASSES.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
        expect(typeof option.label).toBe('string');
      });
    });

    it('should match VALID_ASSET_CLASSES values', () => {
      const values = ASSET_CLASSES.map((c) => c.value);
      expect(values).toEqual(expect.arrayContaining([...VALID_ASSET_CLASSES]));
    });
  });
});
