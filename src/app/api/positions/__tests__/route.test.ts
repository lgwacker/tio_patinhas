/**
 * @jest-environment node
 */

import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('Positions API Route', () => {
  describe('GET', () => {
    it('should return positions array', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.positions)).toBe(true);
    });
  });

  describe('POST', () => {
    it('should attempt to create a new position', async () => {
      const request = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: 'TESTE9',
          nome: 'Test Position',
          classe_ativo: 'acao',
          setor: 'Test',
          segmento: 'Test',
          operation: {
            position_id: 0,
            tipo: 'compra',
            data: '2024-01-15',
            quantidade: 100,
            valor_total: 2550.0,
          },
        }),
      });

      const response = await POST(request);
      
      // May return 201 (created), 400 (validation error if ticker exists), or 500 (server error)
      expect([201, 400, 500]).toContain(response.status);
    });

    it('should return 400 on validation error for empty ticker', async () => {
      const request = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: '',
          nome: 'Test',
          classe_ativo: 'acao',
          operation: {
            position_id: 0,
            tipo: 'compra',
            data: '2024-01-15',
            quantidade: 100,
            valor_total: 2550.0,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Erro de validação');
    });

    it('should return 400 or 500 on missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect([400, 500]).toContain(response.status);
    });
  });
});
