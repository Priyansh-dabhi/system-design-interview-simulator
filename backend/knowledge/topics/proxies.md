# Proxies (Forward and Reverse)

A proxy is an intermediate server that sits between a client and a destination server, managing and routing the communication.

## Forward Proxy
A forward proxy sits in front of **client machines**. When a client wants to communicate with the internet, the request goes to the proxy first, which then fetches the data from the internet on the client's behalf.
*(Think of it as the client's representative to the internet).*

**Use Cases:**
- **Anonymity**: The destination server only sees the proxy's IP, not the client's. (e.g., VPNs, Tor).
- **Access Control & Filtering**: Corporate networks use forward proxies to block access to certain websites (e.g., blocking social media on work computers).
- **Caching**: Caching frequently requested websites locally to save corporate bandwidth.

## Reverse Proxy
A reverse proxy sits in front of **backend servers**. When a client on the internet makes a request, the request hits the reverse proxy first, which routes it to the appropriate backend server, retrieves the response, and returns it to the client.
*(Think of it as the backend servers' representative to the internet).*

**Use Cases in System Design:**
- **Load Balancing**: Distributing incoming requests across multiple backend servers to prevent overload.
- **Security & DDoS Protection**: Hiding the true IP addresses of the backend servers. Filtering out malicious requests (Web Application Firewall - WAF).
- **SSL Termination**: Handling the CPU-intensive encryption/decryption of HTTPS traffic so backend servers don't have to.
- **Caching**: Caching static content (like images or HTML) so requests never even hit the backend servers.
- **Compression**: Compressing responses (e.g., gzip, Brotli) before sending them over the internet to save bandwidth.

## API Gateway vs. Reverse Proxy
An API Gateway is essentially a highly specialized Reverse Proxy.
- A **Reverse Proxy** handles generic routing, caching, and load balancing (e.g., Nginx, HAProxy).
- An **API Gateway** adds business-logic layer features like authentication verification (JWT), rate limiting, request/response transformation, and API analytics (e.g., Kong, AWS API Gateway).

## Real-World Examples
- **Nginx & HAProxy**: The two most famous open-source reverse proxies, used by almost every major tech company for routing and load balancing.
- **Cloudflare**: A massive global reverse proxy network. When you put a site on Cloudflare, you change your DNS to point to Cloudflare's reverse proxies.
- **Squid**: A widely used open-source forward proxy for corporate environments.

## Common Candidate Mistakes
- Confusing a forward proxy with a reverse proxy. (In system design interviews, you almost *always* want a Reverse Proxy).
- Designing a microservices architecture without an API Gateway/Reverse Proxy, expecting mobile clients to manage URLs for 20 different internal services directly.

## Follow-Up Interview Probes
- "If your reverse proxy handles SSL termination, how do you secure the traffic between the proxy and your backend servers?"
- "What happens to the client's IP address when traffic passes through a reverse proxy? How does the backend server know who actually made the request?" *(Hint: X-Forwarded-For header).*
- "In your design, what specific responsibilities are you assigning to the API Gateway versus the downstream microservices?"
