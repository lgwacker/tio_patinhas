import { metadata } from '../layout';

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
});
