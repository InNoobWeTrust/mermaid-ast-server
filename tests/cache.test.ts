import { test, describe, expect } from 'vitest';

describe('Cache toggle functionality', () => {
  test('cache should report enabled status in stats', async () => {
    // This test verifies the cache stats include enabled status
    // The actual toggle behavior is tested via integration tests
    const { parseCache } = await import('../src/lib/cache');
    const stats = parseCache.getStats();
    expect(stats).toHaveProperty('enabled');
    expect(typeof stats.enabled).toBe('boolean');
  });
});
