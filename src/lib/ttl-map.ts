/**
 * Lightweight Map-based cache with max-size eviction and per-entry TTL.
 * Drop-in replacement for the subset of lru-cache used in this project.
 */
export class TtlMap<K, V> {
  private readonly map = new Map<K, { value: V; expiresAt: number }>();
  private readonly max: number;
  private readonly ttl: number;
  private readonly updateAgeOnGet: boolean;

  constructor(opts: { max: number; ttl: number; updateAgeOnGet?: boolean }) {
    this.max = opts.max;
    this.ttl = opts.ttl;
    this.updateAgeOnGet = opts.updateAgeOnGet ?? false;
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    if (this.updateAgeOnGet) {
      entry.expiresAt = Date.now() + this.ttl;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    // Delete first so the re-insert moves it to the end (newest)
    this.map.delete(key);
    if (this.map.size >= this.max) {
      // Evict the oldest entry (first key in insertion order)
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}
