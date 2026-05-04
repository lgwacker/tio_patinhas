/**
 * @jest-environment node
 */

import { GET } from '../route';

describe('Positions With Quotes API Route', () => {
  // Note: Since the route creates its own database instance on each request,
  // and uses a file-based database by default, tests may see data from other tests.
  // For true isolation, set DATABASE_PATH=:memory: before importing the route.

  it('should return positions array', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.positions)).toBe(true);
  });

  it('should return 200 status', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
