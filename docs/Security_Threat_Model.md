# Security & Threat Model - TeachStack

This document outlines the security architecture, threat model using the STRIDE methodology, Role-Based Access Control (RBAC) specifications, and implementation details for authentication, file security, and API defenses.

---

## 1. STRIDE Threat Model Matrix

| Threat Category | Potential Threat | TeachStack Mitigation Strategy |
|---|---|---|
| **Spoofing** | Attackers forge JWT access tokens to impersonate other students. | Signed asymmetric keys (RS256) or secure HMAC secrets (HS256) stored in AWS Secrets Manager; tokens expire in 15 minutes. |
| **Tampering** | Malicious users upload tampered document binary inputs to trigger Buffer Overflow. | Pre-signed URL uploads directly to isolated S3 buckets; backend validates Content-Length headers and runs file type sniffing (MIME verification). |
| **Repudiation** | User deletes courses or updates access keys without any audit trail. | Log system captures user actions (excluding sensitive payloads) via AWS CloudWatch/Winston with write-once permissions. |
| **Info Disclosure** | Student retrieves course data or private documents belonging to another user. | Row-Level Security (RLS) or rigorous relational foreign-key validation on every query mapping back to the authenticated `user_id`. |
| **Denial of Service** | API flooding of generation endpoints using automated scripts to exhaust LLM tokens. | Rate-limiting using Redis (throttling logins and generation endpoints to max 5 requests/min); BullMQ queue backpressure. |
| **Elevation of Priv** | Student requests access to admin metrics dashboards. | Strict Role-Based Access Control (RBAC) guards in NestJS utilizing custom decorators (e.g., `@Roles(Role.Admin)`). |

---

## 2. Authentication & Session Flow

TeachStack uses short-lived JWT Access Tokens combined with longer-lived Refresh Tokens stored securely.

* **Access Token**: Expires in 15 minutes, stored in memory or client headers.
* **Refresh Token**: Expires in 7 days, stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie on the client. It is hashed and stored in the PostgreSQL database under `sessions` to support single-session revocation.

```
Client App                   API Gateway / Auth                   Session Storage
   │                                 │                                   │
   ├────── POST /auth/login ────────►│                                   │
   │                                 ├────── Hash/Verify Pass ───────────┤
   │                                 ├────── Generate Access & Refresh ──┤
   │                                 ├────── Save Refresh Token ────────►│
   │◄───── Tokens (200 OK) ──────────┤
   │
   │--- Subsequent Requests (Headers: Authorization: Bearer <Access Token>) ---
   │
   ├────── GET /workspace ──────────►│
   │                                 ├────── Decode & Validate Signature ┤
   │◄───── Workspace List ───────────┤
```

---

## 3. File Upload & Ingestion Security

Direct binary uploads to our application server represent a severe vulnerability. TeachStack uses an **Isolated S3 Upload Pipeline**:
1. **Pre-signed URLs**: The client requests a pre-signed URL from `/upload`. The backend validates that the file extension matches allowed MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
2. **S3 Sandbox**: S3 buckets are configured with blocked public access, strict CORS rules, and object lifecycle policies that delete temporary files.
3. **Malware/Virus Scan**: Background workers download the file stream and run a virus scan (via a ClamAV daemon container) before passing it to the parser engine.

---

## 4. API & Network Protection

* **Helmet.js**: Sets security-related HTTP headers (e.g., Content-Security-Policy, X-Content-Type-Options) in the NestJS backend application.
* **CORS Policies**: Explicitly restricts origins in production to authorized domains (e.g., `https://teachstack.com`), blocking wildcard origins (`*`).
* **Rate Limiting**: NestJS `@nestjs/throttler` limits API controllers:
  ```typescript
  ThrottlerModule.forRoot([{
    ttl: 60000, // 1 minute
    limit: 100, // maximum 100 requests per IP
  }])
  ```
* **Input Sanitization**: Use `class-validator` and `class-transformer` in NestJS to enforce strict type casting, stripping all undocumented request body parameters.
