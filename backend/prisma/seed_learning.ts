import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const isRemoteDb = Boolean(
    connectionString &&
    !connectionString.includes("localhost") &&
    !connectionString.includes("127.0.0.1")
);

const pool = new pg.Pool({
    connectionString,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding learning topics...');

    // Delete existing topics (which cascades to lessons, questions, etc.)
    await prisma.learningTopic.deleteMany({});

    // 1. System Design Fundamentals
    const fundamentals = await prisma.learningTopic.create({
        data: {
            title: 'System Design Fundamentals',
            description: 'Core concepts for designing large-scale distributed systems.',
            slug: 'system-design-fundamentals',
            order: 1,
            icon: 'BookOpen',
            lessons: {
                create: [
                    {
                        title: 'What is System Design?',
                        description: 'Introduction to designing scalable architectures.',
                        order: 1,
                        youtubeVideoId: 'm8Icp_Cid5o',
                        youtubeVideoTitle: 'System Design Interview Crash Course',
                        youtubeChannel: 'ByteByteGo',
                        estimatedMinutes: 5,
                        content: `# What is System Design?

System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements.

## WHY IT MATTERS
In the real world, single servers fail, traffic spikes, and data grows. System design teaches you how to handle these challenges by combining different components (databases, caches, load balancers) into a resilient architecture.

## HOW IT WORKS
It starts with defining requirements (functional and non-functional) and doing capacity estimation. Then you define high-level components and dive deep into databases, caching, and communication protocols.

## INTERVIEW TIP
Always clarify requirements first! Do not jump to architecture. Ask "Who is the user?" and "What is the expected scale?"

## KEY TAKEAWAYS
- Clarify requirements (Functional & Non-Functional).
- Estimate scale (Traffic & Data).
- Define high-level design.
- Deep dive into components.`,
                        questions: {
                            create: [
                                {
                                    question: 'What is the first step in a system design interview?',
                                    explanation: 'You must always understand the problem scope before designing.',
                                    order: 1,
                                    options: {
                                        create: [
                                            { text: 'Draw the architecture', isCorrect: false },
                                            { text: 'Clarify requirements', isCorrect: true },
                                            { text: 'Pick a database', isCorrect: false },
                                            { text: 'Setup a load balancer', isCorrect: false },
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // 2. Scalability
    const scalability = await prisma.learningTopic.create({
        data: {
            title: 'Scalability',
            description: 'Learn how systems handle increasing traffic and workload.',
            slug: 'scalability',
            order: 2,
            icon: 'ArrowsOut',
            lessons: {
                create: [
                    {
                        title: 'Vertical vs Horizontal Scaling',
                        description: 'Understand how to scale your servers.',
                        order: 1,
                        youtubeVideoId: 'xpDnVSmNFX0',
                        youtubeVideoTitle: 'Vertical vs Horizontal Scaling',
                        youtubeChannel: 'Gaurav Sen',
                        estimatedMinutes: 6,
                        content: `# Vertical vs Horizontal Scaling

Scaling determines how your system handles growth in traffic or data.

## WHY IT MATTERS
If your system becomes a bottleneck, you need to add resources. Knowing whether to scale vertically or horizontally determines the cost and resilience of your architecture.

## HOW IT WORKS
- **Vertical Scaling (Scale Up):** Adding more power (CPU, RAM) to an existing server. 
- **Horizontal Scaling (Scale Out):** Adding more servers to a resource pool.

## TRADE-OFFS
- **Vertical:** Easy to implement, no code changes. But it has a hard limit (hardware constraints) and introduces a single point of failure.
- **Horizontal:** Infinite scalability, resilient. But requires complex distributed systems logic (load balancing, stateless servers).

## INTERVIEW TIP
In system design interviews, almost always default to horizontal scaling for web servers, but understand that scaling databases horizontally (sharding) is very complex.

## KEY TAKEAWAYS
- Vertical = bigger machine.
- Horizontal = more machines.
- Horizontal is preferred for modern distributed systems.`,
                        questions: {
                            create: [
                                {
                                    question: 'Which scaling approach involves adding more RAM to a single server?',
                                    explanation: 'Adding resources to an existing machine is scaling vertically (scaling up).',
                                    order: 1,
                                    options: {
                                        create: [
                                            { text: 'Horizontal Scaling', isCorrect: false },
                                            { text: 'Vertical Scaling', isCorrect: true },
                                            { text: 'Diagonal Scaling', isCorrect: false },
                                            { text: 'Elastic Scaling', isCorrect: false },
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // 3. Load Balancing
    const loadBalancing = await prisma.learningTopic.create({
        data: {
            title: 'Load Balancing',
            description: 'Distribute incoming network traffic across multiple servers.',
            slug: 'load-balancing',
            order: 3,
            icon: 'Scales',
            lessons: {
                create: [
                    {
                        title: 'Load Balancing Explained',
                        description: 'How load balancers prevent single points of failure.',
                        order: 1,
                        youtubeVideoId: 'K0Ta65OqQkY',
                        youtubeVideoTitle: 'What is a Load Balancer?',
                        youtubeChannel: 'IBM Technology',
                        estimatedMinutes: 7,
                        content: `# Load Balancing

A Load Balancer distributes incoming client requests across multiple servers to ensure no single server becomes overwhelmed.

## WHY IT MATTERS
As traffic grows, one server cannot handle all requests. A load balancer ensures high availability and reliability by routing traffic only to healthy servers.

## HOW IT WORKS
It sits between clients and servers. When a request comes in, the load balancer uses an algorithm (like Round Robin or Least Connections) to decide which server gets the request.

## ARCHITECTURE
Client -> Load Balancer -> [Server 1, Server 2, Server 3]

## WHEN TO USE IT
Whenever you scale horizontally (have more than one server).

## TRADE-OFFS
- **Pros:** Prevents server overload, provides health checks, allows zero-downtime deployments.
- **Cons:** The load balancer itself can become a single point of failure (requires redundancy).

## INTERVIEW TIP
Always place a load balancer between your clients and web servers, and another between web servers and internal application servers.

## KEY TAKEAWAYS
- Distributes traffic to prevent overload.
- Uses algorithms like Round Robin.
- Performs health checks on servers.`,
                        questions: {
                            create: [
                                {
                                    question: 'What is the main purpose of a load balancer?',
                                    explanation: 'A load balancer distributes traffic across multiple servers to ensure reliability and performance.',
                                    order: 1,
                                    options: {
                                        create: [
                                            { text: 'Store database backups', isCorrect: false },
                                            { text: 'Distribute traffic across servers', isCorrect: true },
                                            { text: 'Compress images', isCorrect: false },
                                            { text: 'Encrypt passwords', isCorrect: false },
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // 4. Caching
    const caching = await prisma.learningTopic.create({
        data: {
            title: 'Caching',
            description: 'Store frequently accessed data in memory for fast retrieval.',
            slug: 'caching',
            order: 4,
            icon: 'Lightning',
            lessons: {
                create: [
                    {
                        title: 'Introduction to Caching',
                        description: 'Reduce latency and database load with Redis/Memcached.',
                        order: 1,
                        youtubeVideoId: 'dGAgxozNWFE',
                        youtubeVideoTitle: 'Caching System Design',
                        youtubeChannel: 'ByteByteGo',
                        estimatedMinutes: 8,
                        content: `# Caching

Caching stores copies of frequently accessed data in high-speed storage (usually RAM) to serve future requests faster.

## WHY IT MATTERS
Databases are slow (disk I/O). Reading from RAM is orders of magnitude faster. Caching reduces latency for the user and reduces the load on the database.

## HOW IT WORKS (Cache-Aside Pattern)
1. Application asks cache for data.
2. If data is there (Cache Hit), return it.
3. If not (Cache Miss), query database, store result in cache, and return data.

## EXAMPLE
A user's profile on Twitter or a viral video's metadata on YouTube.

## TRADE-OFFS
- **Data Stale:** Cache might hold old data if the database updates. (Requires invalidation strategies like TTL).
- **Cost:** RAM is much more expensive than disk storage.

## INTERVIEW TIP
Mention Redis or Memcached. Be ready to discuss Cache Eviction policies like LRU (Least Recently Used) and Cache Invalidation (TTL, write-through).

## KEY TAKEAWAYS
- Fast, in-memory data store.
- Reduces database load.
- Main challenge is data consistency.`,
                        questions: {
                            create: [
                                {
                                    question: 'What happens during a "Cache Miss"?',
                                    explanation: 'When data is not in the cache, the application must query the database, then populate the cache for next time.',
                                    order: 1,
                                    options: {
                                        create: [
                                            { text: 'The application crashes', isCorrect: false },
                                            { text: 'Data is fetched from DB and added to cache', isCorrect: true },
                                            { text: 'The cache deletes the oldest item', isCorrect: false },
                                            { text: 'The user receives an error', isCorrect: false },
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // 5. Database Replication
    const database = await prisma.learningTopic.create({
        data: {
            title: 'Databases & Replication',
            description: 'Master-slave architecture, data redundancy, and failover.',
            slug: 'databases-replication',
            order: 5,
            icon: 'Database',
            lessons: {
                create: [
                    {
                        title: 'Database Replication',
                        description: 'How to keep your database highly available.',
                        order: 1,
                        youtubeVideoId: 'wjeN-l5V05c',
                        youtubeVideoTitle: 'Database Replication',
                        youtubeChannel: 'Gaurav Sen',
                        estimatedMinutes: 6,
                        content: `# Database Replication

Replication is the process of copying data from a central database (Master) to one or more secondary databases (Slaves/Replicas).

## WHY IT MATTERS
If you only have one database and it crashes, your app dies. Replication ensures high availability, prevents data loss, and improves read performance.

## HOW IT WORKS (Master-Slave)
- **Master:** Handles all WRITE operations (INSERT, UPDATE, DELETE).
- **Slave:** Copies data from Master. Handles READ operations (SELECT).

## WHEN TO USE IT
When your application is read-heavy (like Twitter or Facebook), you can add many read-replicas to scale read capacity.

## TRADE-OFFS
- **Replication Lag:** Slaves might be a few milliseconds behind the Master. Users might see stale data briefly.

## INTERVIEW TIP
Mention that for read-heavy systems (e.g., 95% reads, 5% writes), adding Read Replicas is the standard way to scale the database horizontally.

## KEY TAKEAWAYS
- Master handles writes, Replicas handle reads.
- Improves availability and read scalability.
- Introduces eventual consistency (replication lag).`,
                        questions: {
                            create: [
                                {
                                    question: 'In a Master-Slave replication setup, which node handles writes?',
                                    explanation: 'The Master node handles all writes to avoid data conflicts.',
                                    order: 1,
                                    options: {
                                        create: [
                                            { text: 'Both Master and Slave', isCorrect: false },
                                            { text: 'The Master node', isCorrect: true },
                                            { text: 'The Slave node', isCorrect: false },
                                            { text: 'The Load Balancer', isCorrect: false },
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log('Created topics and lessons!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
