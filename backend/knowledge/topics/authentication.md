# Authentication & Authorization at Scale

Authentication (AuthN) verifies *who* you are. Authorization (AuthZ) verifies *what* you are allowed to do. In distributed systems, securely verifying identity across dozens of microservices without creating massive bottlenecks is a core challenge.

## Stateful Authentication (Session Cookies)
- **Mechanism**: The user logs in. The server creates a session object in its database or memory, generates a random `Session ID`, and sends it to the browser as a secure, HTTP-only Cookie. The browser sends this cookie on every subsequent request.
- **Scaling Problem**: If User A logs in on Server 1, and their next request hits Server 2, Server 2 doesn't know who they are.
- **Solution**: Externalize session state. Use a distributed, in-memory cache (like Redis) to store session data. All backend servers check Redis on every request.
- **Pros**: Very secure, easy to revoke (just delete from Redis), easy to implement forced logouts or timeout extensions.
- **Cons**: Requires a network call to Redis on *every single API request*, adding latency and creating a potential bottleneck.

## Stateless Authentication (JWT - JSON Web Tokens)
- **Mechanism**: The user logs in. The server creates a JSON object containing the user's ID, signs it cryptographically using a secret key, and sends it to the client. The client sends this token (usually in the `Authorization: Bearer <token>` header) on every request.
- **Scaling Benefit**: Any backend server that knows the secret key can verify the signature mathematically. *No database or Redis lookup is required.*
- **Pros**: Infinitely scalable, extremely fast, works great for mobile apps and microservice-to-microservice communication.
- **Cons**: 
  - **The Revocation Problem**: Because they are stateless, you cannot "delete" a JWT from the server. If a token is stolen, or a user is banned, the token remains valid until it expires.
  - Payloads can get large, wasting bandwidth on every request.

## Handling JWT Revocation (The Refresh Token Pattern)
To mitigate the revocation problem of JWTs:
1. **Short-Lived Access Tokens**: The JWT expires in 15 minutes.
2. **Long-Lived Refresh Tokens**: The server also issues a Refresh Token (an opaque random string stored in the database, valid for 30 days).
3. **The Flow**: The client uses the JWT for fast, stateless auth. When the JWT expires, the client sends the Refresh Token to the auth server. The auth server checks the database. If the refresh token is valid (and the user isn't banned), it issues a new 15-minute JWT.
4. **Revocation**: To ban a user, simply delete their Refresh Token from the database. Their current JWT will expire within 15 minutes, and they won't be able to get a new one.

## OAuth 2.0 & OIDC (OpenID Connect)
- **OAuth 2.0**: A framework for *authorization* (delegated access). E.g., allowing an app to post to your Twitter feed without giving it your Twitter password.
- **OIDC**: An identity layer built on top of OAuth 2.0 for *authentication* ("Sign in with Google"). It standardizes the format of the token (an ID Token, which is a JWT).

## Single Sign-On (SSO)
Allows a user to log in once and access multiple independent applications.
- **SAML**: The old, XML-based enterprise standard.
- **OIDC**: The modern, JSON-based standard.
- **Mechanism**: App A redirects the user to the central Auth Server. User logs in. Auth Server redirects back to App A with a token. Later, the user visits App B. App B redirects to Auth Server. Auth Server recognizes the user's existing session and instantly redirects back to App B with a new token.

## Auth in Microservices
If an API Gateway sits in front of 20 microservices, where does auth happen?
- **Gateway Termination**: The API Gateway intercepts the request, verifies the JWT (or calls the Auth Service to verify the Session Cookie), extracts the `user_id`, and forwards the request to the internal microservices with `X-User-Id: 123` in the header. The internal services completely trust the API Gateway and don't perform auth themselves. This is the most efficient and common pattern.

## Common Candidate Mistakes
- Suggesting JWTs for a system but failing to explain how to log a user out or ban them.
- Designing a microservices architecture where every single microservice calls the Auth Service on every request, creating a massive bottleneck.
- Storing sensitive data (like passwords) inside a JWT payload (JWTs are signed, but *not* encrypted. Anyone can decode them).

## Follow-Up Interview Probes
- "You chose JWTs. A user's laptop is stolen while logged in. How do you force log them out of all devices immediately?"
- "How do you securely store the JWT on a web frontend to prevent XSS (Cross-Site Scripting) attacks?" *(Hint: HttpOnly cookies, not localStorage).*
- "In your microservices design, how does the Payment Service ensure that the request actually came from the API Gateway and not a compromised internal server?"
