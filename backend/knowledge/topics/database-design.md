# Database Design

Choosing the right database depends on the specific use cases of the application, particularly access patterns and data structure.

## Relational Databases (SQL)
Best for structured data requiring ACID properties (Atomicity, Consistency, Isolation, Durability). Examples: PostgreSQL, MySQL, SQL Server.
- Use cases: Financial systems, tight relationships between entities.

## NoSQL Databases
Built for specific data models and have flexible schemas.
- **Key-Value**: High performance lookups (Redis, DynamoDB).
- **Document**: Stores data in JSON-like format. Good for varying schemas (MongoDB).
- **Column-Family**: Optimized for analytics and large datasets (Cassandra, HBase).
- **Graph**: Optimized for highly connected data (Neo4j).

## Scaling Strategies
- **Vertical Scaling (Scaling Up)**: Adding more CPU/RAM to a single server. Limited by hardware.
- **Horizontal Scaling (Scaling Out)**: Adding more servers to a pool. More complex to manage but infinitely scalable.
  - **Replication**: Master-slave (active-passive) for read-heavy workloads.
  - **Sharding/Partitioning**: Splitting data across multiple databases. Complex to implement but necessary for massive scale.
