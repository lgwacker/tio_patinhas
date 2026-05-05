/**
 * Tests for color contrast calculation utilities
 */

import {
  blendColors,
  contrastRatio,
  hexToRgb,
  relativeLuminance,
  WCAG,
} from '../color-contrast';

describe('color-contrast utilities', () => {
  describe('hexToRgb', () => {
    it('converts 6-character hex with # prefix', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#0F172A')).toEqual({ r: 15, g: 23, b: 42 });
      expect(hexToRgb('#FF5733')).toEqual({ r: 255, g: 87, b: 51 });
    });

    it('converts 6-character hex without # prefix', () => {
      expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('0F172A')).toEqual({ r: 15, g: 23, b: 42 });
    });

    it('handles lowercase hex', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#0f172a')).toEqual({ r: 15, g: 23, b: 42 });
    });

    it('returns null for invalid hex strings', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGGGGG')).toBeNull();
      expect(hexToRgb('#FFF')).toBeNull(); // 3-char hex not supported
      expect(hexToRgb('#FFFFFFFF')).toBeNull(); // 8-char hex not supported
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('relativeLuminance', () => {
    it('returns 0 for black', () => {
      expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    });

    it('returns 1 for white', () => {
      expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1);
    });

    it('calculates correct luminance for mid-gray', () => {
      const gray = { r: 128, g: 128, b: 128 };
      const luminance = relativeLuminance(gray);
      // Gray at 128 should have luminance around 0.215
      expect(luminance).toBeGreaterThan(0.2);
      expect(luminance).toBeLessThan(0.23);
    });

    it('calculates correct luminance for pure colors', () => {
      // Pure red
      const red = { r: 255, g: 0, b: 0 };
      expect(relativeLuminance(red)).toBeGreaterThan(0.2);
      expect(relativeLuminance(red)).toBeLessThan(0.25);

      // Pure green (perceived as brightest)
      const green = { r: 0, g: 255, b: 0 };
      expect(relativeLuminance(green)).toBeGreaterThan(0.7);

      // Pure blue (perceived as darkest)
      const blue = { r: 0, g: 0, b: 255 };
      expect(relativeLuminance(blue)).toBeLessThan(0.1);
    });
  });

  describe('contrastRatio', () => {
    it('returns 21:1 for black vs white', () => {
      expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
      expect(contrastRatio('#FFFFFF', '#000000')).toBe(21);
    });

    it('returns 1:1 for same colors', () => {
      expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
      expect(contrastRatio('#0F172A', '#0F172A')).toBe(1);
    });

    it('returns 0 for invalid hex colors', () => {
      expect(contrastRatio('invalid', '#FFFFFF')).toBe(0);
      expect(contrastRatio('#FFFFFF', 'invalid')).toBe(0);
    });

    it('calculates correct ratio for design system colors', () => {
      // Primary (#1D4ED8) vs White (#FFFFFF) should be ~6.7:1
      const ratio = contrastRatio('#1D4ED8', '#FFFFFF');
      expect(ratio).toBeGreaterThan(6);
      expect(ratio).toBeLessThan(7.5);
    });
  });

  describe('blendColors', () => {
    it('returns foreground at 100% opacity', () => {
      expect(blendColors('#FF5733', '#000000', 1)).toBe('#ff5733');
      expect(blendColors('#FFFFFF', '#000000', 1)).toBe('#ffffff');
    });

    it('returns background at 0% opacity', () => {
      expect(blendColors('#FF5733', '#000000', 0)).toBe('#000000');
      expect(blendColors('#FFFFFF', '#0F172A', 0)).toBe('#0f172a');
    });

    it('correctly blends at 50% opacity', () => {
      // White (255,255,255) at 50% over Black (0,0,0) = Gray (128,128,128)
      const blended = blendColors('#FFFFFF', '#000000', 0.5);
      expect(blended).toBe('#808080');
    });

    it('returns foreground if colors are invalid', () => {
      expect(blendColors('invalid', '#000000', 0.5)).toBe('invalid');
      expect(blendColors('#FFFFFF', 'invalid', 0.5)).toBe('#FFFFFF');
    });

    it('handles the disabled button opacity case', () => {
      // Primary button disabled: #1D4ED8 over #0F172A at 70% opacity
      const blended = blendColors('#1D4ED8', '#0F172A', 0.7);
      // Should produce a valid hex color
      expect(blended).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('WCAG constants', () => {
    it('has correct AA normal text threshold', () => {
      expect(WCAG.AA_NORMAL).toBe(4.5);
    });

    it('has correct AA large text threshold', () => {
      expect(WCAG.AA_LARGE).toBe(3.0);
    });

    it('has correct AAA normal text threshold', () => {
      expect(WCAG.AAA_NORMAL).toBe(7.0);
    });

    it('has correct AAA large text threshold', () => {
      expect(WCAG.AAA_LARGE).toBe(4.5);
    });
  });
});
