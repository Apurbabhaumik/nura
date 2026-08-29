<div align="center">

# N U R A
**Stop Memorizing. Start Compiling.**

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-FF5252?style=for-the-badge&logo=database)](https://qdrant.tech/)
[![AWS](https://img.shields.io/badge/AWS-ECS_|_S3-232F3E?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![CI/CD](https://img.shields.io/badge/Jenkins-Automated-D24939?style=for-the-badge&logo=jenkins&logoColor=white)]()

An elite, locally-powered AI learning engine designed to transform how students acquire and retain deep technical knowledge. Built with a monochromatic brutalist design philosophy inspired by world-class engineering tools.

</div>

---

## ⚡ The Philosophy

Traditional learning platforms treat students as passive readers. NURA treats the human brain like a compiler. It requires active verification of concepts through **Active Recall**, **Spaced Repetition**, and **Knowledge Graphs**. 

By leveraging local AI inference running directly in the browser, NURA provides a $100M SaaS-level experience that remains **completely free** for students, bypassing massive cloud API costs.

## 🚀 Core Features

- **Automated Curriculum Ingestion (RAG):** Input a GitHub repo URL or upload a PDF. NURA parses, chunks, and vectorizes the content to generate a complete syllabus.
- **Visual Knowledge Graphs:** Track your mastery visually. Nodes turn stark white upon mastery and dark grey when weak, requiring review.
- **Active Recall Engine:** Integrated Cloze Deletions (fill-in-the-blank) and dynamically generated Flashcards force memory retrieval.
- **Local AI Tutor:** A chat interface grounded in your ingested material with exact citations. Runs locally for zero latency and zero cost.
- **Adaptive Difficulty (ELI5):** Seamlessly toggle the complexity of technical reading material for immediate conceptual understanding.
- **P2P Community Hub:** Download pre-indexed 1536d vector spaces (e.g., "MIT 6.006", "React 19 Docs") shared by peers.
- **Godmode Command Palette:** Hit `Ctrl + K` (or `Cmd + K`) anywhere to instantly summon a power-user overlay for frictionless navigation without touching your mouse.

## 🏗️ Architecture & Tech Stack

NURA is engineered for extreme performance, utilizing a modern, decoupled architecture.

### Frontend (Client Engine)
- **Framework:** Next.js 14 (React)
- **Design System:** Pure Vanilla CSS (Monochromatic Brutalism, custom spring-physics animations).
- **Local Inference:** `Transformers.js` / `WebLLM` for in-browser AI processing.

### Backend (RAG Pipeline)
- **Framework:** NestJS (TypeScript Modular Monolith).
- **Queue System:** BullMQ & Redis for heavy asynchronous ingestion tasks.

### Data & Infrastructure
- **Databases:** PostgreSQL (Relational Data), Qdrant (Vector Embeddings).
- **Cloud:** AWS ECS (Container Compute), AWS S3 (Blob Storage).
- **Observability:** Prometheus for aggressive telemetry scraping and performance monitoring.
- **CI/CD:** Jenkins pipelines for automated testing, building, and zero-downtime deployments.

---

## 🛠️ Getting Started (Local Development)

Follow these steps to spin up the NURA engine locally.

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for PostgreSQL, Redis, Qdrant)

### 1. Clone the Repository
```bash
git clone https://github.com/Apurbabhaumik/nura.git
cd nura
```

### 2. Start the Backend Infrastructure
Spin up the required databases using Docker Compose.
```bash
docker-compose up -d
```

### 3. Setup the Frontend
Install dependencies and start the Next.js development server.
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000`. Hit `Ctrl + K` to test the command palette!

---

## 🔄 CI/CD Workflows

NURA utilizes **Jenkins** for its deployment pipeline.

1. **Push to `main`:** Triggers the Jenkins webhook.
2. **Test Phase:** Runs Jest unit tests and ESLint validation across both Frontend and Backend workspaces.
3. **Build Phase:** Compiles Next.js static assets and builds NestJS binaries. Generates isolated Docker images.
4. **Deploy Phase:** Pushes images to AWS ECR and triggers a rolling update on AWS ECS clusters.

---

## 🤝 Contributing

We welcome contributions to make NURA the ultimate learning tool. 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <sub>Built for students who want to master the machine.</sub>
</div>
