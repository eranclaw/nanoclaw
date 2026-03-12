import { describe, it, expect } from 'vitest';
import { LRUCache } from '../lru-cache';

describe('LRUCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUCache();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    const cache = new LRUCache();
    expect(cache.get('missing')).toBeUndefined();
  });

  it('evicts expired entries', () => {
    const cache = new LRUCache(100, 1); // 1ms TTL
    cache.set('key1', 'value1');
    // Wait for expiry
    const start = Date.now();
    while (Date.now() - start < 5) {} // busy wait 5ms
    expect(cache.get('key1')).toBeUndefined();
  });

  it('evicts LRU entries when at capacity', () => {
    const cache = new LRUCache(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('d')).toBe(4);
  });

  it('refreshes LRU order on access', () => {
    const cache = new LRUCache(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // refresh 'a'
    cache.set('d', 4); // should evict 'b', not 'a'
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('tracks memory usage', () => {
    const cache = new LRUCache();
    cache.set('key', 'hello world');
    expect(cache.memoryUsage).toBeGreaterThan(0);
  });
});
