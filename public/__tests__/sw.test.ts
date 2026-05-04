/**
 * Service Worker Configuration Tests
 * 
 * Validates that the service worker is properly configured for offline navigation.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Service Worker Configuration', () => {
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  let swCode: string;

  beforeAll(() => {
    swCode = fs.readFileSync(swPath, 'utf8');
  });

  describe('STATIC_ASSETS', () => {
    it('should include the root route', () => {
      expect(swCode).toContain("'/'");
    });

    it('should include /carteira route for offline access', () => {
      expect(swCode).toContain("'/carteira'");
    });

    it('should include /historico route for offline access', () => {
      expect(swCode).toContain("'/historico'");
    });

    it('should include /nova-posicao route for offline access', () => {
      expect(swCode).toContain("'/nova-posicao'");
    });

    it('should include /configuracoes route for offline access', () => {
      expect(swCode).toContain("'/configuracoes'");
    });

    it('should include required static files', () => {
      expect(swCode).toContain("'/manifest.json'");
      expect(swCode).toContain("'/icon-192x192.png'");
      expect(swCode).toContain("'/icon-512x512.png'");
      expect(swCode).toContain("'/offline.html'");
    });

    it('should have updated CACHE_NAME for cache busting', () => {
      // Cache name should be updated when STATIC_ASSETS changes
      expect(swCode).toMatch(/CACHE_NAME = 'tio-patinhas-v\d+'/);
    });
  });

  describe('Runtime caching for dynamic routes', () => {
    it('should cache HTML navigation requests at runtime', () => {
      // The service worker should cache successful navigation requests
      // This is needed for dynamic routes like /posicao/[id]
      expect(swCode).toContain("event.request.mode === 'navigate'");
      expect(swCode).toContain("cache.put(event.request, response.clone())");
    });

    it('should handle offline navigation by returning offline.html', () => {
      expect(swCode).toContain("caches.match('/offline.html')");
    });
  });

  describe('Cache strategy', () => {
    it('should skip non-GET requests', () => {
      expect(swCode).toContain("event.request.method !== 'GET'");
    });

    it('should skip API requests', () => {
      expect(swCode).toContain("/api/");
    });

    it('should cache static assets with proper extensions', () => {
      expect(swCode).toMatch(/shouldCache\(event\.request\.url\)/);
      // The regex in sw.js has escaped backslash, so we need to check for the actual pattern
      expect(swCode).toMatch(/\.\(js\|css\|png\|jpg\|jpeg\|svg\|ico\|woff\|woff2\|ttf\|eot\)\$/);
    });
  });
});
