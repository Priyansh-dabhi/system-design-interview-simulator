# Message Queues

Message queues facilitate asynchronous communication between microservices, decoupling the producing and consuming services.

## Core Concepts
- **Producer (Publisher)**: Creates and sends messages to the queue.
- **Consumer (Subscriber)**: Retrieves and processes messages from the queue.
- **Broker**: The intermediate system managing the queues (e.g., RabbitMQ, Kafka).

## Benefits
- **Decoupling**: Services don't need to know about each other.
- **Asynchronous Processing**: Producers don't wait for consumers to finish processing.
- **Scalability**: Can scale producers and consumers independently.
- **Fault Tolerance**: If a consumer crashes, the message remains in the queue to be processed later.
- **Spike Smoothing / Buffering**: Manages sudden bursts in traffic by queuing requests instead of overwhelming downstream services.

## Common Systems
- **RabbitMQ**: Traditional message broker focusing on reliable delivery and complex routing.
- **Apache Kafka**: Distributed event streaming platform capable of handling trillions of events a day. Optimized for high throughput and replayability.
