# Consistent Hashing

Consistent hashing is a distributed hashing scheme that solves the massive data reshuffling problem that occurs when adding or removing servers in a horizontally scaled system (like a distributed cache or database).

## The Problem with Simple Hashing
In a traditional distributed cache, you distribute data across `N` servers using a simple modulo hash:
`server_index = hash(key) % N`

**The fatal flaw**: If a server crashes or you add a new server, `N` changes. Suddenly, `hash(key) % (N+1)` yields a completely different index for almost every single key.
Result: Nearly 100% of cache requests become misses. The system experiences a massive "cache avalanche" and the backing database gets crushed under the sudden load.

## How Consistent Hashing Works
Instead of using modulo arithmetic, consistent hashing maps both the data keys and the servers to a conceptual "Hash Ring".

1. **The Hash Ring**: Imagine a circle where angles represent hash values from `0` to `2^32 - 1`.
2. **Hash the Servers**: Apply a hash function (like SHA-1) to the server's IP or ID. Place the server at that specific point on the ring.
3. **Hash the Keys**: Apply the same hash function to the data key. Place the key on the ring.
4. **Locate the Data**: To find which server owns a key, start at the key's position on the ring and move clockwise until you hit a server. That server owns the key.

## The Benefit: Minimal Disruption
- **Adding a Server**: If you add Server D between Server A and Server B, Server D only takes over the keys that fall between A and D. Keys between D and B, and everywhere else on the ring, are untouched.
- **Removing a Server**: If Server C crashes, the keys it owned simply fall to the next server clockwise on the ring. All other keys remain exactly where they were.
- **Result**: Instead of reshuffling 100% of keys, only `k/N` keys are reshuffled (where `k` is total keys, `N` is total servers).

## The Non-Uniformity Problem & Virtual Nodes
**Problem**: Hashing a few servers onto a massive ring often results in uneven spacing. One server might end up owning 50% of the ring, becoming a hotspot.
**Solution: Virtual Nodes (VNodes)**.
Instead of hashing Server A once, we hash it 100 times using different identifiers (e.g., `ServerA_1`, `ServerA_2`, ... `ServerA_100`).
- These 100 virtual nodes are scattered randomly around the ring.
- Doing this for all servers ensures a highly uniform distribution of keys.
- If Server A has double the RAM of Server B, we can just assign Server A double the number of virtual nodes!

## Real-World Examples
- **Amazon DynamoDB**: Uses consistent hashing for data partitioning across hundreds of thousands of storage nodes.
- **Apache Cassandra**: Uses consistent hashing (with virtual nodes) to distribute data across the cluster, ensuring peer-to-peer symmetry with no master node.
- **Memcached Clients**: Most smart Memcached clients implement consistent hashing locally so they know exactly which server to query for a given key without needing a central coordinator.

## Common Candidate Mistakes
- Mentioning consistent hashing but being unable to explain *why* simple modulo hashing fails during scaling events.
- Forgetting about Virtual Nodes when asked how to handle servers with different hardware capacities or uneven data distribution.

## Follow-Up Interview Probes
- "Walk me through exactly what happens to the keys when a new server is added to a consistent hash ring."
- "How does consistent hashing handle the 'hot key' problem (e.g., Justin Bieber's profile)? Does it?" *(Hint: It doesn't. Consistent hashing distributes keys evenly, but if one specific key is requested a billion times, it still hits a single server).*
- "In your architecture, who maintains the state of the hash ring? The clients, a central load balancer, or the servers themselves?"
