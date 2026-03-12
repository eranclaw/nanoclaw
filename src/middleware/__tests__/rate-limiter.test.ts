import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimiter, _testStore } from '../rate-limiter';

describe('rate-limiter', () => {
  beforeEach(() => {
    _testStore.clear();
  });

  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({ maxTokens: 5, refillRate: 1 });
    for (let i = 0; i < 5; i++) {
      const result = limiter('127.0.0.1');
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks requests over the limit', () => {
    const limiter = createRateLimiter({ maxTokens: 2, refillRate: 0.001 });
    limiter('127.0.0.1');
    limiter('127.0.0.1');
    const result = limiter('127.0.0.1');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('tracks different IPs independently', () => {
    const limiter = createRateLimiter({ maxTokens: 1, refillRate: 0.001 });
    expect(limiter('1.1.1.1').allowed).toBe(true);
    expect(limiter('2.2.2.2').allowed).toBe(true);
    expect(limiter('1.1.1.1').allowed).toBe(false);
  });

  it('returns remaining token count', () => {
    const limiter = createRateLimiter({ maxTokens: 10, refillRate: 1 });
    const result = limiter('127.0.0.1');
    expect(result.remaining).toBe(9);
  });
});
