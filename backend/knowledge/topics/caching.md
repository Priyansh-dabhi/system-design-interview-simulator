# Caching

Caching stores frequently accessed data in memory to reduce latency and database load.

## Cache Eviction
LRU removes the least recently used items. LFU removes the items accessed least frequently. FIFO removes items in the order they were added.

## Cache Invalidation
Cache-aside pattern loads data from DB when cache miss occurs. Write-through writes data into the cache and the corresponding database at the same time. Write-behind (Write-back) writes data to the cache alone immediately and writes to the DB after a delay.

## Distributed Cache
Redis and Memcached are commonly used distributed caching systems. They allow caching large amounts of data across multiple nodes.
