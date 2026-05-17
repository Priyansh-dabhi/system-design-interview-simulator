# CAP Theorem

The CAP theorem states that a distributed data store can only simultaneously provide two out of the following three guarantees:

## Consistency (C)
Every read receives the most recent write or an error. All nodes see the same data at the same time.

## Availability (A)
Every request receives a (non-error) response, without the guarantee that it contains the most recent write. The system remains operational 100% of the time.

## Partition Tolerance (P)
The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.

## Implications
Because networks are unreliable, Partition Tolerance (P) is essentially a requirement in distributed systems. Therefore, systems must choose between Consistency (CP) and Availability (AP).
- **CP Systems**: Prioritize consistency over availability (e.g., traditional RDBMS, HBase). If a partition occurs, the system will return an error rather than stale data.
- **AP Systems**: Prioritize availability over consistency (e.g., Cassandra, DynamoDB). In a partition, the system will return the most recent data it has, even if it's stale (Eventual Consistency).
