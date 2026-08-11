# Event-Driven Architecture (EDA) & Event Sourcing

In a traditional request-driven (synchronous) architecture, Service A calls Service B, waits for a response, then calls Service C. If Service C is down, the entire flow fails. 

In an **Event-Driven Architecture**, services communicate asynchronously by producing and consuming events. An event is a record of something that has happened (e.g., `OrderPlaced`, `UserRegistered`).

## Core Concepts of EDA
- **Producers**: Create events and publish them to an event broker. They do not know who is listening.
- **Consumers**: Subscribe to specific event types and react when they occur.
- **Event Broker**: The central nervous system (e.g., Apache Kafka, Amazon EventBridge, RabbitMQ).

## Benefits of EDA
1. **Extreme Decoupling**: You can add a new service (e.g., an Analytics Service) that listens to `OrderPlaced` events without making *any* code changes to the Order Service.
2. **Resilience**: If the Email Service is down, the Order Service still succeeds. The `UserRegistered` event sits in the broker until the Email Service comes back online and processes the backlog.
3. **High Throughput**: Producers can blast events into the broker much faster than consumers can process them, acting as a massive shock absorber for traffic spikes.

## Challenges of EDA
1. **Eventual Consistency**: Data is no longer instantly consistent across the system. The UI must be designed to handle this (e.g., "Your order is being processed" instead of "Order complete").
2. **Complexity & Tracing**: Debugging a flow where an event triggers Service B, which emits an event triggering Service C, is notoriously difficult without robust Distributed Tracing.
3. **Idempotency**: Message brokers guarantee "at-least-once" delivery, meaning events can be duplicated. Consumers *must* be idempotent.

## Event Sourcing
Event Sourcing takes EDA to the extreme. Instead of storing the *current state* of an entity in a database, you store a sequence of immutable *state-changing events*.

**Traditional CRUD (State-Based)**:
- DB Row: `Account: 123, Balance: $50`
- User deposits $10 -> Update row to `Balance: $60`. The fact that the balance used to be $50 is lost.

**Event Sourcing**:
- DB (Event Store) contains an append-only log:
  1. `AccountOpened {id: 123, initialBalance: $50}`
  2. `MoneyDeposited {id: 123, amount: $10}`
- To get the current balance, you replay the events from the beginning.

**Benefits of Event Sourcing**:
- **Perfect Audit Trail**: You know exactly *how* a state was reached, not just what the state is. Essential for banking and accounting.
- **Time Travel**: You can reconstruct the state of the system at any given point in the past.
- **Flexibility**: If business requirements change, you can write a new consumer that replays the entire historical event log to build a brand new materialized view.

## CQRS (Command Query Responsibility Segregation)
Event Sourcing is almost always paired with CQRS.
- Replaying millions of events just to check an account balance is too slow.
- **CQRS separates the Write model from the Read model.**
- The **Write Model (Command)** appends events to the Event Store.
- An asynchronous projector listens to those events and updates a standard, fast database (the **Read Model / Query**).
- Users query the Read database for instant answers.

## Real-World Examples
- **Banking/Finance**: Almost universally use Event Sourcing. A bank account balance is simply a projection of all past transaction events.
- **E-commerce Checkout**: When you click "Buy", an `OrderPlaced` event is fired. The Inventory service, Payment service, and Shipping service all react to it independently.

## Common Candidate Mistakes
- Suggesting Event Sourcing for a simple CRUD application, drastically overcomplicating the design.
- Designing an event-driven system but making the producer wait for a synchronous acknowledgment from all consumers.
- Forgetting to handle the "Dual Write Problem" (writing to the database and publishing to the event broker are not atomic; if one fails, the system is in an inconsistent state. Solutions: Outbox Pattern).

## Follow-Up Interview Probes
- "In your EDA design, what happens if writing the user to the database succeeds, but publishing the `UserCreated` event to Kafka fails due to a network glitch?" *(Hint: Outbox Pattern)*.
- "If we are using Event Sourcing, how do you prevent replaying 10 years of events every time a user logs in?" *(Hint: Snapshots)*.
- "How do you handle a scenario where events arrive out of order?"
