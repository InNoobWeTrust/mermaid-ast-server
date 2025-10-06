interface Metrics {
  requests: {
    total: number;
    success: number;
    errors: number;
  };
  cache: {
    hits: number;
    misses: number;
  };
  uptime: number;
}

class MetricsCollector {
  private startTime = Date.now();
  private metrics: Metrics = {
    requests: { total: 0, success: 0, errors: 0 },
    cache: { hits: 0, misses: 0 },
    uptime: 0
  };

  incrementRequest() {
    this.metrics.requests.total++;
  }

  incrementSuccess() {
    this.metrics.requests.success++;
  }

  incrementError() {
    this.metrics.requests.errors++;
  }

  incrementCacheHit() {
    this.metrics.cache.hits++;
  }

  incrementCacheMiss() {
    this.metrics.cache.misses++;
  }

  getMetrics(): Metrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    };
  }
}

export const metrics = new MetricsCollector();
