# API Design (REST, GraphQL, gRPC)

API design defines how clients and services communicate. Choosing the right API paradigm impacts performance, payload size, client flexibility, and developer experience.

## REST (Representational State Transfer)
The most common architectural style for web APIs. It relies on standard HTTP methods and stateless communication.

- **Principles**: Resources are identified by URIs (e.g., `/users/123`), operations are defined by HTTP verbs (GET, POST, PUT, PATCH, DELETE).
- **Pros**: Easy to understand, universally supported, leverages HTTP caching seamlessly, decoupled client and server.
- **Cons**: 
  - **Over-fetching**: The client gets all fields of a resource even if it only needs one.
  - **Under-fetching (N+1 problem)**: The client has to make multiple round trips to fetch related resources (e.g., fetch a user, then fetch their posts).
- **Use when**: Public APIs, simple CRUD operations, systems where HTTP caching is critical.

## GraphQL
Developed by Facebook, GraphQL is a query language for APIs that allows clients to request exactly the data they need, nothing more, nothing less.

- **Principles**: Exposes a single endpoint (usually `POST /graphql`). Clients send a query document specifying the schema graph they want returned.
- **Pros**:
  - Eliminates over-fetching and under-fetching.
  - Strong typing and introspection (self-documenting).
  - Great for complex UIs (like mobile apps) that need data from multiple sources in one request.
- **Cons**:
  - Complex to implement on the backend (requires dataloaders to prevent N+1 queries to the database).
  - Breaks standard HTTP caching (everything is a POST to one endpoint).
  - Security risks (complex queries can DOS the server, requires query depth limiting).
- **Use when**: Mobile applications (where bandwidth matters), highly complex UIs with varied data requirements, aggregating data from multiple microservices.

## gRPC (gRPC Remote Procedure Calls)
Developed by Google, gRPC is a high-performance, open-source RPC framework.

- **Principles**: Uses Protocol Buffers (protobufs) as both the Interface Definition Language (IDL) and the underlying message interchange format. Runs over HTTP/2.
- **Pros**:
  - Extremely fast and lightweight. Protobufs are binary, making payloads much smaller than JSON.
  - HTTP/2 supports multiplexing, bidirectional streaming.
  - Automatically generates client and server stubs in multiple languages.
  - Strong typing (no parsing errors).
- **Cons**:
  - Not natively supported by web browsers (requires gRPC-Web proxy).
  - Binary format is not human-readable (harder to debug than JSON).
  - Steeper learning curve.
- **Use when**: Internal microservice-to-microservice communication, real-time streaming, IoT devices, highly performance-sensitive systems.

## API Design Best Practices

### Pagination
Crucial for endpoints returning lists (e.g., `/users`).
- **Offset/Limit**: Easy to implement (`?offset=20&limit=10`), but slow for large datasets (DB has to scan and skip rows) and susceptible to drifting (items missed or duplicated if new data is inserted).
- **Cursor-based**: Uses a pointer to a specific item (`?cursor=xyz`). Faster for large datasets and handles real-time inserts perfectly. Harder to implement and doesn't support jumping to a specific page number.

### Versioning
APIs evolve. Breaking changes must not break existing clients.
- **URI Versioning**: `/api/v1/users`. Simple, explicit, widely used.
- **Header Versioning**: `Accept: application/vnd.company.v1+json`. Cleaner URLs, but harder to test in a browser.

### Idempotency
An idempotent API can be called multiple times without changing the result beyond the initial application. (e.g., `PUT /users/1` is idempotent, `POST /users` is not). 
- Use an `Idempotency-Key` header for non-idempotent endpoints (like payments) so the server can safely ignore duplicate requests caused by network retries.

## Real-World Examples
- **Twitter / Stripe**: Both use excellent, well-documented REST APIs with standard HTTP verbs and status codes. Stripe heavily utilizes `Idempotency-Key`.
- **Facebook / GitHub**: Use GraphQL extensively to allow their complex web and mobile clients to fetch exactly what they need.
- **Netflix / Uber**: Use gRPC for high-throughput internal communication between thousands of backend microservices.

## Common Candidate Mistakes
- Defaulting to REST for internal microservice communication where gRPC would save massive overhead.
- Proposing GraphQL without understanding the backend N+1 querying problem it introduces.
- Not adding pagination to list endpoints in a design interview.
- Confusing PUT (complete replacement) with PATCH (partial update).

## Follow-Up Interview Probes
- "How do you handle a client fetching 1 million records from your REST API?"
- "You chose GraphQL for your mobile app. How do you cache the responses since everything is a POST?"
- "What happens if a user's network drops right after they send a POST to process a payment, and they retry?"
- "Why did you choose REST over gRPC for the communication between your internal microservices?"
