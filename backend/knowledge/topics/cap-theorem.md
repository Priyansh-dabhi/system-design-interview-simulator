# CAP Theorem

The CAP theorem, proven by Eric Brewer in 2000, states that a distributed data store can only simultaneously guarantee **two out of three** properties: Consistency, Availability, and Partition Tolerance.

## The Three Properties

### Consistency (C)
Every read returns the most recent write, or an error. All nodes in the distributed system see the same data at the same time. This is *linearizability* — if a write completes, all subsequent reads reflect that write.

### Availability (A)
Every request receives a response (non-error), though it may not contain the most recent data. The system remains operational even during partial failures.

### Partition Tolerance (P)
The system continues to operate even when network messages are dropped or delayed between nodes (a "network partition"). Messages may fail to arrive, but the system keeps running.

## Why You Must Choose CP or AP
In practice, network partitions are inevitable — hardware fails, links go down, packets are dropped. Therefore, **Partition Tolerance is not optional** in any distributed system. The real choice is: **when a partition occurs, do you sacrifice Consistency or Availability?**

- **CP Systems (Consistency + Partition Tolerance)**: During a partition, the system refuses to respond rather than returning potentially stale data. The system is unavailable until the partition heals.
  - Examples: HBase, Zookeeper, Google Spanner (via TrueTime), traditional relational databases (PostgreSQL with synchronous replication), MongoDB (with strong read preference).
  - Use when: Financial transactions, inventory management, any system where incorrect data is worse than being temporarily unavailable.

- **AP Systems (Availability + Partition Tolerance)**: During a partition, all nodes remain available but may return stale/different data. The system uses **Eventual Consistency** — data will converge once the partition heals.
  - Examples: Cassandra, DynamoDB, CouchDB, Riak.
  - Use when: Social media feeds, shopping carts, DNS, user preferences — anywhere where stale data is acceptable.

## PACELC: A More Complete Model
CAP only describes behavior during partitions. In practice, even without partitions, there is a latency vs. consistency trade-off:
- **P** (Partition present): Choose **A**vailability or **C**onsistency (like CAP says).
- **ELC** (Else — no partition): Choose lower **L**atency or stronger **C**onsistency.

Example: DynamoDB is PA/EL (Available during partitions; low latency otherwise). Google Spanner is PC/EC (Consistent during partitions; consistent otherwise, at the cost of higher latency due to global coordination).

## Consistency Models (Beyond Binary)
Real systems offer a spectrum of consistency:
- **Strong (Linearizable)**: Every read sees the latest write. Slowest, most expensive. (Spanner, Zookeeper)
- **Sequential**: All nodes see operations in the same order, but not necessarily in real-time order.
- **Causal**: Causally related operations are seen in order by all nodes. Unrelated operations can be seen in different orders. (MongoDB sessions)
- **Eventual Consistency**: All reads will eventually converge to the latest write, but no timing guarantee. (Cassandra, DNS, S3 replication)
- **Read-Your-Writes**: A user always sees their own writes, even if others don't yet. (Common session-level guarantee)
- **Monotonic Read**: Once you've seen a value, you won't see an older value. Prevents "going back in time."

## Real-World Examples
- **Amazon Shopping Cart (AP)**: Uses a CRDT-based design. Adding items to a cart during a partition is more important than perfect consistency. Items may appear duplicated temporarily, but Eventual Consistency resolves it. Amazon explicitly chose Availability over Consistency here.
- **Bank Account Balance (CP)**: Showing a stale balance could allow overdrafts. Banks sacrifice Availability (transactions queue or fail during outages) to maintain Consistency.
- **DNS (AP)**: DNS records propagate with a TTL. During an update, different users may see different IP addresses for the same domain. This is Eventual Consistency by design.

## Common Candidate Mistakes
- Treating CAP as if you can choose to ignore Partition Tolerance.
- Not knowing what type of consistency each database actually provides.
- Failing to specify *why* a specific trade-off is acceptable for the given problem.
- Confusing "Availability" in CAP (no errors during partition) with "High Availability" (uptime/SLA — a separate concept).

## Follow-Up Interview Probes
- "You chose Cassandra for your design — what does that mean for consistency? How do you handle reading stale data?"
- "Explain a scenario where eventual consistency would cause a real bug in your system. How would you fix it?"
- "How does Google Spanner claim to be both Consistent and Available? What are the trade-offs?"
- "In a multi-region deployment, how would you handle writes to a CP system when the primary region goes down?"
- "What is the difference between linearizability and serializability?"
