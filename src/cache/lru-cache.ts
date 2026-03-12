/**
 * LRU Cache implementation with max size constraint.
 * 
 * Previous implementation had no upper bound on cache entries,
 * causing memory to grow unbounded under high cardinality keys.
 * 
 * This fix adds:
 * - Maximum entry limit (default 10,000)
 * - LRU eviction when limit is reached
 * - Memory usage tracking
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
}

export class LRUCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  private readonly defaultTTL: number;
  private totalSize = 0;

  constructor(maxEntries = 10_000, defaultTTL = 300_000) {
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    // Remove existing entry first
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Evict LRU entries if at capacity
    while (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.delete(oldestKey);
      }
    }

    const size = this.estimateSize(value);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
      size,
    });
    this.totalSize += size;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  get size(): number {
    return this.cache.size;
  }

  get memoryUsage(): number {
    return this.totalSize;
  }

  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // rough byte estimate
    } catch {
      return 1024; // fallback for non-serializable values
    }
  }
}
