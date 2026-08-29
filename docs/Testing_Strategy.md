# Testing Strategy - TeachStack

This document outlines the testing pyramid, environment configurations, automated scripts, and load testing guidelines for TeachStack.

---

## 1. Testing Pyramid

TeachStack targets high test coverage focusing on system correctness, regression safety, and performance constraints.

```
       /\
      /  \       E2E Tests (Playwright) - Focus on core user journeys (<5%)
     /----\
    /      \     Integration Tests (Supertest) - Verify database & route bindings (25%)
   /--------\
  /          \   Unit Tests (Jest) - Business rules, parsers, and utilities (70%)
 /____________\
```

---

## 2. Unit Testing (Jest)

Unit tests focus on testing utility modules like parsers, chunking strategies, and business rule services.

### Example: Ingestion Parser Unit Test (`backend/src/parser/pdf-parser.spec.ts`)
```typescript
import { PDFParser } from './pdf-parser';
import * as fs from 'fs';
import * as path from 'path';

describe('PDFParser', () => {
  let parser: PDFParser;

  beforeEach(() => {
    parser = new PDFParser();
  });

  it('should parse PDF file binary streams correctly', async () => {
    const mockPdfPath = path.join(__dirname, 'test-assets/sample.pdf');
    const buffer = fs.readFileSync(mockPdfPath);
    
    const parsed = await parser.parse(buffer);
    
    expect(parsed.text).toContain('Expected Text Element');
    expect(parsed.metadata.wordCount).toBeGreaterThan(0);
  });
});
```

---

## 3. Integration Testing (NestJS + Supertest)

Integration tests verify database records, route validation guards, and API controllers using an ephemeral Docker Database instance.

### Example: Auth Controller Integration Test (`backend/test/auth.e2e-spec.ts`)
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) - should succeed with valid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123!'
      })
      .expect(201)
      .then((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toEqual('john@example.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## 4. End-to-End (E2E) Browser Testing (Playwright)

Playwright tests model end-to-end flows starting from UI element clicks through to backend updates.

### Example E2E Test (`frontend/tests/course-creation.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('User can register and create a workspace successfully', async ({ page }) => {
  await page.goto('/register');
  
  await page.fill('input[name="name"]', 'Jane Doe');
  await page.fill('input[name="email"]', 'jane@example.com');
  await page.fill('input[name="password"]', 'JanePassword123!');
  await page.click('button[type="submit"]');

  // Verify redirection to Workspace Dashboard
  await expect(page).toHaveURL('/workspace');
  await expect(page.locator('h1')).toContainText('Workspaces');
});
```

---

## 5. Load Testing (k6)

To verify the AI RAG chat service maintains a latency of under 2 seconds, we run k6 load tests targeting `/ai/chat`.

### Example script (`tests/load/chat-load.js`)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50, // 50 virtual users concurrently
  duration: '30s',
};

export default function () {
  const url = 'http://localhost:3000/ai/chat';
  const payload = JSON.stringify({
    courseId: 'db71cc16-2de5-455b-b9d9-4b8ef0b3d810',
    question: 'What is ownership in Rust?',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TEST_TOKEN',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency is under 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
```
