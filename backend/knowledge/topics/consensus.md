# Distributed Consensus

In a distributed system with multiple nodes (servers), getting them to agree on a single piece of state—even when nodes crash or the network is unreliable—is one of the hardest problems in computer science. This is known as **Consensus**.

## Why is Consensus Needed?
- **Leader Election**: In a cluster of database nodes, who is the primary node allowed to accept writes? If two nodes both think they are the leader ("Split Brain"), data corruption occurs.
- **Distributed Locks**: Preventing two microservices from processing the exact same billing transaction at the exact same time.
- **Service Discovery**: Maintaining a perfectly consistent list of which servers are currently alive and which are dead.

## The Problem: Network Partitions & Failures
If you have a primary node and a backup node, and the backup node loses network contact with the primary, it has a dilemma:
1. Did the primary crash? (I should take over as leader).
2. Or is the primary fine, and just the network link between us is broken? (If I take over, there will be two leaders, causing a Split Brain).

## The Solution: Quorums and Odd Numbers
To solve this, consensus algorithms require a **Majority Quorum** to make decisions.
- A quorum is `(N/2) + 1` nodes.
- You must always have an odd number of nodes in a consensus cluster (usually 3, 5, or 7).
- If you have 5 nodes, a quorum is 3. If a network partition splits the cluster into 3 nodes and 2 nodes, only the group of 3 can achieve a quorum and elect a leader. The group of 2 is locked out. This mathematically prevents Split Brain.

## The Paxos Algorithm
- Introduced by Leslie Lamport in 1989.
- It is mathematically proven to be correct, but notoriously difficult to understand and even harder to implement correctly in the real world.
- Uses a multi-phase commit process (Prepare, Promise, Accept, Accepted).

## The Raft Algorithm
- Created in 2013 explicitly as a more understandable alternative to Paxos.
- It has become the industry standard for distributed consensus.
- **How it works (simplified)**:
  1. Nodes start as "Followers". If they don't hear a heartbeat from a Leader, they become a "Candidate".
  2. The Candidate requests votes from all other nodes.
  3. The first Candidate to receive a majority quorum of votes becomes the Leader.
  4. All writes go to the Leader. The Leader appends the write to its log and sends it to followers.
  5. Once a majority of followers acknowledge the log, the Leader commits the write and responds to the client.

## Distributed Coordination Services
You rarely implement Raft or Paxos yourself. Instead, you use highly mature, off-the-shelf software designed specifically to manage distributed state safely.

- **Zookeeper**: The pioneer in this space. Uses the ZAB (Zookeeper Atomic Broadcast) protocol. Heavy, written in Java, heavily used in the Hadoop and Kafka (older versions) ecosystems.
- **Etcd**: A modern, lightweight, distributed key-value store that relies entirely on the Raft algorithm. It is written in Go. **It is the brain of Kubernetes** (storing the state of the entire cluster).
- **Consul**: Built by HashiCorp, uses Raft. Popular for service discovery, health checking, and distributed KV configuration.

## Real-World Examples
- **Kubernetes**: Uses Etcd. If the Etcd cluster loses quorum, the entire Kubernetes control plane freezes to prevent state corruption.
- **Kafka**: Historically used Zookeeper to elect the controller node and manage partition leadership. Newer versions of Kafka (KRaft) implement Raft directly inside Kafka, removing the need for Zookeeper.
- **Redlock**: A distributed lock algorithm built on top of Redis, though it doesn't offer the strict mathematical safety guarantees of Raft.

## Common Candidate Mistakes
- Designing an architecture with exactly 2 or 4 consensus nodes (failing to understand how quorums prevent split brain).
- Proposing Zookeeper or Etcd as a primary database for high-throughput user data (they are optimized for tiny amounts of critical configuration data, not gigabytes of payload data).
- Trying to build their own leader election protocol using Ping/Pong logic instead of using an established tool.

## Follow-Up Interview Probes
- "You have a 5-node Etcd cluster. Two nodes are destroyed. Does the cluster still work?" *(Hint: Yes, quorum of 3 is maintained).* "What if 3 nodes are destroyed?" *(Hint: The cluster stops accepting writes entirely to preserve consistency).*
- "How does your architecture ensure that only one worker node processes the end-of-month payroll job?"
- "What is a 'Split Brain', and mathematically, how does Raft prevent it from happening?"
