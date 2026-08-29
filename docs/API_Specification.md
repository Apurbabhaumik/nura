# API Specification - TeachStack

This document outlines the OpenAPI-compatible REST API endpoints for the TeachStack platform. All request and response bodies use the `application/json` content type unless specified otherwise.

---

## 1. Authentication (`/auth`)

### POST `/auth/register`
Creates a new user profile.
- **Request Body**:
  ```json
  {
    "name": "Sarah Developer",
    "email": "sarah@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "e00f92b7-a3f1-435f-bf9d-f682cf8c5750",
    "name": "Sarah Developer",
    "email": "sarah@example.com",
    "role": "student",
    "createdAt": "2026-07-30T16:11:00Z"
  }
  ```

### POST `/auth/login`
Authenticates a user and returns access/refresh tokens.
- **Request Body**:
  ```json
  {
    "email": "sarah@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey...",
    "user": {
      "id": "e00f92b7-a3f1-435f-bf9d-f682cf8c5750",
      "email": "sarah@example.com",
      "role": "student"
    }
  }
  ```

---

## 2. Workspace (`/workspace`)

### GET `/workspace`
Lists all workspaces owned by the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  [
    {
      "id": "9ef6a83d-3b7c-4824-a212-07a8fc52e690",
      "ownerId": "e00f92b7-a3f1-435f-bf9d-f682cf8c5750",
      "name": "My Tech Sandbox",
      "createdAt": "2026-07-30T16:11:00Z"
    }
  ]
  ```

### POST `/workspace`
Creates a new workspace.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Academics"
  }
  ```
- **Response** (201 Created)

---

## 3. Course (`/course`)

### POST `/course`
Creates a manual or scaffolded course outline.
- **Request Body**:
  ```json
  {
    "workspaceId": "9ef6a83d-3b7c-4824-a212-07a8fc52e690",
    "title": "Rust Programming Guide",
    "description": "Learn memory safety and concurrency",
    "difficulty": "intermediate",
    "visibility": "private"
  }
  ```
- **Response** (201 Created)

---

## 4. Ingestion / Upload (`/upload`)

### POST `/upload`
Requests a pre-signed URL to upload a document to AWS S3.
- **Request Body**:
  ```json
  {
    "courseId": "db71cc16-2de5-455b-b9d9-4b8ef0b3d810",
    "filename": "rust_tutorial.pdf",
    "contentType": "application/pdf"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "uploadId": "50e7b789-51d1-419b-abfc-f8a4ef73bdf0",
    "s3Key": "courses/db71cc16-2de5-455b-b9d9-4b8ef0b3d810/rust_tutorial.pdf",
    "uploadUrl": "https://teachstack-uploads.s3.amazonaws.com/courses/..."
  }
  ```

---

## 5. AI Ingestion / Processing (`/ai`)

### POST `/ai/generate-course`
Triggers background parsing and automatic course creation from an uploaded file.
- **Request Body**:
  ```json
  {
    "uploadId": "50e7b789-51d1-419b-abfc-f8a4ef73bdf0"
  }
  ```
- **Response** (202 Accepted):
  ```json
  {
    "status": "PROCESSING",
    "message": "Ingestion job queued successfully.",
    "jobId": "bullmq_job_102"
  }
  ```

### POST `/ai/chat`
Ask the course's RAG tutor a clarifying question.
- **Request Body**:
  ```json
  {
    "courseId": "db71cc16-2de5-455b-b9d9-4b8ef0b3d810",
    "question": "Explain ownership rules in Rust."
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "answer": "Ownership in Rust is a core concept that allows memory safety without a garbage collector. It operates on three rules: 1. Each value has an owner. 2. There can only be one owner at a time. 3. When the owner goes out of scope, the value is dropped.",
    "citations": [
      {
        "uploadId": "50e7b789-51d1-419b-abfc-f8a4ef73bdf0",
        "pageNumber": 12,
        "textSnippet": "Each value in Rust has an owner..."
      }
    ]
  }
  ```
