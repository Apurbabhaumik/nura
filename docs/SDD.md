# System Design Document (SDD) - TeachStack

## 1. High-Level Architecture
TeachStack starts as a modular monolith written in TypeScript using NestJS, laying the groundwork for a transition to a microservices architecture. It separates domain logic into distinct, loosely-coupled modules that communicate via clean typescript interfaces and event emitter queues.

```mermaid
graph TD
    %% Clients
    Browser[Next.js Frontend] -->|HTTPS / WSS| APIGateway[API Gateway / NestJS Controller]
    Mobile[Mobile Client] -->|HTTPS / WSS| APIGateway

    subgraph "NestJS Modular Monolith"
        APIGateway --> AuthMod[Auth Module]
        APIGateway --> CourseMod[Course Module]
        APIGateway --> UploadMod[Upload Module]
        APIGateway --> AIMod[AI Engine Module]
        APIGateway --> QuizMod[Quiz Module]
        APIGateway --> AnalyticsMod[Analytics Module]

        %% Cross-Module Communication
        UploadMod -->|Emits events| Queue[(Redis / BullMQ)]
        Queue -->|Trigger jobs| WorkerService[Worker Service]
        WorkerService --> ParserMod[Parser Module]
        WorkerService --> EmbedMod[Embedding Worker]
        WorkerService --> AIMod
    end

    %% External & Storage Layers
    AuthMod -->|Sessions/Cache| Redis[(Redis Cache)]
    CourseMod -->|Read/Write Schema| Postgres[(Postgres DB)]
    UploadMod -->|Object Storage| S3[AWS S3 Bucket]
    AIMod -->|Retrieve/Search| Qdrant[(Qdrant Vector DB)]
    AIMod -->|Inference APIs| OpenAI[OpenAI / Anthropic APIs]
```

---

## 2. Ingestion & AI Pipeline Data Flow
Processing documents asynchronously ensures reliability, scalability, and an excellent user experience. 

```mermaid
sequenceDiagram
    autonumber
    actor User as Client UI
    participant Gateway as API Gateway
    participant Upload as Upload Module
    participant S3 as AWS S3
    participant Queue as BullMQ (Redis)
    participant Worker as Worker Thread
    participant Parser as Parser Service
    participant VectorDB as Qdrant
    participant LLM as LLM Engine

    User->>Gateway: POST /upload (filename, contentType)
    Gateway->>Upload: Request Presigned URL
    Upload-->>User: S3 Presigned URL & Upload ID
    User->>S3: PUT File (Binary Upload)
    S3-->>User: 200 OK (Uploaded)
    User->>Gateway: POST /upload/status (Confirm upload complete)
    Gateway->>Upload: Update status to 'UPLOADED'
    Upload->>Queue: Push Job {uploadId, s3Key, fileType}
    Queue-->>User: Processing Started (WebSocket / Polling)

    Note over Queue, Worker: Async Ingestion Loop
    Queue->>Worker: Poll next task
    Worker->>S3: Download File Stream
    Worker->>Parser: Extract Text Content (PDF/DOCX/OCR)
    Parser-->>Worker: Clean Text String
    Worker->>Worker: Chunk Text (Recursive Splitter)
    Worker->>LLM: Generate Vector Embeddings (1536d)
    LLM-->>Worker: Dense Vectors
    Worker->>VectorDB: Insert Chunk Embeddings with Metadata
    Worker->>LLM: Scaffold Course JSON (Syllabus/Lessons/Quizzes)
    LLM-->>Worker: Validated JSON structure
    Worker->>Gateway: Store Course & Modules to PostgreSQL
    Worker->>Queue: Complete job (Emit success)
```

---

## 3. Module & Service Decomposition

### Auth Module
- **Responsibilities**: Registration, login, JWT issuance, refresh tokens, role-based access control (RBAC).
- **Security**: Password hashing using bcrypt, rate-limiting on endpoints, session revocation.

### Upload Module
- **Responsibilities**: Mime-type checking, pre-signed URL generation, malware checks, storage lifecycle config.
- **Security**: Signed URLs with expiration (5 mins), strict file size limits (<50MB).

### Parser Module
- **Responsibilities**: Standardizing diverse formats (PDF, DOCX, PPTX, GitHub text contents, YouTube transcript scraper) into clean text strings.
- **Processors**: PDF-Parse, Docx-parser, Mammoth, Puppeteer (Web scraping), OCR (Tesseract).

### AI Engine Module (RAG)
- **Responsibilities**: Chunking strategy execution, embedding creation, vector index management, retrieval prompt synthesis.
- **Components**: Vector search client (Qdrant), chunking utilities, LLM driver interfaces.

### Course Module
- **Responsibilities**: Storing and serving the generated hierarchical curriculum (Course -> Module -> Lesson -> Flashcard).
- **Operations**: Outline CRUD, lesson content updates, roadmap progression.

### Tutor & Quiz Modules
- **Responsibilities**: Retrieval-Augmented Generation (RAG) chat sessions with context citations; MCQ, coding, and subjective quiz generation and evaluation.

### Analytics Module
- **Responsibilities**: Daily streak tracking, lesson completion progress, study duration calculations, and identification of conceptual weak areas.

---

## 4. Scalability & Event Strategy
- **Decoupled Workers**: The workers executing heavy tasks (parsing, LLM calls, embedding generation) run as separate node processes. They can scale horizontally on ECS based on BullMQ queue depth.
- **Caching Layer**: Redis caches database query results for courses/lessons, rate limit counters, user sessions, and locks to prevent duplicate course generations.
- **Vector Index Optimization**: Qdrant runs with HNSW indexes configured for fast cosine-similarity search, filtered by metadata (e.g., `course_id`, `workspace_id`).
