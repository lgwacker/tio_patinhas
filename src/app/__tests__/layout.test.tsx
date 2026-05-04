import { metadata } from '../layout';
import fs from 'fs';
import path from 'path';

const PNG_MAGIC_NUMBER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MIN_ICON_SIZE_BYTES = 1000;

function validatePngIcon(filename: string, expectedSize: number): void {
  const iconPath = path.join(process.cwd(), 'public', filename);
  expect(fs.existsSync(iconPath)).toBe(true);

  const buffer = fs.readFileSync(iconPath);
  expect(buffer.slice(0, 8)).toEqual(PNG_MAGIC_NUMBER);
  expect(buffer.length).toBeGreaterThan(MIN_ICON_SIZE_BYTES);

  // IHDR chunk dimensions: width at offset 16-19, height at offset 20-23
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  expect(width).toBe(expectedSize);
  expect(height).toBe(expectedSize);
}

describe('Root Layout Metadata', () => {
  it('should have PWA manifest configured', () => {
    expect(metadata).toHaveProperty('manifest', '/manifest.json');
  });

  it('should have PWA icons configured', () => {
    expect(metadata).toHaveProperty('icons');
    expect(metadata.icons).toHaveProperty('icon', '/icon-192x192.png');
    expect(metadata.icons).toHaveProperty('apple', '/icon-192x192.png');
  });

  it('should have correct title and description', () => {
    expect(metadata.title).toBe('Tio Patinhas - Gestão de Investimentos');
    expect(metadata.description).toContain('Sistema pessoal de gestão de investimentos');
  });

  it('should have valid 192x192 PNG icon', () => {
    validatePngIcon('icon-192x192.png', 192);
  });

  it('should have valid 512x512 PNG icon', () => {
    validatePngIcon('icon-512x512.png', 512);
  });
});
