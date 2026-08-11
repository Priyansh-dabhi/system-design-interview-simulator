# WebSockets & Real-Time Communication

Traditional HTTP is a request-response protocol initiated entirely by the client. The server cannot "push" data to the client proactively. For real-time applications (chat apps, live sports scores, collaborative editing, multiplayer games), this limitation is unacceptable.

## Approaches to Real-Time Communication

### 1. HTTP Short Polling
The client sends an HTTP request to the server every N seconds (e.g., `setInterval`). 
- **Pros**: Extremely simple.
- **Cons**: Massive overhead. 99% of requests might return "no new data," wasting server CPU, database connections, and mobile battery.

### 2. HTTP Long Polling
The client sends a request. If there is no new data, the server *holds the connection open* until new data arrives (or a timeout occurs). The server then responds, and the client immediately opens a new long-polling connection.
- **Pros**: No empty responses. Real-time updates.
- **Cons**: Still carries HTTP header overhead. Managing thousands of hanging connections requires asynchronous, non-blocking servers (like Node.js or Netty).

### 3. Server-Sent Events (SSE)
A standardized HTTP connection that stays open indefinitely, but is **unidirectional**. The client subscribes, and the server pushes text data down the pipe.
- **Pros**: Uses standard HTTP. Built-in reconnection logic in browsers. Excellent for simple push notifications or live feeds.
- **Cons**: One-way only (server to client). Limited maximum open connections per browser (historically 6 per domain).

### 4. WebSockets
A distinct TCP-based protocol (though it initiates via an HTTP "Upgrade" handshake). It establishes a persistent, **bidirectional**, full-duplex connection between client and server.
- **Pros**: Extremely low latency. Negligible overhead after the initial handshake. Client and server can push binary or text data to each other at any time.
- **Cons**: Difficult to scale. Connections are stateful. Load balancers must support long-lived TCP connections.

## Scaling WebSockets (The Chat App Problem)
Scaling a stateless REST API is easy (just add more servers). Scaling stateful WebSockets is very hard.

**The Scenario**: User A and User B are chatting.
1. User A connects to WebSocket Server 1.
2. User B connects to WebSocket Server 2.
3. User A sends a message: "Hello B". Server 1 receives it.
4. **The Problem**: Server 1 does not have an open connection to User B. How does Server 1 send the message to User B?

**The Solution: Pub/Sub Redis / Message Broker**
1. When Server 1 receives the message, it publishes it to a Redis Pub/Sub channel (e.g., `channel:user_b`).
2. *All* WebSocket servers are subscribed to Redis Pub/Sub.
3. Server 2 sees the message on `channel:user_b`. Server 2 looks at its local connection pool, sees User B is connected, and pushes the message down User B's WebSocket connection.

## Connection Management & Presence
- **Presence (Who is online?)**: Because WebSocket connections are persistent, the server inherently knows who is online. When a user connects, the server updates their status in a fast store (like Redis) to "online". When the TCP connection drops, the server catches the disconnect event and updates Redis to "offline".
- **Heartbeats (Ping/Pong)**: Mobile networks are notoriously flaky. A connection might drop without the server receiving a TCP FIN packet (a "half-open" connection). The server must periodically send "Ping" frames. If the client doesn't reply with "Pong" within a timeout, the server forcefully closes the connection to free up memory.

## Real-World Examples
- **WhatsApp / Discord / Slack**: Use persistent bidirectional connections (often WebSockets or custom TCP protocols) for instant messaging and presence.
- **Stock Tickers / Live Dashboards**: Often use Server-Sent Events (SSE) since the flow of data is almost entirely unidirectional (server pushing prices to the client).

## Common Candidate Mistakes
- Recommending Short Polling for a chat application at scale.
- Forgetting that WebSocket connections are stateful, and designing a multi-server architecture without a Pub/Sub mechanism to route messages between servers.
- Not addressing what happens when a client temporarily loses internet connection (message queuing and synchronization upon reconnect).

## Follow-Up Interview Probes
- "How does your architecture handle delivering a message if User B's phone is currently disconnected from the internet?" *(Hint: Push notifications via APNs/FCM and database persistence).*
- "Your WebSocket server can handle 65,000 concurrent connections. If you have 10 million active users, how do you manage the load balancer routing?"
- "Why might you choose Server-Sent Events over WebSockets for a live sports score app?"
