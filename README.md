# 🎬 Movie Memory — Full-Stack AI Application

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-green)
![OpenAI](https://img.shields.io/badge/OpenAI-API-purple)

A full-stack web application that allows users to authenticate via Google, store their favorite movie, and generate AI-powered fun facts with backend caching and concurrency control.

---

# 🚀 Features

### 🔐 Authentication
- Google OAuth login (NextAuth/Auth.js)
- Secure session handling
- Protected routes

---

### 🧾 Onboarding
- First-time users provide their favorite movie
- Server-side validation:
  - trimmed input
  - min/max length enforced
- Stored in PostgreSQL via Prisma

---

### 📊 Dashboard
Displays:
- User name
- Email
- Profile photo (fallback if unavailable)
- Favorite movie
- Logout button

---

### 🤖 AI Fact Generation
- Generates fun facts using OpenAI API
- Stores facts in database
- Supports repeated generation

---

# ⚡ Variant Chosen

## ✅ Variant A — Backend-Focused (Caching & Correctness)

I chose Variant A to demonstrate backend correctness, caching strategies, and concurrency handling. This aligns with my interest in backend systems and scalable architectures.

---

# ⚙️ Variant A Implementation

## ⏱️ 1. 60-Second Cache Window

- Retrieves latest fact for `(userId + movie)`
- If within 60 seconds → returns cached result
- Else → generates new fact and stores it

✅ Reduces API calls  
✅ Improves performance  

---

## 🔒 2. Concurrency / Burst Protection

Implemented using a **database-backed lock (`isGenerating`)**

### Approach:
- Acquire lock via atomic DB update (`updateMany`)
- If another request is generating:
  - wait briefly (polling)
  - reuse cached result if available

### Prevents:
- duplicate OpenAI calls
- race conditions from rapid refresh / multi-tabs

---

## 🛟 3. Failure Handling

If OpenAI fails:
- return most recent cached fact (if exists)
- otherwise return user-friendly error

---

## 🧪 4. Backend Tests

Implemented using Jest:

- ✅ Cache logic test (ensures reuse within 60 seconds)
- ✅ Authorization test (ensures user isolation)

---

## 🧠 Architecture & Fact Generation Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Next.js API Route
    participant Service as Fact Service Layer
    participant DB as PostgreSQL (Prisma)
    participant OpenAI

    Client->>API: Request /api/fact
    API->>Service: getMovieFactForUser()

    Service->>DB: Fetch latest fact (userId + movie)

    alt Cached fact < 60s
        DB-->>Service: Return latest fact
        Service-->>API: Return cached fact
        API-->>Client: JSON response
    else No valid cache
        Service->>DB: Check isGenerating flag

        alt Another request generating
            Service->>Service: Wait (polling)
            Service->>DB: Re-check latest fact
            DB-->>Service: Return newly generated fact
            Service-->>API: Return cached-after-wait
            API-->>Client: JSON response
        else No active generation
            Service->>DB: Acquire lock (isGenerating = true)

            Service->>OpenAI: Generate movie fact

            alt OpenAI success
                OpenAI-->>Service: Return fact text
                Service->>DB: Save fact
                Service->>DB: Release lock (isGenerating = false)
                Service-->>API: Return generated fact
                API-->>Client: JSON response
            else OpenAI failure
                Service->>DB: Fetch last cached fact
                alt Cached exists
                    DB-->>Service: Return fallback fact
                    Service->>DB: Release lock
                    Service-->>API: Return fallback
                    API-->>Client: JSON response
                else No fallback
                    Service->>DB: Release lock
                    Service-->>API: Return error
                    API-->>Client: Error response
                end
            end
        end
    end

    Client->>Client: Render fact in UI
```
This diagram reflects the Variant A implementation, including caching, concurrency control, and failure handling mechanisms.


---

## 🔁 Fact Generation Flow

1. User requests `/api/fact`
2. Backend checks latest stored fact
3. If within 60 seconds → return cached
4. Else:
   - acquire lock
   - generate new fact via OpenAI
   - store in DB
   - release lock
5. If OpenAI fails → fallback to last cached fact

---

# ⚖️ Key Tradeoffs

| Decision | Reason | Tradeoff |
|--------|------|---------|
| DB-based locking | Simple and reliable | Not ideal for distributed systems |
| Polling for lock | Easy to implement | Slight latency overhead |
| Server-side caching | Strong consistency | No cross-instance caching |

---

# 🚀 Improvements (With More Time)

- Redis-based distributed locking
- Background job queue (BullMQ / SQS)
- Rate limiting per user
- Streaming OpenAI responses
- Observability (logging, tracing)

---

# 🛠️ Setup Instructions

## 1. Clone repository

```bash
git clone https://github.com/GowthamU7/movie-memory
cd movie-memory

npm install
```

## 2. Create .env

```bash
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=
```

## 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

## 4. Run Application

```bash

npm run dev
npm test
```

🔐 Security Considerations

```bash

  Server-side validation of user input
  Users cannot access other users’ data
  Secrets stored only in environment variables
  Graceful handling of missing profile data

```

🤖 AI Usage Disclosure

```bash
  AI tools were used to:
    assist with project scaffolding
    validate implementation approaches
    improve code clarity and documentation
  All design decisions, logic, and tradeoffs were fully reviewed and understood
```

🏁 Summary

```bash
This project demonstrates:

  Full-stack application development
  Secure authentication and data handling
  Backend caching strategies
  Concurrency control and idempotency
  Resilient AI integration
  Clean, testable architecture
```
