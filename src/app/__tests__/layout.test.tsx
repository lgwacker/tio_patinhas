import { metadata } from '../layout';
import fs from 'fs';
import path from 'path';

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
    const iconPath = path.join(process.cwd(), 'public', 'icon-192x192.png');
    expect(fs.existsSync(iconPath)).toBe(true);

    const buffer = fs.readFileSync(iconPath);
    // Check PNG magic number (first 8 bytes: 89 50 4E 47 0D 0A 1A 0A)
    const pngMagicNumber = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(buffer.slice(0, 8)).toEqual(pngMagicNumber);

    // Verify file size is reasonable (> 1KB, not an empty placeholder)
    expect(buffer.length).toBeGreaterThan(1000);

    // Check IHDR chunk dimensions at offset 16-24 (big-endian)
    // Width at offset 16-19, Height at offset 20-23
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    expect(width).toBe(192);
    expect(height).toBe(192);
  });

  it('should have valid 512x512 PNG icon', () => {
    const iconPath = path.join(process.cwd(), 'public', 'icon-512x512.png');
    expect(fs.existsSync(iconPath)).toBe(true);

    const buffer = fs.readFileSync(iconPath);
    // Check PNG magic number
    const pngMagicNumber = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(buffer.slice(0, 8)).toEqual(pngMagicNumber);

    // Verify file size is reasonable (> 1KB)
    expect(buffer.length).toBeGreaterThan(1000);

    // Check IHDR chunk dimensions
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    expect(width).toBe(512);
    expect(height).toBe(512);
  });
});
