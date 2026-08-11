# Data Replication & Consistency

Data replication is the process of copying data across multiple machines. It is the primary mechanism for achieving High Availability (fault tolerance) and scaling read throughput in distributed databases.

## Why Replicate?
1. **High Availability (HA)**: If a database node crashes, a replica can take over immediately, preventing downtime.
2. **Read Scalability**: By directing read queries to replicas, you offload work from the primary node.
3. **Reduced Latency**: Replicas can be placed in different geographic regions, allowing users to read data from a node physically close to them.

## Leader-Follower (Primary-Replica) Replication
The most common architecture (used by PostgreSQL, MySQL, MongoDB).
- One node is designated the **Leader** (Primary/Master). All writes *must* go to the Leader.
- The Leader records the write and sends the data change log to the **Followers** (Replicas/Slaves).
- Followers apply the log to their own local database to stay in sync.
- Reads can go to the Leader or any Follower.

### Synchronous vs. Asynchronous Replication
- **Synchronous**: The Leader waits for followers to confirm they have written the data before responding "Success" to the user.
  - *Pros*: Zero data loss if the leader crashes. Strong consistency.
  - *Cons*: High latency (must wait for network round trips). If a follower crashes, the leader might block all writes.
- **Asynchronous**: The Leader responds "Success" to the user immediately, then sends the data to followers in the background.
  - *Pros*: Extremely fast writes. System remains highly available even if followers are slow.
  - *Cons*: **Replica Lag**. If the user reads from a follower immediately after writing, they might see old data. If the Leader crashes before sending the log to followers, data is permanently lost.
- **Semi-Synchronous**: Wait for exactly one follower to confirm, let the rest sync asynchronously. A common compromise.

## Multi-Leader (Active-Active) Replication
Multiple nodes accept writes.
- *Pros*: Great for multi-datacenter setups. If Datacenter A goes down, Datacenter B is still accepting writes.
- *Cons*: **Write Conflicts**. Two users might modify the same row at the exact same time on different leaders. Conflict resolution (e.g., Last-Write-Wins, CRDTs, or custom business logic) is notoriously difficult to get right.

## Leaderless Replication
Any node can accept a write (used by Cassandra, DynamoDB).
- To ensure consistency, the system relies on **Quorums**.
- **Read Quorum (R)** and **Write Quorum (W)**.
- Rule: `R + W > N` (where N is total nodes). If this holds true, a read will always overlap with the most recent write, guaranteeing you read the latest value.

## Handling Replica Lag (Eventual Consistency Anomalies)
When using asynchronous replication, reading from a lagging replica creates weird user experiences.
- **Read-Your-Own-Writes**: If a user submits a comment and refreshes, they should see their comment. *Solution*: Track what the user modifies. For the next 30 seconds after a write, force all reads for that specific user to go to the Leader.
- **Monotonic Reads**: A user reads a replica with lag=1s and sees "Time: 12:00:01". They refresh, hit a replica with lag=5s, and see "Time: 11:59:57" (time went backward). *Solution*: Pin a specific user to always read from the same specific replica (e.g., by hashing their UserID).

## Common Candidate Mistakes
- Assuming replication is an alternative to backups. (If a developer runs `DROP TABLE users`, the replication system will instantly replicate the drop command to all replicas, deleting everything. Backups are still required).
- Confusing Replication (copying the same data for HA) with Sharding (splitting different data for capacity).
- Proposing asynchronous replication for financial transactions where data loss is unacceptable.

## Follow-Up Interview Probes
- "You have a primary and 3 read replicas asynchronously syncing. What exactly happens when the primary node catches fire and dies?"
- "How do you handle the 'Read-Your-Own-Writes' problem in your social media feed design?"
- "What is a 'split-brain' scenario in a primary-replica architecture, and how do modern systems prevent it?"
