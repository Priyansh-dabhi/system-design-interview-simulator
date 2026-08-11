# Caching

Caching is the practice of storing copies of frequently accessed data in a high-speed data store (the cache) so future requests can be served faster than reading from the primary data source.

## Why Caching Matters
- **Reduces latency**: Memory reads are 100x faster than disk reads, 1000x faster than network calls.
- **Reduces backend load**: Without caching, every request hits the database. A cache absorbs traffic spikes.
- **Improves throughput**: A cache hit means the database does less work, so it can serve more requests.

## Cache Placement
- **Client-side cache**: Browser localStorage, HTTP cache headers (Cache-Control, ETag). Good for static assets.
- **CDN cache**: Edge servers cache content geographically close to users. Ideal for static/semi-static content.
- **Application-level cache**: In-process cache (e.g., Guava Cache in JVM). Zero network overhead but not shared across instances.
- **Distributed cache**: Shared across all application instances (e.g., Redis, Memcached). The most common pattern in scalable systems.

## Cache Eviction Policies
When the cache is full, old entries must be removed to make space:
- **LRU (Least Recently Used)**: Evicts the item that hasn't been accessed the longest. Best for general-purpose use cases. Used by Redis by default.
- **LFU (Least Frequently Used)**: Evicts the item accessed the fewest times. Better for skewed access patterns (some items are always hot).
- **FIFO (First In, First Out)**: Evicts the oldest item regardless of access frequency. Simple but rarely optimal.
- **Random Replacement**: Evicts a random item. Surprisingly competitive with LRU in some workloads with lower overhead.
- **TTL (Time-to-Live)**: Items expire after a set duration. Not an eviction policy per se, but ensures data freshness.

## Cache Write Policies
These determine how writes are handled relative to the cache and the backing store:
- **Cache-aside (Lazy Loading)**: Application reads from cache; on a miss, reads from DB and populates cache. Writes go directly to DB, invalidating the cache entry. Simple and widely used. Risk: "thundering herd" on cold start.
- **Write-through**: Every write goes to both cache and DB simultaneously. Cache is always warm, but writes are slower (two writes per request).
- **Write-behind (Write-back)**: Writes go to the cache immediately, and the cache asynchronously flushes to DB later. Very fast writes, but risk of data loss if cache crashes before flushing.
- **Read-through**: Cache sits in front of DB; on a miss, the cache itself (not the app) fetches from DB. Clean separation of concerns.

## Cache Invalidation
"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton.
- **TTL-based expiry**: Simple, but data can be stale until expiry.
- **Event-driven invalidation**: Publish an event on write (e.g., via Kafka); cache consumers invalidate their entries. More complex but near-real-time consistency.
- **Write-through invalidation**: Update cache on every write. Ensures consistency but increases write latency.
- **Version-based keys**: Append a version number to cache keys (`user:123:v5`). Invalidate by incrementing the version. Stale entries are left to expire via TTL.

## Distributed Cache
- **Redis**: In-memory, supports strings, hashes, lists, sorted sets, pub/sub, Lua scripting, persistence (RDB/AOF), and clustering. The industry standard.
- **Memcached**: Simpler, multi-threaded, pure key-value. Slightly faster for simple workloads but lacks Redis's rich features and persistence.

## Common Problems
- **Cache stampede (Thundering Herd)**: A popular cache entry expires; thousands of requests simultaneously hit the DB to repopulate it. Mitigation: use a mutex/lock when repopulating, or "probabilistic early expiration".
- **Cache penetration**: Requests for keys that don't exist in cache or DB (e.g., non-existent user IDs), bypassing the cache entirely. Mitigation: cache negative results (store a `null` sentinel with a short TTL), or use a Bloom filter to reject requests for non-existent keys.
- **Cache avalanche**: Many cache entries expire at the same time, flooding the DB. Mitigation: add jitter (randomness) to TTL values.
- **Hot key problem**: A single cache key receives disproportionate traffic (e.g., a celebrity's profile). Mitigation: replicate the hot key across multiple cache nodes, or use local in-process caches on each app server.

## Real-World Examples
- **Twitter**: Uses Redis to cache each user's timeline (~800 tweet IDs in a sorted set). On write (new tweet), fan-out-on-write populates the caches of all followers.
- **Netflix**: Uses EVCache (a distributed Memcached) to cache metadata for millions of titles across multiple AWS regions.
- **Facebook**: Memcached at billions of requests/second. They invented "lease-based" invalidation to solve the thundering herd problem at scale.

## Common Candidate Mistakes
- Saying "just add a cache" without specifying the write policy or invalidation strategy.
- Not considering cache stampede when discussing popular items.
- Assuming a cache provides 100% consistency with the database.
- Ignoring the memory cost of caching large objects.

## Follow-Up Interview Probes
- "What happens when a cache node goes down in your design?"
- "How would you handle the cache stampede problem for a flash sale with 1M concurrent users?"
- "When would you NOT use caching in a system?"
- "Your data changes frequently — how do you ensure cache consistency without tanking write performance?"
- "How does Twitter's write-on-fan-out strategy differ from read-on-miss? When would each fail?"
