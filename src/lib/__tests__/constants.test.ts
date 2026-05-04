import {
  VALID_ASSET_CLASSES,
  ASSET_CLASSES,
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
});
