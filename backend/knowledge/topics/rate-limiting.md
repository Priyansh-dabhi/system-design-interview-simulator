# Rate Limiting & Throttling

Rate limiting controls the rate of traffic sent by a client or received by a service. It is a critical defensive mechanism in distributed systems.

## Why Use Rate Limiting?
- **Prevent DoS/DDoS Attacks**: Stop malicious actors from overwhelming servers.
- **Cost Control**: Prevent unexpected billing spikes from third-party APIs (e.g., sending SMS, LLM tokens).
- **Resource Protection (Load Shedding)**: Prevent internal servers from crashing during traffic spikes (protecting the database).
- **Fairness & Monetization**: Enforce free-tier limits vs. paid-tier limits for SaaS products.

## Rate Limiting Algorithms

### 1. Token Bucket
- **Mechanism**: A bucket holds tokens (max capacity). Tokens are added at a fixed rate (e.g., 10 per second). Each request costs 1 token. If the bucket is empty, the request is dropped.
- **Pros**: Allows for short bursts of traffic (up to the bucket capacity). Very memory efficient.
- **Use case**: Amazon API Gateway, Stripe.

### 2. Leaky Bucket
- **Mechanism**: A queue holds incoming requests. Requests are processed at a fixed, constant rate (like water leaking from a bucket with a hole). If the queue is full, new requests are dropped.
- **Pros**: Smooths out traffic completely. Perfect for protecting legacy databases that require a strict, even load.
- **Cons**: Does not allow bursts. A burst fills the queue, and subsequent legitimate requests are dropped until the queue drains.

### 3. Fixed Window Counter
- **Mechanism**: Divides time into fixed windows (e.g., 12:00:00 to 12:01:00). A counter tracks requests in that window. Resets at the start of the next minute.
- **Pros**: Simple to implement (e.g., Redis `INCR` and `EXPIRE`).
- **Cons**: The "Boundary Problem" — a client can send 100 requests at 12:00:59 and another 100 at 12:01:01, effectively bypassing a 100/min limit by sending 200 in two seconds.

### 4. Sliding Window Log
- **Mechanism**: Tracks the exact timestamp of every request per user. When a request arrives, remove all timestamps older than the window, then check the size of the remaining log.
- **Pros**: Perfectly accurate. Solves the boundary problem.
- **Cons**: Very memory intensive (must store every timestamp). Bad for high volume.

### 5. Sliding Window Counter
- **Mechanism**: A hybrid of Fixed Window and Sliding Window Log. Tracks counters for the current window and the previous window. Calculates a weighted average based on how much time has elapsed in the current window.
- **Pros**: Memory efficient and smooths out the boundary problem without storing individual timestamps. Often the best overall algorithm.

## Distributed Rate Limiting
In a multi-server architecture, rate limits must be tracked globally.
- **Redis**: The most common tool for distributed rate limiting. Because Redis is fast and single-threaded, it guarantees atomic operations (using Lua scripts) to prevent race conditions when multiple servers try to increment a user's counter simultaneously.
- **Local vs Global**: Global rate limiting (via Redis) adds network latency. Some systems use a hybrid approach: local rate limits on the API gateway for fast DoS protection, and a global Redis check for accurate quota enforcement.

## Where to Place the Rate Limiter?
- **Client Side**: Generally useless for security, as clients can be bypassed.
- **API Gateway / Edge**: The best place. Stops bad traffic before it ever reaches internal microservices. (e.g., Nginx, Kong, Cloudflare).
- **Application Level**: Used for complex, business-logic rate limiting (e.g., "Max 3 password resets per day").

## What happens when a limit is exceeded?
- The server returns HTTP status `429 Too Many Requests`.
- The response should include `X-Ratelimit-Remaining` and `Retry-After` headers to tell the client when they can try again.

## Real-World Examples
- **Stripe**: Uses Token Bucket at the edge, but also utilizes "Load Shedding" to drop less critical API requests during high internal load, ensuring core payment flows succeed.
- **Twitter**: Enforces rate limits on API consumers using Redis clusters.

## Common Candidate Mistakes
- Proposing an in-memory variable for rate limiting without realizing the system has multiple load-balanced servers.
- Choosing Fixed Window without acknowledging the boundary spike problem.
- Not addressing race conditions when reading and writing to the rate limit database concurrently.

## Follow-Up Interview Probes
- "You have 50 API servers. If you use Redis for rate limiting, won't Redis become a bottleneck? How do you fix that?"
- "A malicious user tries to bypass your Fixed Window rate limiter by syncing their requests exactly at the turn of the minute. How does your design handle this?"
- "What status code do you return when a user is throttled, and how should a good mobile client respond to it?"
