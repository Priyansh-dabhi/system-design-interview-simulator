# Load Balancing

A Load Balancer distributes incoming network traffic across a group of backend servers to ensure no single server bears too much demand.

## algorithms
- **Round Robin**: Requests are distributed sequentially across the servers.
- **Least Connections**: Sends requests to the server with the fewest active connections.
- **IP Hash**: Determines which server to use based on the client's IP address.

## Types of Load Balancers
- **Layer 4 (Transport Layer)**: Routes traffic based on IP address and port (TCP/UDP). It's faster but lacks context.
- **Layer 7 (Application Layer)**: Routes traffic based on content (HTTP headers, URL). Slightly slower but allows for smarter routing decisions.

## High Availability
Typically deployed in active-passive or active-active pairs to prevent a single point of failure.
