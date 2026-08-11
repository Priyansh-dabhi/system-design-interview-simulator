# Load Balancing

A load balancer distributes incoming network traffic across a group of backend servers (a "server pool" or "upstream") to maximize throughput, minimize latency, and prevent any single server from becoming a bottleneck.

## Why Load Balancing Is Necessary
A single server has finite CPU, memory, and network capacity. As traffic grows, you have two options: buy a bigger server (vertical scaling, with a hard ceiling) or add more servers (horizontal scaling). Load balancers make horizontal scaling transparent to the client.

## Load Balancing Algorithms

### Stateless Algorithms
- **Round Robin**: Requests are distributed sequentially across the pool (server 1, server 2, server 3, server 1...). Simple, but ignores server capacity or current load.
- **Weighted Round Robin**: Like Round Robin, but servers with more capacity receive proportionally more requests. Useful when servers have different hardware specs.
- **Random**: Routes each request to a randomly selected server. Statistically similar to Round Robin at scale, with simpler implementation.
- **IP Hash**: Hashes the client's IP address to consistently route the same client to the same server. Useful when server-side session state can't be externalized. Risk: uneven distribution if many clients share a NAT IP.
- **URL Hash**: Routes based on the requested URL path. Useful for caching — the same URL always hits the same server, maximizing cache hit rate.

### Stateful (Dynamic) Algorithms
- **Least Connections**: Routes to the server with the fewest active connections. Best when requests have highly variable processing time.
- **Least Response Time**: Routes to the server with the lowest combination of active connections and fastest average response time.
- **Resource-Based**: Routes based on reported server resource usage (CPU, memory). Requires agents running on each server to report health metrics.

## OSI Layer Classification

### Layer 4 (Transport Layer) Load Balancers
- Operate at the TCP/UDP level. They look at IP address and port number only — they cannot see HTTP headers, cookies, or request paths.
- **Pros**: Extremely fast (no packet inspection), low overhead, works for any TCP/UDP protocol.
- **Cons**: Can't make intelligent routing decisions based on content (can't route `/api/*` differently from `/static/*`).
- **Examples**: AWS NLB, HAProxy in TCP mode, Nginx in stream mode.

### Layer 7 (Application Layer) Load Balancers
- Operate at the HTTP/HTTPS level. They can inspect headers, URLs, cookies, and request bodies to make intelligent routing decisions.
- **Pros**: Rich routing rules (route by path, header, or cookie), SSL termination, A/B testing, blue/green deployments.
- **Cons**: Slightly higher latency due to packet inspection; cannot handle non-HTTP protocols.
- **Examples**: AWS ALB, Nginx in proxy mode, HAProxy in HTTP mode, Envoy.

## SSL Termination
Load balancers typically handle SSL/TLS termination: they decrypt HTTPS traffic from the client, then forward unencrypted HTTP traffic to backend servers. This offloads the CPU-intensive decryption from application servers and centralizes certificate management.

## Session Persistence (Sticky Sessions)
Some applications store session state in-process. If subsequent requests from the same user go to different servers, session state is lost. Solutions:
1. **Sticky Sessions**: The load balancer uses a cookie to route the same user to the same server. Simple, but breaks down when that server fails.
2. **Externalize Session State**: Store sessions in a shared distributed cache (Redis). Any server can handle any request. The recommended approach for scalable systems.

## Health Checks
Load balancers continuously probe backend servers with health checks (HTTP GET `/health` or TCP connection attempts). If a server fails to respond within a timeout (or returns a 5xx error), the load balancer automatically removes it from the pool and stops sending traffic to it. When the server recovers, it's added back automatically.

## High Availability of Load Balancers
A load balancer is itself a potential single point of failure. Solutions:
- **Active-Passive**: Two load balancers; one active, one on standby. If the active one fails, the passive one takes over (using a floating IP / virtual IP). Failover may take seconds.
- **Active-Active**: Multiple load balancers all actively handling traffic (via Anycast or DNS round-robin). More resilient, better utilization. Example: Cloudflare operates this way.

## Global Load Balancing (GSLB)
For multi-region systems, Global Server Load Balancing routes users to the geographically nearest (or healthiest) data center via:
- **DNS-based routing**: Return a different IP address based on the user's geographic location. Cheap and simple, but limited by DNS TTLs.
- **Anycast routing**: Multiple data centers share the same IP address; network routing naturally directs the user to the nearest one. Used by Cloudflare, Google.

## Real-World Examples
- **Netflix**: Uses AWS ALB for HTTP routing, and Zuul (their own open-source L7 load balancer/API gateway) for smart routing, rate limiting, and auth.
- **GitHub**: Uses HAProxy as its primary load balancer, handling hundreds of thousands of requests per second.
- **Cloudflare**: Uses Anycast so every data center shares the same IPs. Traffic naturally routes to the nearest PoP (Point of Presence).

## Common Candidate Mistakes
- Not specifying L4 vs. L7 when discussing the load balancer — they have very different capabilities.
- Forgetting that the load balancer itself can be a single point of failure.
- Using sticky sessions as a solution without acknowledging its failure modes.
- Not mentioning health checks.

## Follow-Up Interview Probes
- "Your load balancer is a single server — what happens when it goes down? How do you fix this?"
- "When would you choose Least Connections over Round Robin?"
- "How does DNS-based load balancing differ from hardware/software load balancing? What are the limitations?"
- "How would you do a zero-downtime deployment with a load balancer?"
- "A single upstream server is handling 90% of traffic while others are idle — what's likely wrong and how do you fix it?"
