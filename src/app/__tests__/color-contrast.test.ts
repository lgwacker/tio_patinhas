/**
 * Color Contrast Accessibility Tests
 * 
 * WCAG AA requires 4.5:1 contrast ratio for normal text
 * These tests ensure our design system colors meet this requirement
 */

// Color contrast calculation utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function blendColors(fg: string, bg: string, opacity: number): string {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return fg;
  
  const r = Math.round(fgRgb.r * opacity + bgRgb.r * (1 - opacity));
  const g = Math.round(fgRgb.g * opacity + bgRgb.g * (1 - opacity));
  const b = Math.round(fgRgb.b * opacity + bgRgb.b * (1 - opacity));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Design System Colors (from tailwind.config.ts)
const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#1D4ED8',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  blue600: '#2563EB', // Tailwind blue-600 for hover
  white: '#FFFFFF',
};

describe('Color Contrast Accessibility - WCAG AA Compliance', () => {
  const MIN_CONTRAST_RATIO = 4.5; // WCAG AA for normal text

  describe('Button States', () => {
    it('primary button should have sufficient contrast (normal state)', () => {
      const ratio = contrastRatio(COLORS.white, COLORS.primary);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('primary button should have sufficient contrast (hover state)', () => {
      const ratio = contrastRatio(COLORS.white, COLORS.blue600);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('secondary button should have sufficient contrast', () => {
      const ratio = contrastRatio(COLORS.textPrimary, COLORS.surface);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('ghost button should have sufficient contrast', () => {
      const ratio = contrastRatio(COLORS.textPrimary, COLORS.background);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('disabled primary button should have sufficient contrast (with 70% opacity)', () => {
      // When disabled state uses 70% opacity, colors blend with background
      const effectiveFg = blendColors(COLORS.white, COLORS.background, 0.7);
      const effectiveBg = blendColors(COLORS.primary, COLORS.background, 0.7);
      const ratio = contrastRatio(effectiveFg, effectiveBg);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });
  });

  describe('Text Colors', () => {
    it('text-primary on background should have sufficient contrast', () => {
      const ratio = contrastRatio(COLORS.textPrimary, COLORS.background);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('text-primary on surface should have sufficient contrast', () => {
      const ratio = contrastRatio(COLORS.textPrimary, COLORS.surface);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('text-secondary on background should have sufficient contrast', () => {
      const ratio = contrastRatio(COLORS.textSecondary, COLORS.background);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });

    it('text-secondary on surface should have sufficient contrast', () => {
      const ratio = contrastRatio(COLORS.textSecondary, COLORS.surface);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
    });
  });

  describe('Legacy Issue Verification', () => {
    it('should document that old primary color (#3B82F6) fails WCAG AA', () => {
      // This test documents the issue that was fixed
      // The old primary color with white text fails WCAG AA
      const oldPrimary = '#3B82F6';
      const ratio = contrastRatio(COLORS.white, oldPrimary);
      expect(ratio).toBeLessThan(MIN_CONTRAST_RATIO);
      expect(ratio).toBeCloseTo(3.68, 1); // Approximately 3.68:1
    });

    it('current primary color should pass WCAG AA', () => {
      const ratio = contrastRatio(COLORS.white, COLORS.primary);
      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
      expect(ratio).toBeCloseTo(6.70, 1); // Approximately 6.70:1
    });
  });
});
