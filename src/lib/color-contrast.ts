/**
 * Color Contrast Calculation Utilities
 * 
 * Implements WCAG 2.1 contrast ratio calculations.
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts a hex color string to RGB values.
 * Supports 6-character hex with optional leading #.
 * Returns null for invalid hex strings.
 */
export function hexToRgb(hex: string): RGB | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/**
 * Converts a single sRGB component to linear light value.
 * Uses the piecewise formula from WCAG 2.1.
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function srgbToLinear(component: number): number {
  const normalized = component / 255;
  // WCAG formula: if c <= 0.03928 then c/12.92 else ((c+0.055)/1.055)^2.4
  return normalized <= 0.03928 
    ? normalized / 12.92 
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of an RGB color.
 * This is the Y in the XYZ color space, normalized to [0, 1].
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(rgb: RGB): number {
  const rLinear = srgbToLinear(rgb.r);
  const gLinear = srgbToLinear(rgb.g);
  const bLinear = srgbToLinear(rgb.b);
  
  // WCAG coefficients for RGB to luminance conversion
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculates the contrast ratio between two colors.
 * Returns the WCAG contrast ratio: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter and L2 is the darker luminance.
 * 
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text.
 * 
 * @returns The contrast ratio (1:1 to 21:1), or 0 if colors are invalid
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) {
    return 0;
  }
  
  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Blends a foreground color with a background color using alpha compositing.
 * Simulates how a color appears when rendered with opacity over a background.
 * 
 * @param fg - The foreground color (hex)
 * @param bg - The background color (hex)
 * @param opacity - The opacity of the foreground (0-1)
 * @returns The resulting blended color as hex
 */
export function blendColors(fg: string, bg: string, opacity: number): string {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  
  if (!fgRgb || !bgRgb) {
    return fg;
  }
  
  // Alpha compositing: result = fg * opacity + bg * (1 - opacity)
  const r = Math.round(fgRgb.r * opacity + bgRgb.r * (1 - opacity));
  const g = Math.round(fgRgb.g * opacity + bgRgb.g * (1 - opacity));
  const b = Math.round(fgRgb.b * opacity + bgRgb.b * (1 - opacity));
  
  // Convert to lowercase hex with zero-padding
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * WCAG 2.1 contrast ratio requirements.
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
export const WCAG = {
  /** Normal text requires 4.5:1 for AA compliance */
  AA_NORMAL: 4.5,
  /** Large text (18pt+ or 14pt+ bold) requires 3:1 for AA compliance */
  AA_LARGE: 3.0,
  /** Normal text requires 7:1 for AAA compliance */
  AAA_NORMAL: 7.0,
  /** Large text requires 4.5:1 for AAA compliance */
  AAA_LARGE: 4.5,
} as const;
