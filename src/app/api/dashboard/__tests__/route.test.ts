/**
 * @jest-environment node
 */

import { GET } from '../route';
import { POST as POST_POSITION } from '../../positions/route';
import { NextRequest } from 'next/server';

describe('Dashboard API Route', () => {
  describe('Data freshness', () => {
    it('should return updated position count after creating a new position', async () => {
      // Get initial dashboard data
      const initialResponse = await GET();
      expect(initialResponse.status).toBe(200);
      const initialData = await initialResponse.json();
      const initialPositionCount = initialData.summary.positionCount;

      // Create a unique ticker to avoid conflicts (must be 4-6 chars)
      const uniqueTicker = `T${Date.now().toString().slice(-5)}`;
      
      // Create a new position
      const createRequest = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: uniqueTicker,
          nome: 'Test Position for Dashboard',
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

      const createResponse = await POST_POSITION(createRequest);
      if (createResponse.status !== 201) {
        const errorData = await createResponse.json();
        console.log('Create position error:', errorData);
      }
      expect(createResponse.status).toBe(201);

      // Get dashboard data again - should include the new position
      const updatedResponse = await GET();
      expect(updatedResponse.status).toBe(200);
      const updatedData = await updatedResponse.json();
      
      // The position count should have increased by 1
      expect(updatedData.summary.positionCount).toBe(initialPositionCount + 1);
    });

    it('should return updated recent operations after creating an operation', async () => {
      // Get initial dashboard data
      const initialResponse = await GET();
      expect(initialResponse.status).toBe(200);
      const initialData = await initialResponse.json();

      // Create a unique ticker (must be 4-6 chars)
      const uniqueTicker = `D${Date.now().toString().slice(-5)}`;
      
      // Create a new position (which also creates an operation)
      // Use today's date to ensure it appears in recent operations
      const today = new Date().toISOString().split('T')[0];
      const createRequest = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        body: JSON.stringify({
          ticker: uniqueTicker,
          nome: 'Test Position for Operations',
          classe_ativo: 'fii',
          operation: {
            position_id: 0,
            tipo: 'compra',
            data: today,
            quantidade: 50,
            valor_total: 5000.0,
          },
        }),
      });

      const createResponse = await POST_POSITION(createRequest);
      if (createResponse.status !== 201) {
        const errorData = await createResponse.json();
        console.log('Create position error:', errorData);
      }
      expect(createResponse.status).toBe(201);

      // Get dashboard data again
      const updatedResponse = await GET();
      expect(updatedResponse.status).toBe(200);
      const updatedData = await updatedResponse.json();
      
      // The recent operations should include the new operation
      // Check that the new ticker appears in recent operations
      const hasNewOperation = updatedData.recentOperations.some(
        (op: { ticker: string }) => op.ticker === uniqueTicker
      );
      expect(hasNewOperation).toBe(true);
    });
  });
});
