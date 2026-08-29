# DevOps Handbook - TeachStack

This handbook contains Docker configurations, CI/CD configurations, local development compose specs, and AWS ECS cloud infrastructure plans.

---

## 1. Containerization

We use multi-stage Docker builds to keep final production images clean and small.

### NestJS Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 2. Local Infrastructure (`docker-compose.yml`)

This environment configures the auxiliary services required for local development.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: teachstack-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: teachstack_user
      POSTGRES_PASSWORD: secure_local_db_pass
      POSTGRES_DB: teachstack_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: teachstack-redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  qdrant:
    image: qdrant/qdrant:latest
    container_name: teachstack-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrantdata:/qdrant/storage

volumes:
  pgdata:
  redisdata:
  qdrantdata:
```

---

## 3. CI/CD Pipeline (GitHub Actions)

This pipeline builds, tests, and prepares docker images for deployment to Amazon ECR.

```yaml
name: TeachStack CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run Linters & Tests
      run: |
        npm run lint
        npm run test

  deploy-aws:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build and Push Docker Image
      run: |
        docker build -t ${{ steps.login-ecr.outputs.registry }}/teachstack-backend:latest ./backend
        docker push ${{ steps.login-ecr.outputs.registry }}/teachstack-backend:latest
```

---

## 4. AWS Production Architecture

TeachStack uses **AWS ECS Fargate** to run serverless containers. This removes the overhead of maintaining EC2 host nodes.

```
                  ┌──────────────────────┐
                  │ Internet / Router    │
                  └──────────┬───────────┘
                             │ HTTPS
                             ▼
                  ┌──────────────────────┐
                  │ Application Load     │
                  │ Balancer (ALB)       │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            │ Private Subnets                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ ECS Fargate Tasks     │         │ ECS Fargate Tasks     │
│ (Web API Service)     │         │ (Queue Worker Service)│
└───────────┬───────────┘         └───────────┬───────────┘
            │                                 │
            └────────┬────────────────────────┘
                     │ Private Network Lookups
                     ▼
┌─────────────────────────────────────────────────────────┐
│ AWS Managed Storage Services                            │
├───────────────┬─────────────────┬───────────────────────┤
│ Amazon RDS    │ Amazon Elasti-  │ Amazon Qdrant Cluster │
│ (PostgreSQL)  │ Cache (Redis)   │ (ECS / Vector DB)     │
└───────────────┴─────────────────┴───────────────────────┘
```
