/**
 * Sliding window rate limiter middleware.
 * Limits requests per IP using a token bucket algorithm.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimiterOptions {
  maxTokens: number;
  refillRate: number; // tokens per second
  windowMs: number;
}

const DEFAULT_OPTIONS: RateLimiterOptions = {
  maxTokens: 100,
  refillRate: 10,
  windowMs: 60_000,
};

export function createRateLimiter(opts: Partial<RateLimiterOptions> = {}) {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  return function rateLimiter(ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let entry = store.get(ip);

    if (!entry) {
      entry = { tokens: options.maxTokens, lastRefill: now };
      store.set(ip, entry);
    }

    // Refill tokens based on elapsed time
    const elapsed = (now - entry.lastRefill) / 1000;
    entry.tokens = Math.min(options.maxTokens, entry.tokens + elapsed * options.refillRate);
    entry.lastRefill = now;

    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      return { allowed: true, remaining: Math.floor(entry.tokens) };
    }

    const retryAfter = Math.ceil((1 - entry.tokens) / options.refillRate);
    return { allowed: false, remaining: 0, retryAfter };
  };
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 300_000;
  for (const [ip, entry] of store) {
    if (entry.lastRefill < cutoff) {
      store.delete(ip);
    }
  }
}, 300_000);

export { store as _testStore };
