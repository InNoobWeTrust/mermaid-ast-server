import { createHash } from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly enabled: boolean;

  constructor(ttlMs = 300000, maxSize = 1000) { // 5min TTL, 1000 entries max
    this.ttl = ttlMs;
    this.maxSize = maxSize;
    this.enabled = process.env.ENABLE_CACHE !== 'false';
  }

  private generateKey(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  get(key: string): any | null {
    if (!this.enabled) return null;
    
    const entry = this.cache.get(this.generateKey(key));
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(this.generateKey(key));
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any): void {
    if (!this.enabled) return;
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(this.generateKey(key), {
      data,
      timestamp: Date.now()
    });
  }

  getStats() {
    return {
      enabled: this.enabled,
      size: this.enabled ? this.cache.size : 0,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

export const parseCache = new MemoryCache();
