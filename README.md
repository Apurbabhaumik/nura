<div align="center">

# N U R A
### Stop Memorizing. Start Compiling.

AI-powered personal learning and knowledge workspace.

</div>

---

## What is NURA?

NURA turns a learner's technical knowledge sources into a structured workspace for studying, asking grounded questions, taking assessments, and tracking progress.

The product is designed around three principles:

- **Grounded learning** — answers should be tied to the user's learning material rather than generic chat.
- **Active recall** — assessments and flashcards reinforce retrieval instead of passive reading.
- **Measurable progress** — study activity and lesson completion are persisted and exposed through analytics.

## Current architecture

| Layer | Technology |
| --- | --- |
| Web application | Next.js 14 + React + TypeScript |
| API | NestJS + TypeScript |
| Authentication | JWT + Passport + bcrypt |
| Database | PostgreSQL + Prisma |
| Rate limiting | NestJS Throttler |
| Vector infrastructure | Qdrant (provisioned locally; application integration in progress) |
| Async infrastructure | Redis (provisioned locally; queue workers in progress) |
| Containers | Docker + Docker Compose |
| CI | GitHub Actions |

## Production-minded foundations

NURA includes several foundations expected in a serious application:

- DTO validation with whitelisting and rejected unknown fields.
- JWT-protected API routes and ownership checks around user workspaces and courses.
- PostgreSQL persistence through Prisma.
- Global API rate limiting.
- Request IDs for tracing individual HTTP requests.
- Restrictive CORS configuration driven by environment variables.
- Baseline HTTP security headers.
- Liveness (`/api/health`) and dependency readiness (`/api/ready`) endpoints.
- Graceful application shutdown hooks.
- Docker health checks and dependency-aware service startup.
- Separate frontend build-time API configuration.
- Global frontend error and loading states.
- Dependency audits and Docker builds in CI.
- Environment templates instead of committing application secrets.

## Product areas

The application currently contains the foundations for:

- Authentication and registration
- Personal workspaces
- Course creation and management
- Document/source ingestion UI
- AI tutor interface
- Lessons and reader experience
- Quizzes and flashcards
- Progress tracking
- Analytics

### Important implementation status

Some infrastructure and product surfaces are intentionally being hardened before being presented as production-ready. In particular, the ingestion pipeline, embedding provider, Qdrant indexing, grounded RAG generation, and asynchronous workers are being completed as real services rather than represented by demo data.

That distinction is intentional: NURA should fail clearly when a dependency is unavailable instead of silently returning fabricated results.

## Local development

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### 1. Configure environment

Copy the example environment file and replace development secrets as appropriate:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### 2. Start the stack

```bash
docker compose up -d --build
```

Services:

- Frontend: `http://localhost:3001`
- API: `http://localhost:3000`
- API health: `http://localhost:3000/api/health`
- API readiness: `http://localhost:3000/api/ready`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Qdrant: `localhost:6333`

### 3. Database

For a development schema sync:

```bash
docker compose exec backend npx prisma db push
```

For production, use reviewed Prisma migrations rather than `db push`.

### 4. Useful commands

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

## CI

Every push to `main` and pull request targeting `main` runs GitHub Actions to:

1. Install backend dependencies with `npm ci`.
2. Generate the Prisma client.
3. Build the NestJS API.
4. Audit backend dependencies.
5. Build the Next.js application.
6. Audit frontend dependencies.
7. Build both production Docker images.

Cloud deployment is deliberately not claimed until the required AWS infrastructure and credentials are configured for the project.

## Roadmap to full production

- Real PDF, GitHub, and YouTube extraction
- Production embedding provider
- Qdrant collection lifecycle and persistent indexing
- Grounded RAG with source-level citations
- Redis/BullMQ ingestion workers
- Persistent quiz attempts and lesson progress
- Observability with structured logs, metrics, and tracing
- Automated end-to-end tests
- Managed PostgreSQL/Redis/Qdrant deployment
- Production object storage for uploads
- CI deployment after infrastructure is provisioned

## Contributing

Create a feature branch, keep changes focused, run the local build, and open a pull request against `main`.

---

<div align="center">
  <sub>Built for students who want to master the machine.</sub>
</div>
