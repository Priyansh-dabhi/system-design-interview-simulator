# Database Design

Choosing the right database is one of the most impactful decisions in system design. It affects performance, scalability, consistency, and the complexity of your data model.

## Relational Databases (RDBMS / SQL)
Best for structured data with well-defined schemas and complex relationships.
- **ACID Properties**: Atomicity (all-or-nothing transactions), Consistency (data integrity constraints always hold), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes).
- **Strengths**: Strong consistency, JOIN operations, complex queries, mature tooling, foreign key constraints.
- **Weaknesses**: Harder to scale horizontally; schema changes require migrations.
- **Examples**: PostgreSQL, MySQL, SQL Server, Oracle.
- **Use when**: Financial systems, e-commerce orders, user accounts — any domain with complex relationships and strict consistency requirements.

## NoSQL Databases
Designed for specific data models, scale, and flexible schemas. "NoSQL" doesn't mean "no SQL syntax" — it means "not only SQL."

### Key-Value Stores
- Simple: a key maps to a value (value can be any blob of bytes).
- Fastest read/write performance. No querying by value.
- **Examples**: Redis, DynamoDB, Riak.
- **Use when**: Session storage, caching, shopping carts, leaderboards.

### Document Stores
- Stores data as JSON/BSON documents. Each document is self-contained and can have a different structure.
- Supports querying by any field within the document.
- **Examples**: MongoDB, CouchDB, Firestore.
- **Use when**: Content management systems, catalogs, user profiles with varying attributes.

### Wide-Column (Column-Family) Stores
- Data is stored in rows and columns, but unlike SQL, each row can have a different set of columns.
- Optimized for writing and reading large amounts of data across many rows.
- **Examples**: Apache Cassandra, HBase, Google Bigtable.
- **Use when**: Time-series data, IoT sensor readings, activity logs, recommendation engines. Cassandra is optimized for write-heavy, high-availability workloads.

### Graph Databases
- Stores data as nodes (entities) and edges (relationships). First-class citizen relationships.
- Extremely fast for traversals ("friends of friends," shortest path).
- **Examples**: Neo4j, Amazon Neptune.
- **Use when**: Social networks, fraud detection, recommendation graphs, knowledge graphs.

### Search-Optimized Stores
- Inverted index for full-text search. Not a primary store.
- **Examples**: Elasticsearch, Apache Solr.
- **Use when**: Search boxes, log analytics, aggregations on unstructured text.

## Scaling Strategies

### Vertical Scaling (Scaling Up)
Add more CPU, RAM, or faster disks to the same server. Simple — no code changes needed. Hard limit: the biggest single machine you can buy. Good for getting started.

### Horizontal Scaling (Scaling Out)
Add more servers to distribute the load.

#### Replication
- **Primary-Replica (Master-Slave)**: All writes go to the primary. Replicas copy changes asynchronously and serve reads. Good for read-heavy workloads. Risk: replica lag means reads may be stale.
- **Primary-Primary (Multi-Master)**: Multiple nodes accept writes. Conflict resolution is complex. Used in active-active multi-region setups.
- **Synchronous vs. Asynchronous Replication**: Synchronous guarantees no data loss but increases write latency. Asynchronous is faster but risks losing recent writes if the primary crashes.

#### Sharding (Horizontal Partitioning)
Splitting data across multiple databases, each holding a subset ("shard") of the total data.
- **Range-based sharding**: Shard by value ranges (e.g., users A-M on shard 1, N-Z on shard 2). Risk: hot spots if one range is much more popular.
- **Hash-based sharding**: Apply a hash function to the shard key to distribute evenly. Eliminates hot spots but makes range queries hard.
- **Directory-based sharding**: A lookup service maps each key to its shard. Flexible but the lookup service is a single point of failure.
- **Shard key selection is critical**: A bad shard key creates hot shards (uneven load), making the whole approach ineffective. Use a key with high cardinality and even distribution.

#### Connection Pooling
Database connections are expensive. Connection poolers (e.g., PgBouncer for PostgreSQL) maintain a pool of persistent connections and reuse them, allowing thousands of application threads to share a small pool of database connections.

## Data Modeling Considerations
- **Normalization**: Eliminate redundancy by splitting data into related tables (reduces storage, ensures consistency). Best for write-heavy systems.
- **Denormalization**: Intentionally duplicate data to avoid expensive JOINs (improves read performance). Best for read-heavy systems.
- **Indexing**: An index is a separate data structure (usually a B-tree or hash) that allows the database to find rows without scanning the whole table. Indexes speed up reads but slow down writes (the index must be updated on every write). Create indexes on frequently queried columns.

## OLTP vs. OLAP
- **OLTP (Online Transaction Processing)**: Handles many short, fast transactions (INSERT, UPDATE, SELECT by primary key). Row-oriented storage. Examples: your app's main database.
- **OLAP (Online Analytical Processing)**: Handles complex aggregations over large datasets for reporting. Column-oriented storage (reads only the columns it needs). Examples: Amazon Redshift, Snowflake, Google BigQuery, ClickHouse.
- A common pattern is to use OLTP for operations and replicate data into an OLAP data warehouse for analytics.

## Real-World Examples
- **Uber**: Uses PostgreSQL for trips (structured, ACID), Cassandra for driver location updates (high write throughput), and Elasticsearch for search.
- **Discord**: Migrated from Cassandra to ScyllaDB (a Rust re-implementation of Cassandra) for better performance at lower cost for message storage.
- **Instagram**: Uses PostgreSQL with sharding for user data, and Cassandra for feeds.

## Common Candidate Mistakes
- Choosing MongoDB for everything without justification ("it's flexible").
- Not considering the read/write ratio when picking a database.
- Forgetting to address database replication and what happens when the primary fails.
- Choosing a SQL database and then not mentioning indexes.
- Conflating sharding with replication (they solve different problems).

## Follow-Up Interview Probes
- "Your system needs to store 10 billion rows and serve 1 million reads/second — how do you shard?"
- "How do you handle a shard hotspot where 80% of requests go to one shard?"
- "What's the difference between a database index and a database view?"
- "When would you choose Cassandra over PostgreSQL? Walk me through the trade-offs."
- "How do you keep your read replicas in sync, and what happens during replica lag?"
