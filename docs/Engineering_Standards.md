# Engineering Standards - TeachStack

This document establishes the code quality, version control, branching, committing, and code review rules for all TeachStack engineers.

---

## 1. Coding Style & Conventions

We enforce strict TypeScript configurations to prevent common runtime errors and ensure code clarity.

### TypeScript Rules
* **Strict Mode**: `strict: true` must be enabled in all `tsconfig.json` configurations.
* **No Implicit Any**: `noImplicitAny: true` is mandatory. Avoid using the `any` keyword. If a type is unknown, use `unknown`.
* **Explicit Returns**: Always document public service and controller return types explicitly:
  ```typescript
  // Recommended
  public async getCourseById(id: string): Promise<CourseDto> { ... }
  
  // Avoid
  public async getCourseById(id: string) { ... }
  ```

### Naming Conventions
* **Classes & Decorators**: `PascalCase` (e.g. `CourseController`, `GetWorkspace`)
* **Files & Directories**: `kebab-case` (e.g. `course-generator.service.ts`, `docs/database-design.md`)
* **Variables & Functions**: `camelCase` (e.g. `parsedDocument`, `generateOutline`)
* **Interfaces**: Prefix interfaces with `I` (e.g. `IParser`, `IVectorStore`)
* **Database Columns**: `snake_case` (e.g. `password_hash`, `created_at`)

---

## 2. Git Branching Model

TeachStack uses **GitHub Flow**. It is simple, clear, and perfectly suited for continuous deployment setups.

```
main       ─────────────────────────────────────────────── (Production Deploy)
            \                                           /
feature/     \── feat/auth-refresh ──► PR ──► Review ──/ (Squash Merge)
```

* **`main`**: Must always remain deployable and stable. Direct commits to `main` are blocked.
* **`feat/*`**: Used for new feature additions (e.g. `feat/upload-presigned-url`).
* **`fix/*`**: Used for bug resolutions (e.g. `fix/jwt-expiration`).
* **`hotfix/*`**: Used for critical patches merged directly back to `main`.

---

## 3. Commit Message Standards

We use **Conventional Commits v1.0.0** to generate clean, readable git logs.

### Message Pattern
```
<type>(<scope>): <short description>

[optional body describing technical details/rationale]
```

### Supported Types
* **`feat`**: A new feature (e.g. `feat(upload): add clamd antivirus scanning to upload pipeline`)
* **`fix`**: A bug fix (e.g. `fix(auth): fix session refresh cookie path`)
* **`docs`**: Documentation changes (e.g. `docs(sdd): update architecture diagram for qdrant`)
* **`refactor`**: Code restructuring without altering functionality
* **`test`**: Adding or correcting test suites

---

## 4. Pull Request (PR) & Code Review Checklist

Before any PR can be merged into `main`, it must meet the following criteria:

- [ ] **Tests**: All automated unit and integration tests must pass successfully.
- [ ] **Linter**: The project code must compile and lint without warnings.
- [ ] **TypeScript Types**: No `any` type violations or missing type annotations.
- [ ] **Security**: Presigned S3 URLs are properly signed and input schemas validation (`class-validator`) is present on new endpoints.
- [ ] **Migrations**: Database schemas match migrations if entities were modified.
- [ ] **Documentation**: Corresponding API endpoints/diagrams have been updated inside the `docs/` folder.
