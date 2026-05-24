<div align="center">

# 🧠 AI System Design Interview Simulator

**A full-stack AI-powered mobile application that simulates realistic FAANG-level system design interviews with adaptive questioning, RAG-enhanced knowledge retrieval, and structured performance evaluation.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-DD2C00?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

🔗 **[Live Backend](https://system-design-interview-simulator.onrender.com)** · 📂 **[GitHub Repository](https://github.com/Priyansh-dabhi/system-design-interview-simulator)** · 🎬 **[Demo Video](#-demo--screenshots)** · 🖼️ **[Media Gallery](#-demo--screenshots)**

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [RAG Pipeline](#-rag-pipeline)
- [Database Design](#-database-design)
- [Authentication Flow](#-authentication-flow)
- [API Documentation](#-api-documentation)
- [Folder Structure](#-folder-structure)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Demo & Screenshots](#-demo--screenshots)
- [Engineering Highlights](#-engineering-highlights)
- [Future Improvements](#-future-improvements)

---

## 🎯 Project Overview

System design interviews at top tech companies test a candidate's ability to think architecturally, make trade-offs under ambiguity, and communicate complex distributed systems clearly. Practicing these interviews typically requires an experienced engineer to act as the interviewer — a scarce and expensive resource.

**This simulator solves that problem.** It provides an AI interviewer powered by Gemini 2.5 Flash and LangChain that dynamically adapts its questioning based on the candidate's responses, progresses through realistic interview stages (greeting → warmup → design → deep dive → evaluation), and uses Retrieval-Augmented Generation (RAG) to ground its questions in real system design knowledge.

At the end of each session, the AI generates a structured evaluation covering strengths, missed topics, and actionable suggestions — giving candidates the targeted feedback they need to improve.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React Native (Expo 54), TypeScript, Redux Toolkit, RTK Query, Expo Router |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL 16 with pgvector extension, Prisma ORM 7 |
| **AI / LLM** | LangChain, Google Gemini 2.5 Flash, Gemini Embedding 001 |
| **RAG Pipeline** | LangChain TextSplitters, pgvector cosine similarity search |
| **Authentication** | Firebase Authentication (Google OAuth), Firebase Admin SDK, JWT access/refresh tokens, bcrypt |
| **Voice Input** | Expo Speech Recognition (native module) |
| **Validation** | Zod schema validation (backend), structured error handling |
| **UI** | Phosphor Icons, Expo Linear Gradient, React Native Reanimated |
| **Infrastructure** | Docker Compose (local pgvector), Render (production backend), Expo EAS (mobile builds) |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE APPLICATION                          │
│  React Native (Expo) · Redux Toolkit · RTK Query · Expo Router    │
│                                                                     │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │  Auth    │  │  Interview │  │  History  │  │  Voice Input   │  │
│  │  Screens │  │  Session   │  │  & Stats  │  │  (Speech Rec.) │  │
│  └────┬─────┘  └─────┬──────┘  └─────┬─────┘  └───────┬────────┘  │
│       └───────────────┼───────────────┼────────────────┘           │
│                       │               │                             │
│              RTK Query baseQueryWithReauth (auto token refresh)     │
└───────────────────────┼───────────────┼─────────────────────────────┘
                        │               │
                   HTTPS (REST API)     │
                        │               │
┌───────────────────────┼───────────────┼─────────────────────────────┐
│                    BACKEND SERVER                                    │
│               Express 5 · TypeScript · Zod                          │
│                                                                     │
│  ┌────────────────────┼───────────────┼─────────────────────────┐  │
│  │              Route Layer                                     │  │
│  │    /api/auth/*  ·  /api/interview/*                          │  │
│  └──────┬─────────────┼───────────────┼───────────────┬─────────┘  │
│         │             │               │               │             │
│  ┌──────▼──────┐ ┌────▼────────┐ ┌────▼──────┐ ┌─────▼──────────┐ │
│  │ Auth        │ │ Interview   │ │ Validate  │ │ Auth Middleware │ │
│  │ Controller  │ │ Controller  │ │ Middleware │ │ (JWT verify)   │ │
│  └──────┬──────┘ └─────┬───────┘ └───────────┘ └────────────────┘ │
│         │              │                                            │
│  ┌──────▼──────┐ ┌─────▼────────────────────────────────────────┐  │
│  │ Auth        │ │           AI Orchestration Layer              │  │
│  │ Service     │ │  ┌──────────────┐  ┌───────────────────────┐ │  │
│  │ + Refresh   │ │  │ Stage        │  │ Prompt Builder        │ │  │
│  │   Token Svc │ │  │ Manager      │  │ (stage-aware prompts) │ │  │
│  └──────┬──────┘ │  └──────┬───────┘  └───────────┬───────────┘ │  │
│         │        │         │                      │             │  │
│         │        │  ┌──────▼──────────────────────▼───────────┐ │  │
│         │        │  │          Interview Orchestrator          │ │  │
│         │        │  │  1. Determine stage                     │ │  │
│         │        │  │  2. RAG context retrieval               │ │  │
│         │        │  │  3. Build prompt → pipe → LLM invoke    │ │  │
│         │        │  └──────────────┬──────────────────────────┘ │  │
│         │        │                 │                             │  │
│         │        │  ┌──────────────▼──────────────────────────┐ │  │
│         │        │  │         RAG Pipeline                     │ │  │
│         │        │  │  Embed query → pgvector similarity search│ │  │
│         │        │  │  → top-k context chunks returned         │ │  │
│         │        │  └──────────────┬──────────────────────────┘ │  │
│         │        └─────────────────┼────────────────────────────┘  │
│         │                          │                                │
│  ┌──────▼──────────────────────────▼────────────────────────────┐  │
│  │                    Repository Layer                           │  │
│  │  session · message · summary · refresh-token                 │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
│                             │                                      │
│  ┌──────────────────────────▼───────────────────────────────────┐  │
│  │                    Prisma ORM                                │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
              ┌───────────────▼───────────────┐
              │     PostgreSQL 16 + pgvector   │
              │  users · sessions · messages   │
              │  summaries · knowledge_chunks  │
              │  refresh_tokens                │
              └───────────────────────────────┘
```

### Key Architectural Decisions

- **Service-layer separation** — Controllers handle HTTP concerns; services handle business logic; repositories handle data access. This layered architecture keeps the codebase modular and testable.
- **AI Orchestration as a composable pipeline** — The interview orchestrator composes stage detection, RAG retrieval, prompt construction, and LLM invocation as independent steps, making each component replaceable.
- **RTK Query with automatic re-auth** — The frontend uses a custom `baseQueryWithReauth` that transparently refreshes expired JWT tokens mid-request, preventing authentication interruptions during interviews.
- **Refresh token rotation** — Each token refresh atomically revokes the old token and issues a new one within a database transaction, preventing token replay attacks.

---

## ✨ Key Features

### Current Features

| Feature | Description |
|---|---|
| 🎙 **AI Interviewer** | FAANG-level system design interviewer powered by Gemini 2.5 Flash via LangChain |
| 📊 **Stage-Aware Progression** | Interview flows through 5 stages: greeting → warmup → design → deep_dive → evaluation |
| 🧠 **RAG-Enhanced Questioning** | Questions are grounded in real system design knowledge via pgvector similarity search |
| 🎤 **Voice Input** | Native speech-to-text via Expo Speech Recognition with append-on-resume behavior |
| 📝 **Structured Evaluation** | AI-generated performance summaries with strengths, missed topics, and suggestions |
| 📜 **Interview History** | Full session history with per-interview stats, scores, and performance breakdown |
| 🔐 **Dual Authentication** | Email/password registration + Google OAuth via Firebase with seamless account linking |
| 🔄 **Session Persistence** | Secure JWT access + refresh token rotation with automatic silent refresh |
| 🏠 **Dashboard** | Home screen with weekly progress tracking, recommended interviews, and quick actions |
| 🧩 **Problem Selection** | Curated system design problems (WhatsApp, Netflix, Uber, TinyURL) with difficulty ratings |

### AI Features

- **Adaptive questioning** — The AI probes deeper when answers are vague, and advances when the candidate demonstrates understanding
- **Stage-specific instructions** — Each interview stage has distinct behavioral rules controlling question style, depth, and topic focus
- **Context-aware prompts** — RAG-retrieved knowledge chunks are injected into prompts, ensuring questions reference real architectural concepts
- **Structured JSON evaluation** — End-of-session summaries are parsed via LangChain's `JsonOutputParser` for consistent formatting

### Security Features

- JWT access tokens with short expiry for API authorization
- Refresh token rotation with hash-based storage (tokens are never stored in plaintext)
- Refresh token reuse detection — if a revoked token is presented, all user sessions are invalidated
- Firebase Admin SDK server-side verification of Google ID tokens
- Zod schema validation on all API inputs with structured error responses
- Session ownership validation — users can only access their own interview data
- SecureStore (native) / AsyncStorage (web) for token persistence with automatic migration

---

## 🔍 RAG Pipeline

The Retrieval-Augmented Generation (RAG) pipeline ensures the AI interviewer asks technically grounded questions rather than generic ones. This is critical for simulating a real interviewer who has deep knowledge of distributed systems.

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│  Knowledge   │────▶│  Text Splitter  │────▶│  Gemini Embedding    │
│  Markdown    │     │  (500 chars,    │     │  001 Model           │
│  Files       │     │   50 overlap)   │     │  (768-dim vectors)   │
│              │     └─────────────────┘     └──────────┬───────────┘
│  • caching   │                                        │
│  • CAP       │                             ┌──────────▼───────────┐
│  • databases │                             │  PostgreSQL +        │
│  • load bal. │                             │  pgvector Storage    │
│  • msg queue │                             │  (vector(768))       │
└──────────────┘                             └──────────────────────┘
```

### Retrieval at Query Time

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ User message +  │────▶│ Gemini Embedding │────▶│ pgvector Cosine │
│ problem context │     │ 001 (query)      │     │ Similarity (<=>) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                              top-k chunks (k=3)
                                                          │
                                                 ┌────────▼────────┐
                                                 │ Injected into   │
                                                 │ LLM prompt as   │
                                                 │ "Technical      │
                                                 │  Context"       │
                                                 └─────────────────┘
```

### Pipeline Components

| Component | Implementation | Purpose |
|---|---|---|
| **Chunking** | `RecursiveCharacterTextSplitter` (500 chars, 50 overlap) | Splits knowledge documents into semantically meaningful chunks |
| **Embedding** | `GoogleGenerativeAIEmbeddings` (gemini-embedding-001) | Generates 768-dimensional vector representations |
| **Storage** | PostgreSQL `vector(768)` column via pgvector extension | Persistent, indexable vector storage |
| **Retrieval** | Raw SQL with `<=>` cosine distance operator | Returns top-3 most relevant chunks by similarity |
| **Augmentation** | Injected into `ChatPromptTemplate` as `{context}` | Grounds the LLM's questions in real system design concepts |

### Knowledge Base

The knowledge base covers core system design topics, each as a markdown file ingested into pgvector:

- `caching.md` — Cache strategies, eviction policies, cache-aside patterns
- `cap-theorem.md` — Consistency, availability, partition tolerance trade-offs
- `database-design.md` — SQL vs NoSQL, sharding, replication, indexing
- `load-balancing.md` — Load balancing algorithms, L4 vs L7, health checks
- `message-queues.md` — Async processing, Kafka vs RabbitMQ, delivery guarantees

---

## 🗄 Database Design

The application uses PostgreSQL 16 with the pgvector extension, managed by Prisma ORM.

```mermaid
erDiagram
    users ||--o{ interview_sessions : has
    users ||--o{ refresh_tokens : has
    interview_sessions ||--o{ interview_messages : contains
    interview_sessions ||--o| interview_summaries : produces

    users {
        int id PK
        string fullName
        string email UK
        string password
        string authProvider
        string providerId UK
        string avatarUrl
        boolean oauthEnabled
        datetime createdAt
    }

    interview_sessions {
        uuid id PK
        int userId FK
        string problemName
        string status
        string stage
        json coveredTopics
        string difficultyLevel
        datetime createdAt
    }

    interview_messages {
        uuid id PK
        uuid sessionId FK
        string role
        string content
        datetime createdAt
    }

    interview_summaries {
        uuid id PK
        uuid sessionId UK
        string strengths
        string missedTopics
        string suggestions
        datetime createdAt
    }

    knowledge_chunks {
        int id PK
        string topic
        string subtopic
        string content
        vector768 embedding
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    refresh_tokens {
        uuid id PK
        int userId FK
        string tokenHash UK
        string deviceInfo
        datetime expiresAt
        datetime createdAt
        datetime revokedAt
    }
```

### Key Design Decisions

- **Refresh token hashing** — Tokens are stored as SHA-256 hashes, so a database breach doesn't expose usable tokens
- **Cascade deletes** — Deleting a user automatically removes all their sessions, messages, summaries, and refresh tokens
- **pgvector column** — `Unsupported("vector(768)")` in Prisma maps to a native pgvector column for embedding storage
- **Stage tracking** — Sessions track their current interview stage (`greeting` → `warmup` → `design` → `deep_dive` → `evaluation`)
- **Future-ready columns** — `coveredTopics` (JSON) and `difficultyLevel` are provisioned for adaptive difficulty features

---

## 🔐 Authentication Flow

The authentication system supports two strategies with seamless account linking:

### Email/Password Flow

```
Client                    Backend                     PostgreSQL
  │                          │                            │
  │  POST /api/auth/register │                            │
  │  {email, password, name} │                            │
  │─────────────────────────▶│                            │
  │                          │  bcrypt hash password      │
  │                          │  INSERT user               │
  │                          │───────────────────────────▶│
  │                          │  Sign JWT access token     │
  │                          │  Generate refresh token    │
  │                          │  Hash + store refresh      │
  │                          │───────────────────────────▶│
  │  {accessToken,           │                            │
  │   refreshToken, user}    │                            │
  │◀─────────────────────────│                            │
  │                          │                            │
  │  Store tokens            │                            │
  │  (SecureStore/Async)     │                            │
```

### Google OAuth Flow

```
Client                 Firebase          Backend           PostgreSQL
  │                       │                 │                   │
  │  Expo AuthSession     │                 │                   │
  │  (Google OAuth)       │                 │                   │
  │──────────────────────▶│                 │                   │
  │  Google ID Token      │                 │                   │
  │◀──────────────────────│                 │                   │
  │                       │                 │                   │
  │  signInWithCredential │                 │                   │
  │──────────────────────▶│                 │                   │
  │  Firebase ID Token    │                 │                   │
  │◀──────────────────────│                 │                   │
  │                       │                 │                   │
  │  POST /api/auth/google                  │                   │
  │  {firebaseIdToken}    │                 │                   │
  │────────────────────────────────────────▶│                   │
  │                       │  Admin SDK      │                   │
  │                       │  verifyIdToken  │                   │
  │                       │◀────────────────│                   │
  │                       │  Decoded token  │                   │
  │                       │────────────────▶│                   │
  │                       │                 │  Find/create user │
  │                       │                 │  Link account     │
  │                       │                 │─────────────────▶│
  │  {accessToken,        │                 │                   │
  │   refreshToken, user} │                 │                   │
  │◀────────────────────────────────────────│                   │
```

### Token Refresh (Silent Re-authentication)

```
Client                          Backend                   PostgreSQL
  │                                │                          │
  │  API request (expired token)   │                          │
  │───────────────────────────────▶│                          │
  │  401 Unauthorized              │                          │
  │◀───────────────────────────────│                          │
  │                                │                          │
  │  POST /api/auth/refresh        │                          │
  │  {refreshToken}                │                          │
  │───────────────────────────────▶│                          │
  │                                │  Hash + lookup token     │
  │                                │─────────────────────────▶│
  │                                │  Revoke old + issue new  │
  │                                │  (atomic transaction)    │
  │                                │─────────────────────────▶│
  │  {accessToken,                 │                          │
  │   refreshToken, user}          │                          │
  │◀───────────────────────────────│                          │
  │                                │                          │
  │  Retry original request        │                          │
  │───────────────────────────────▶│                          │
```

### Account Linking

When a user registers with email/password and later signs in with Google (or vice versa), the system automatically links both auth providers to a single account based on email matching. The `authProvider` field transitions: `password` → `password_google` or `google` → `password_google`.

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new account with email/password |
| `POST` | `/api/auth/login` | ❌ | Login with email/password credentials |
| `POST` | `/api/auth/google` | ❌ | Login/register with a Firebase ID token from Google OAuth |
| `POST` | `/api/auth/refresh` | ❌ | Exchange a refresh token for new access + refresh tokens |
| `GET` | `/api/auth/me` | ✅ | Get the authenticated user's profile |
| `POST` | `/api/auth/logout` | ✅ | Revoke a specific refresh token |
| `POST` | `/api/auth/logout-all` | ✅ | Revoke all refresh tokens for the authenticated user |

### Interview Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/interview/start_session` | ✅ | Start a new interview session for a given problem |
| `POST` | `/api/interview/chat` | ✅ | Send a candidate message and receive an AI response |
| `POST` | `/api/interview/summary` | ✅ | End an interview and generate a structured evaluation |
| `GET` | `/api/interview/history` | ✅ | Retrieve all interview sessions with stats and summaries |

### Request/Response Examples

<details>
<summary><strong>POST /api/interview/start_session</strong></summary>

**Request:**
```json
{
  "problem": "Design WhatsApp"
}
```

**Response (201):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Welcome! Let's design WhatsApp together. Before we dive into the architecture, could you tell me what you think are the core features a messaging application like WhatsApp needs to support?",
  "stage": "greeting"
}
```
</details>

<details>
<summary><strong>POST /api/interview/chat</strong></summary>

**Request:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "problem": "Design WhatsApp",
  "message": "The core features would be one-on-one messaging, group chats, media sharing, and online/offline status indicators."
}
```

**Response (200):**
```json
{
  "message": "Good start! You've identified the key features. Let's think about scale — roughly how many users do you think we need to support, and what kind of message volume should we design for?",
  "stage": "warmup"
}
```
</details>

<details>
<summary><strong>POST /api/interview/summary</strong></summary>

**Response (200):**
```json
{
  "strengths": ["Good understanding of WebSocket protocols", "Solid database partitioning strategy"],
  "missed_topics": ["Message delivery guarantees", "End-to-end encryption"],
  "suggestions": ["Consider discussing CAP theorem trade-offs", "Explore CDN usage for media delivery"]
}
```
</details>

---

## 📁 Folder Structure

```
sd-sim/
├── docker-compose.yml              # Local pgvector PostgreSQL setup
│
├── backend/
│   ├── index.ts                    # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (User, Session, Message, Summary, KnowledgeChunk, RefreshToken)
│   │   └── migrations/             # Prisma migration history
│   ├── knowledge/
│   │   └── topics/                 # RAG knowledge base (markdown files)
│   │       ├── caching.md
│   │       ├── cap-theorem.md
│   │       ├── database-design.md
│   │       ├── load-balancing.md
│   │       └── message-queues.md
│   └── src/
│       ├── app.ts                  # Express app configuration
│       ├── config/
│       │   ├── auth.ts             # JWT secret configuration
│       │   ├── db.ts               # Database connection pool
│       │   ├── firebase-admin.ts   # Firebase Admin SDK initialization
│       │   ├── jwt.ts              # JWT configuration
│       │   └── prisma.ts           # Prisma client instance
│       ├── controllers/
│       │   ├── auth.controller.ts          # Auth endpoints (register, login, google, refresh, logout)
│       │   └── interview.controller.ts     # Interview endpoints (start, chat, summary, history)
│       ├── middleware/
│       │   ├── auth.middleware.ts           # JWT verification middleware
│       │   └── validate.middleware.ts       # Zod schema validation middleware
│       ├── repositories/
│       │   ├── message.repository.ts       # Interview message data access
│       │   ├── session.repository.ts       # Interview session data access
│       │   ├── summary.repository.ts       # Interview summary data access
│       │   └── refresh-token.repository.ts # Refresh token data access
│       ├── routes/
│       │   ├── auth.routes.ts              # /api/auth/* route definitions
│       │   └── interview.routes.ts         # /api/interview/* route definitions
│       ├── services/
│       │   ├── auth.service.ts             # User registration, login, Google OAuth logic
│       │   ├── auth-errors.ts              # Custom AuthServiceError class
│       │   ├── refresh-token.service.ts    # Token rotation, revocation, session management
│       │   ├── ai/
│       │   │   ├── ai.service.ts           # Summary generation via LangChain chain
│       │   │   ├── chains.ts               # LangChain chain composition (prompt → model → parser)
│       │   │   ├── interviewOrchestrator.ts# Core orchestration: stage → RAG → prompt → LLM
│       │   │   ├── model.ts                # Gemini 2.5 Flash model configuration
│       │   │   ├── parser.ts               # JsonOutputParser for structured summaries
│       │   │   ├── promptBuilder.ts        # Stage-aware ChatPromptTemplate construction
│       │   │   ├── promptTemplates.ts      # Summary evaluation prompt template
│       │   │   └── stageManager.ts         # Interview stage determination logic
│       │   └── rag/
│       │       ├── chunk.service.ts         # RecursiveCharacterTextSplitter configuration
│       │       ├── embedding.service.ts     # Gemini embedding generation (single + batch)
│       │       ├── ingestion.service.ts     # Markdown → chunk → embed → pgvector pipeline
│       │       └── retriever.service.ts     # Cosine similarity search via pgvector
│       ├── utils/
│       │   ├── llm.ts                      # LLM response text extraction
│       │   ├── password.ts                 # bcrypt hash/compare utilities
│       │   └── token.ts                    # JWT signing, refresh token generation, hashing
│       └── validation/
│           └── auth.validation.ts          # Zod schemas for auth endpoints
│
└── frontend/
    ├── app.config.js                       # Expo configuration with env var mapping
    ├── package.json
    ├── app/
    │   ├── _layout.tsx                     # Root layout with AuthGuard and splash screen
    │   ├── index.tsx                       # Root redirect
    │   ├── expo-auth-session.tsx            # OAuth redirect handler
    │   ├── (auth)/
    │   │   ├── _layout.tsx                 # Auth stack layout
    │   │   ├── login.tsx                   # Login screen (email/password + Google)
    │   │   ├── register.tsx                # Registration screen
    │   │   └── google-signin.tsx           # Google sign-in handler
    │   ├── (main)/
    │   │   ├── _layout.tsx                 # Bottom tab navigator (Home, History, Profile)
    │   │   ├── home.tsx                    # Dashboard with progress + recommended topics
    │   │   ├── history.tsx                 # Interview history with stats
    │   │   ├── practice.tsx                # Practice screen (future expansion)
    │   │   └── profile.tsx                 # User profile and settings
    │   └── (interview)/
    │       ├── _layout.tsx                 # Interview stack layout
    │       ├── problem-selection.tsx        # System design problem picker
    │       ├── session.tsx                 # Live interview chat with voice input
    │       └── summary.tsx                 # Post-interview evaluation display
    └── src/
        ├── components/
        │   ├── LoadingSplash.tsx            # Animated splash screen
        │   ├── FullScreenLoader.tsx         # Loading overlay
        │   └── ScreenWrapper.tsx            # Safe area wrapper
        ├── config/
        │   ├── api.ts                      # API URL resolution
        │   └── firebase.ts                 # Firebase client configuration
        ├── constants/
        │   └── Colors.ts, Layout.ts        # Design tokens
        ├── redux/
        │   ├── store.ts                    # Redux store configuration
        │   ├── hooks.ts                    # Typed useAppDispatch/useAppSelector
        │   ├── api/
        │   │   ├── baseQuery.ts            # RTK Query base with automatic re-auth
        │   │   └── interview_api.ts        # Interview API endpoints (RTK Query)
        │   └── slices/
        │       ├── auth.ts                 # Auth state (bootstrap, login, register, logout)
        │       ├── session.ts              # Active interview session state
        │       └── problem.ts              # Selected problem state
        ├── services/
        │   ├── auth.api.ts                 # Auth HTTP client (fetch-based)
        │   └── googleAuth.ts              # Expo AuthSession + Firebase Google OAuth
        ├── storage/
        │   └── authStorage.ts              # SecureStore/AsyncStorage with migration
        ├── types/
        │   └── types.ts                    # TypeScript interfaces
        └── utils/                          # Utility functions
```

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for native builds with speech recognition)
- Firebase project with Google OAuth configured
- Google AI Studio API key (Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/Priyansh-dabhi/system-design-interview-simulator.git
cd system-design-interview-simulator
```

### 2. Start the Database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance with the pgvector extension on port `5433`.

### 3. Backend Setup

```bash
cd backend
npm install

# Configure environment variables (see section below)
cp .env.example .env   # Create from template, then fill in values

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Start the development server
npm run dev
```

The backend will be running at `http://localhost:4500`.

### 4. Frontend Setup

```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env   # Fill in API_URL, Firebase config, Google OAuth client IDs

# Start the Expo dev server
npx expo start
```

> **Note:** Voice input (speech recognition) requires a native development build. Run `npx expo prebuild && npx expo run:android` for full functionality.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://sd_user:sd_password@localhost:5433/sd_interview

# Server
PORT=4500

# JWT
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# AI
GEMINI_API_KEY=your-google-ai-studio-api-key

# Firebase Admin (use ONE of the following methods)
# Method 1: JSON string
FIREBASE_SERVICE_ACCOUNT_JSON={"project_id":"...","client_email":"...","private_key":"..."}

# Method 2: Individual fields
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Method 3: Credential file path
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Frontend (`frontend/.env`)

```env
# Backend API
API_URL=http://localhost:4500
EXPO_PUBLIC_API_URL=http://localhost:4500

# Firebase Client
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abcdef

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

---

## ☁️ Deployment

### Backend (Render)

The backend is deployed on [Render](https://render.com) as a web service:

- **Build command:** `npm install && npx prisma generate && npx tsc`
- **Start command:** `npx prisma migrate deploy && node dist/index.js`
- **Environment:** Node.js
- **Database:** Render PostgreSQL with pgvector extension enabled

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after a cold start may take 30–60 seconds while the server wakes up.

### Database (PostgreSQL + pgvector)

- **Local:** Docker Compose with `pgvector/pgvector:pg16` image
- **Production:** Render managed PostgreSQL with the `vector` extension enabled via Prisma schema configuration

### Mobile (Expo EAS)

- Development builds via `eas build --profile development`
- Native modules (speech recognition) require a development build, not Expo Go

---

## 📸 Demo & Screenshots

<!-- 
Add screenshots and demo recordings here.
Recommended sections:

- Login / Registration screen
- Home dashboard
- Problem selection
- Live interview chat
- Voice input in action
- AI evaluation summary
- Interview history

Example format:
![Login Screen](https://res.cloudinary.com/your-cloud/image/upload/v1/screenshots/login.png)
![Interview Session](https://res.cloudinary.com/your-cloud/image/upload/v1/screenshots/session.png)
-->

> 📌 **Screenshots and demo video coming soon.** Check back for a visual walkthrough of the complete interview flow.

---

## 🏆 Engineering Highlights

| Area | What's Notable |
|---|---|
| **AI Orchestration** | Composable pipeline: stage manager → RAG retriever → prompt builder → LLM chain. Each component is independent and replaceable. |
| **RAG Implementation** | Full ingestion pipeline (markdown → chunk → embed → store) + cosine similarity retrieval via raw pgvector SQL, integrated into the LLM prompt construction. |
| **Vector Search** | Native PostgreSQL pgvector with 768-dimensional embeddings and cosine distance operator, avoiding external vector DB dependencies. |
| **Auth Architecture** | Dual-strategy auth (email + Google OAuth) with automatic account linking, refresh token rotation in atomic DB transactions, and reuse detection. |
| **Token Security** | Refresh tokens are SHA-256 hashed before storage. Reuse of a revoked token triggers a full session invalidation across all devices. |
| **Frontend State** | RTK Query with a custom `baseQueryWithReauth` that transparently handles 401s by refreshing tokens and retrying the original request — zero user-facing interruption. |
| **Interview Stages** | 5-stage progression system with distinct behavioral instructions per stage, creating a realistic interview arc from introductions to deep technical probing. |
| **Voice UX** | Speech recognition with append-on-resume — stopping and restarting the mic continues from where the user left off rather than overwriting previous text. |
| **Modular Backend** | Clean controller → service → repository separation with Zod validation middleware, enabling independent testing and modification of each layer. |

---

## 🔮 Future Improvements

| Feature | Description |
|---|---|
| 🗣️ **AI Voice Interviewer** | Text-to-speech for AI responses, creating a fully conversational interview experience |
| 🎨 **Whiteboarding** | In-app drawing canvas for architecture diagrams during interviews |
| 📊 **Analytics Dashboard** | Performance trends across sessions, topic-level heatmaps, and improvement tracking |
| ⚡ **Streaming Responses** | Server-sent events for real-time AI response streaming |
| 🎚️ **Difficulty Levels** | User-selectable difficulty that adjusts question depth and expected answer sophistication |
| 🖼️ **Multimodal Analysis** | Upload architecture diagrams for AI evaluation using Gemini's vision capabilities |
| 🔀 **Multi-Model Support** | Swap between Gemini, GPT-4, Claude, or local LLMs via the LangChain abstraction |
| 🧩 **Constraint Injection** | Mid-interview curveballs ("Now assume your system needs to handle 10x traffic in 3 months") |
| 📈 **Performance Scoring** | Quantitative scoring rubric aligned with real FAANG evaluation criteria |
| 🌐 **Expanded Problem Set** | Community-contributed system design problems with categorization and tagging |

---

<div align="center">

Built with ❤️ as a full-stack AI engineering project combining mobile development, backend architecture, LLM orchestration, and vector search.

**[⬆ Back to Top](#-ai-system-design-interview-simulator)**

</div>
