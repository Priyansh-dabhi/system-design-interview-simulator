# Microservices vs. Monolithic Architecture

Architectural style determines how code is organized, deployed, and scaled. The choice between Monolith and Microservices is a fundamental trade-off between deployment simplicity and organizational scalability.

## Monolithic Architecture
A single, unified codebase where all business logic, data access, and background jobs are compiled and deployed together as one executable.

- **Pros**:
  - Simple to develop, test, and deploy (one codebase, one artifact).
  - Fast in-process communication (function calls instead of network calls).
  - Simple cross-domain transactions (standard ACID database transactions).
- **Cons**:
  - Hard to scale specific bottlenecks (must scale the entire app).
  - Large codebase becomes difficult for new developers to understand.
  - "Blast radius" is high (a memory leak in one module crashes the whole app).
  - Tied to a single technology stack.
- **Use when**: Early-stage startups, simple CRUD apps, or when the team size is small (under 10-15 engineers).

## Microservices Architecture
The application is split into small, independent services, each responsible for a specific business capability (e.g., User Service, Payment Service). They communicate over a network (REST, gRPC, or messaging queues).

- **Pros**:
  - **Independent Deployments**: Teams can deploy at their own pace without coordinating.
  - **Independent Scaling**: Scale only the services that need it (e.g., scale the Search service, but not the Billing service).
  - **Tech Heterogeneity**: Use Python for AI, Go for performance, Node.js for APIs.
  - **Fault Isolation**: If the Recommendation service crashes, the core Checkout service still works.
- **Cons**:
  - Extremely complex operations (requires Kubernetes, CI/CD, observability).
  - Network latency replaces fast in-process function calls.
  - Distributed transactions are incredibly hard (no simple ACID guarantees across services).
  - Data duplication and complex state management.
- **Use when**: Large engineering organizations (Conway's Law), systems with extreme and varied scale requirements, complex domains.

## Distributed Transactions & Data Consistency
In a monolith, updating an order and updating inventory happens in one database transaction. In microservices, they are separate databases.

- **Two-Phase Commit (2PC)**: Strict consistency, but very slow and blocks resources. Rarely used in modern microservices.
- **Saga Pattern**: A sequence of local transactions. If one step fails, the system triggers "compensating transactions" to undo the previous steps. (e.g., Order created -> Inventory failed -> Compensating transaction cancels the order). Provides Eventual Consistency.

## API Gateways
When a client needs data from 5 different microservices, making 5 network calls from a mobile device is slow. 
- An **API Gateway** sits in front of the microservices, providing a single entry point.
- It handles authentication, rate limiting, and request routing.
- **BFF (Backend for Frontend)**: A pattern where a specific API gateway is created for a specific client (e.g., one for iOS, one for Web) to aggregate data perfectly for that UI.

## Service Discovery
In a dynamic environment like Kubernetes, IP addresses of microservices change constantly.
- **Service Discovery** (e.g., Consul, Etcd, or built-in Kubernetes DNS) allows services to find each other via names rather than hardcoded IPs.

## Real-World Examples
- **Netflix / Uber / Amazon**: Pioneers of microservices. Driven by the need to have thousands of engineers working concurrently without stepping on each other's toes.
- **Shopify / Stack Overflow**: Famous examples of highly successful, massive "Majestic Monoliths". They prove you don't *need* microservices to achieve massive scale.

## Common Candidate Mistakes
- Immediately choosing microservices for a simple system design problem without justifying the operational overhead.
- Designing microservices that share a single database (an anti-pattern known as a "Distributed Monolith").
- Ignoring the latency introduced by chaining multiple synchronous microservice calls (Service A calls B, which calls C, which calls D).

## Follow-Up Interview Probes
- "You designed a microservices architecture. How do you handle a transaction that spans the Payment Service and the Inventory Service?"
- "What happens to the overall system latency if your API Gateway needs to call three microservices synchronously?"
- "How do the microservices authenticate with each other?"
- "Why not build this as a monolith? What specific pain points are you solving with microservices here?"
