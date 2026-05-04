import {
  VALID_ASSET_CLASSES,
  ASSET_CLASSES,
  VALIDATION_LIMITS,
} from '@/lib/constants';

describe('constants', () => {
  describe('VALID_ASSET_CLASSES', () => {
    it('contains all valid asset classes', () => {
      expect(VALID_ASSET_CLASSES).toContain('acao');
      expect(VALID_ASSET_CLASSES).toContain('fii');
      expect(VALID_ASSET_CLASSES).toContain('renda_fixa');
      expect(VALID_ASSET_CLASSES).toContain('etf');
      expect(VALID_ASSET_CLASSES).toContain('cripto');
      expect(VALID_ASSET_CLASSES).toHaveLength(5);
    });
  });

  describe('ASSET_CLASSES', () => {
    it('has correct mapping for all asset classes', () => {
      ASSET_CLASSES.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
        expect(typeof option.label).toBe('string');
      });
    });

    it('matches VALID_ASSET_CLASSES values', () => {
      const values = ASSET_CLASSES.map((c) => c.value);
      expect(values).toEqual(expect.arrayContaining([...VALID_ASSET_CLASSES]));
    });
  });

  describe('VALIDATION_LIMITS', () => {
    it('has string values to prevent floating-point precision leaks in HTML', () => {
      // HTML validation attributes must be strings to avoid IEEE 754 precision issues
      // e.g., 0.01 becomes "0.009999999776482582" when rendered as a number
      expect(typeof VALIDATION_LIMITS.quantidade.min).toBe('string');
      expect(typeof VALIDATION_LIMITS.quantidade.max).toBe('string');
      expect(typeof VALIDATION_LIMITS.valorTotal.min).toBe('string');
      expect(typeof VALIDATION_LIMITS.valorTotal.max).toBe('string');
    });

    it('has correct min values for form validation', () => {
      expect(VALIDATION_LIMITS.quantidade.min).toBe('1');
      expect(VALIDATION_LIMITS.valorTotal.min).toBe('0.01');
    });

    it('has max values that are greater than min values', () => {
      expect(parseFloat(VALIDATION_LIMITS.quantidade.max)).toBeGreaterThan(parseFloat(VALIDATION_LIMITS.quantidade.min));
      expect(parseFloat(VALIDATION_LIMITS.valorTotal.max)).toBeGreaterThan(parseFloat(VALIDATION_LIMITS.valorTotal.min));
    });
  });
});
