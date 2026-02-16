# 🤖 AI-Log #11: Repository + Service Layers (Prisma/SQLite)

## 🎯 Objective

Introduce a clean backend architecture using Prisma with SQLite, applying Repository + Service patterns and a Prisma singleton to avoid connection issues in dev.

## 🛠 Tools & Stack

- **AI Tool**: Cursor
- **Tech Stack**: Next.js 14, TypeScript, Prisma (SQLite), App Router API routes / Server Actions

## 🔄 Tasks Performed

- [x] Introduced a Prisma singleton in `src/lib/prisma.ts`
- [x] Defined `repositories/` as pure CRUD data access layer
- [x] Defined `services/` as business-logic layer calling repositories

## 🧱 Architecture & Specifications

### 📁 New Architectural Layers

| Layer             | Location                           | Responsibility                                                  |
| :---------------- | :--------------------------------- | :-------------------------------------------------------------- |
| **Prisma Client** | `src/lib/prisma.ts`                | Singleton client to prevent SQLite connection exhaustion in dev |
| **Repositories**  | `src/repositories/`                | Direct Prisma calls (CRUD only)                                 |
| **Services**      | `src/services/`                    | Validation, calculations, orchestration; calls repositories     |
| **Entry Points**  | `src/app/api/` (or Server Actions) | Calls services; returns data / performs mutations               |

### 🎨 Technical Specifications

- **ORM**: Prisma with provider `sqlite`
- **Pattern**: Repository + Service Pattern
- **Type Safety**: TypeScript end-to-end for all domain models
- **Env**: `DATABASE_URL="file:./dev.db"`

### 🧱 Architecture Overview (Mockup)

```tsx
// src/lib/prisma.ts
// - PrismaClient singleton export

// src/repositories/project.repository.ts
// - getAll(), getById(id), create(data), update(id, data), delete(id)

// src/services/project.service.ts
// - business rules (e.g., constraints before deletion)
// - calls ProjectRepository
```

---
