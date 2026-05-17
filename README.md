# 🚀 AI System Design Interview Simulator

An AI-powered mobile application that simulates real system design interviews by dynamically probing a candidate’s architectural reasoning and decision-making.

Built to mimic real-world interview flow with adaptive questioning, structured conversation tracking, and automated evaluation summaries.

---

## 📱 Tech Stack

Frontend:
- React Native (Expo)
- TypeScript
- Redux Toolkit (State Management)

Backend:
- Node.js
- Express.js
- JWT Authentication

Database:
- PostgreSQL (Dockerized locally)
- Relational schema for sessions, messages, and summaries

AI Layer:
- LangChain (Chains + Prompt Templates)
- Google Gemini 2.5 Flash
- Structured JSON Output Parsing

---

## 🎯 Key Features

• Start structured system design interview sessions  
• Adaptive AI follow-up questioning  
• Real-time conversational flow simulation  
• Persistent session lifecycle management  
• Structured evaluation summary generation  
• Secure JWT-based authentication  
• PostgreSQL-backed chat and summary storage  

---

## 🧠 How It Works

1. User starts a new interview session.
2. Backend creates a session record in PostgreSQL.
3. AI generates an opening system design question.
4. User responses are stored in the database.
5. LangChain constructs prompt chains using conversation history.
6. Gemini generates adaptive follow-up questions.
7. On completion, a structured summary is generated:
   - Strengths
   - Missed Topics
   - Suggestions

All conversations and summaries are persistently stored.

---

## 🗄 Database Design

### interview_sessions
- id (UUID)
- user_id
- problem_name
- status (active/completed)
- created_at

### interview_messages
- id (UUID)
- session_id
- role (user/ai)
- content
- created_at

### interview_summaries
- id (UUID)
- session_id
- strengths (JSONB)
- missed_topics (JSONB)
- suggestions (JSONB)
- created_at

---

## 🔐 Authentication

- JWT-based authentication
- Middleware-protected routes
- Secure session ownership validation

---

## 🧩 Architecture Overview

Mobile App → Express API → PostgreSQL  
                      ↘ LangChain → Gemini API

The AI layer is abstracted via service modules to maintain separation of concerns and scalability.

---

## 📦 API Endpoints

POST /api/interview/start_session  
POST /api/interview/interview_chat  
POST /api/interview/interview_summary  

---

## 💡 Why This Project?

System design interviews test:
- Problem clarification
- Architectural thinking
- Trade-off analysis
- Scalability reasoning

This simulator helps candidates:
- Practice structured thinking
- Identify knowledge gaps
- Receive structured feedback
- Improve real interview performance

---

## 🚀 Future Improvements

- Streaming AI responses
- RAG-based knowledge enhancement
- Interview difficulty levels
- Performance analytics dashboard
- Multi-problem expansion
- Cloud deployment (Docker + CI/CD)

---

## 🏆 Highlights

• Full-stack architecture  
• AI-integrated production flow  
• Structured database modeling  
• JWT-secured API  
• Clean separation of frontend, backend, and AI layers  

---

Built as part of an effort to combine mobile development, backend architecture, and generative AI into a real-world interview simulation tool.
