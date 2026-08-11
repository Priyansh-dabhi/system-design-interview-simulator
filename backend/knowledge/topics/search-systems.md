# Search Systems

Standard databases (SQL and NoSQL) are excellent for exact matches and range queries, but they are terrible at "Full-Text Search" (e.g., finding "running shoes" in a database of millions of item descriptions, accounting for typos, synonyms, and relevance).

## The Core Concept: The Inverted Index
Traditional databases map a document ID to its content: `Doc1 -> "The quick brown fox"`. To search for "fox", the database must scan every document.

Search engines (like Elasticsearch or Apache Lucene) use an **Inverted Index**. It maps words to the documents that contain them:
- `quick -> [Doc1]`
- `brown -> [Doc1, Doc2]`
- `fox -> [Doc1, Doc3]`
Now, searching for "fox" is an instant `O(1)` lookup.

## Text Analysis and Processing
Before building the inverted index, the text goes through an Analyzer pipeline:
1. **Tokenization**: Splitting sentences into words ("The", "quick", "brown", "fox").
2. **Lowercasing**: "The" becomes "the".
3. **Stop Words Removal**: Removing extremely common words with no search value ("the", "is", "at").
4. **Stemming / Lemmatization**: Reducing words to their root form. ("running" -> "run", "shoes" -> "shoe").
Result: Searching for "run" will match a document containing "running".

## Relevance Scoring (TF-IDF and BM25)
When a user searches, the system often finds thousands of matches. How does it know which one to show first?
- **TF (Term Frequency)**: How many times does the search term appear in the document? (More = more relevant).
- **IDF (Inverse Document Frequency)**: How rare is the search term across *all* documents? The word "shoe" might be in every document, but "Nike" is rare. A match on "Nike" carries more weight.
- **BM25**: The modern algorithm used by Elasticsearch, which improves upon basic TF-IDF by adding saturation (if a word appears 100 times, it's not 100x more relevant than appearing 5 times).

## Distributed Search Architecture (Elasticsearch)
- An Elasticsearch cluster consists of multiple **Nodes** (servers).
- Data is organized into **Indices** (equivalent to a database table).
- Indices are split into **Shards** (partitions). Sharding allows the index to be distributed across multiple nodes.
- **Replica Shards** provide high availability and increase read throughput.

### The Search Process (Scatter-Gather)
When a user searches an index with 5 primary shards:
1. **Scatter**: The coordinating node receives the request and forwards it to all 5 shards.
2. **Gather**: Each shard executes the search locally and returns its top 10 results to the coordinating node.
3. The coordinating node merges and sorts the 50 results, and returns the final top 10 to the user.

## Keeping Search in Sync
Elasticsearch is not a primary database (it lacks strict ACID transactions). A common architecture uses a primary database (PostgreSQL) as the source of truth, and syncs data to Elasticsearch.
- **Synchronous**: The app writes to Postgres, then writes to Elasticsearch. If the ES write fails, data is out of sync.
- **Asynchronous (Event-Driven)**: The app writes to Postgres and publishes an event to Kafka. A dedicated Search Indexer service reads the Kafka stream and updates Elasticsearch. Better for scale and resilience.
- **Change Data Capture (CDC)**: Tools like Debezium read the PostgreSQL Write-Ahead Log (WAL) directly and stream the changes to Elasticsearch automatically, entirely decoupled from the application code.

## Real-World Examples
- **Amazon/E-commerce**: Uses search systems for product catalogs, handling facets (filters for size, color) extremely efficiently.
- **Log Aggregation**: The "E" in the ELK stack. Millions of log lines are ingested and indexed by Elasticsearch so engineers can search for specific error codes instantly.

## Common Candidate Mistakes
- Suggesting SQL `LIKE '%term%'` queries for full-text search at scale (this requires full table scans and is incredibly slow).
- Treating Elasticsearch as the primary source of truth for critical transactional data.
- Ignoring the complexity of keeping the primary DB and the search index in sync.

## Follow-Up Interview Probes
- "How do you handle 'typeahead' or 'autocomplete' search in the UI? Does every keystroke hit Elasticsearch?" *(Hint: Use a Trie data structure, or Redis, or debouncing on the client).*
- "Your primary database is updated 10,000 times a second. How do you keep Elasticsearch perfectly in sync without bringing down the database?"
- "What happens if a node holding a primary shard dies in your search cluster?"
