# Monitoring, Logging & Observability

In distributed systems, when something breaks, it doesn't just fail; it fails in complex, cascading ways across dozens of microservices. Observability is the capability to understand the internal state of a system from its external outputs. 

## The Three Pillars of Observability

### 1. Metrics (What is wrong?)
Numeric representations of data measured over intervals of time. They are lightweight, highly compressible, and cheap to store for months.
- **System Metrics**: CPU, Memory, Disk I/O, Network Bandwidth.
- **Application Metrics (RED Method)**:
  - **R**ate: Number of requests per second.
  - **E**rrors: Number of failed requests per second.
  - **D**uration: Distribution of response times (Latency).
- **Business Metrics**: Active users, checkout success rate, tweets per minute.
- **Tools**: Prometheus, Datadog, AWS CloudWatch, Grafana (for visualization).

### 2. Logs (Why is it wrong?)
Immutable, timestamped records of discrete events that happened over time. 
- **Structured Logging**: Logs should be written in JSON, not plain text. This allows log aggregators to query and filter them instantly (e.g., `SELECT * WHERE user_id = 123 AND level = ERROR`).
- **Log Aggregation**: In a microservice architecture, logs are generated across hundreds of servers. They must be shipped to a centralized store. 
- **Tools**: ELK Stack (Elasticsearch, Logstash, Kibana), Splunk, Fluentd.

### 3. Distributed Tracing (Where is it wrong?)
In a microservices architecture, a single user request might traverse 15 different services. If it's slow, logs and metrics won't easily tell you *which* service caused the delay.
- **How it works**: An API Gateway generates a unique `Trace ID` for an incoming request. This ID is passed in the HTTP headers to every downstream service. Each service records the start and end time of its work (a `Span`) and attaches the Trace ID.
- **Result**: You get a visual waterfall diagram showing exactly how many milliseconds the request spent in the Auth Service, the Database, and the Payment Service.
- **Tools**: Jaeger, Zipkin, OpenTelemetry.

## Alerting
Metrics are useless if nobody is looking at the dashboard. Alerting automatically notifies engineers when metrics breach a threshold.
- **Static Thresholds**: e.g., "Alert if CPU > 90% for 5 minutes." Prone to false positives.
- **Anomaly Detection**: e.g., "Alert if current checkout rate deviates by 20% from the historical average for this time of day." Much more powerful.
- **Service Level Objectives (SLOs)**: Defining acceptable targets (e.g., "99.9% of requests must complete under 200ms"). If the system burns through its "Error Budget" too fast, an alert fires.

## Health Checks & Liveness/Readiness Probes
Load balancers and container orchestrators (like Kubernetes) need to know if a service is healthy.
- **Liveness Probe**: "Is the app running?" If it fails, Kubernetes kills the pod and restarts it.
- **Readiness Probe**: "Is the app ready to accept traffic?" (e.g., Is the DB connection established?). If it fails, the load balancer stops sending traffic to it, but doesn't kill it.

## Common Candidate Mistakes
- Saying "I'll just check the logs" when asked how to troubleshoot a slow request in a 50-microservice architecture (failing to mention Distributed Tracing).
- Not including monitoring in their high-level system design diagrams.
- Designing an alerting system that alerts on every minor error, leading to "alert fatigue" where engineers ignore critical pages.

## Follow-Up Interview Probes
- "A user complains that checkout is intermittently slow. How do you find the root cause using your observability stack?"
- "How do you handle log storage costs if your system generates 5 TB of logs per day?" *(Hint: Log sampling, dropping debug logs, transitioning old logs to cheap cold storage like S3).*
- "What is the difference between a Liveness probe and a Readiness probe in Kubernetes?"
