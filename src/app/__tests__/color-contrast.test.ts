/**
 * Color Contrast Accessibility Tests
 * 
 * WCAG AA requires 4.5:1 contrast ratio for normal text
 * These tests ensure our design system colors meet this requirement
 */

import {
  blendColors,
  contrastRatio,
  hexToRgb,
  relativeLuminance,
  WCAG,
} from '@/lib/color-contrast';
import { DESIGN_SYSTEM_COLORS, DISABLED_OPACITY } from '@/lib/constants';

describe('Color Contrast Accessibility - WCAG AA Compliance', () => {
  describe('Color Conversion Utilities', () => {
    it('hexToRgb should convert valid hex colors', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#0F172A')).toEqual({ r: 15, g: 23, b: 42 });
      expect(hexToRgb('0F172A')).toEqual({ r: 15, g: 23, b: 42 });
    });

    it('hexToRgb should return null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGG')).toBeNull();
      expect(hexToRgb('#FFF')).toBeNull(); // Only supports 6-char hex
    });

    it('relativeLuminance should calculate correctly for black and white', () => {
      expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
      expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1);
    });
  });

  describe('Button States', () => {
    it('primary button should have sufficient contrast (normal state)', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.white,
        DESIGN_SYSTEM_COLORS.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('primary button should have sufficient contrast (hover state)', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.white,
        DESIGN_SYSTEM_COLORS.blue600
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('secondary button should have sufficient contrast', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.textPrimary,
        DESIGN_SYSTEM_COLORS.surface
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('ghost button should have sufficient contrast', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.textPrimary,
        DESIGN_SYSTEM_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('disabled primary button should have sufficient contrast', () => {
      // When disabled state uses opacity, colors blend with background
      const effectiveFg = blendColors(
        DESIGN_SYSTEM_COLORS.white,
        DESIGN_SYSTEM_COLORS.background,
        DISABLED_OPACITY
      );
      const effectiveBg = blendColors(
        DESIGN_SYSTEM_COLORS.primary,
        DESIGN_SYSTEM_COLORS.background,
        DISABLED_OPACITY
      );
      const ratio = contrastRatio(effectiveFg, effectiveBg);
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });
  });

  describe('Text Colors', () => {
    it('text-primary on background should have sufficient contrast', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.textPrimary,
        DESIGN_SYSTEM_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('text-primary on surface should have sufficient contrast', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.textPrimary,
        DESIGN_SYSTEM_COLORS.surface
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('text-secondary on background should have sufficient contrast', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.textSecondary,
        DESIGN_SYSTEM_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('text-secondary on surface should have sufficient contrast', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.textSecondary,
        DESIGN_SYSTEM_COLORS.surface
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });
  });

  describe('Legacy Issue Verification', () => {
    it('documents the old primary color failing WCAG AA', () => {
      // This test documents the issue that was fixed
      // The old primary color (#3B82F6) with white text fails WCAG AA
      const oldPrimary = '#3B82F6';
      const ratio = contrastRatio(DESIGN_SYSTEM_COLORS.white, oldPrimary);
      expect(ratio).toBeLessThan(WCAG.AA_NORMAL);
      expect(ratio).toBeCloseTo(3.68, 1);
    });

    it('verifies current primary color passes WCAG AA', () => {
      const ratio = contrastRatio(
        DESIGN_SYSTEM_COLORS.white,
        DESIGN_SYSTEM_COLORS.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
      expect(ratio).toBeCloseTo(6.70, 1);
    });
  });
});
