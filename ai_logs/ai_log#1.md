# 🤖 AI-Log #1: Clean Layered Architecture Baseline

## 🎯 Objective

Define a clean, layered architecture for the time-tracker app, clarifying responsibilities, dependencies, and core domain entities.

## 🛠 Tools & Stack

- **AI Tool**: Cursor
- **Tech Stack**: Next.js (App Router), TypeScript, Prisma, SQLite/PostgreSQL (environment-dependent), Tailwind CSS

## 🔄 Tasks Performed

- [x] Defined the main application layers (UI, Hooks, API, Services, Repositories)
- [x] Documented folder responsibilities and dependency flow
- [x] Identified core domain entities (`Project`, `TaskName`, `TimeEntry`)

## 🧱 Architecture & Specifications

### 📁 Folder Structure

```text
src/
  app/api/         # API Layer: route handlers, request validation, auth checks
  components/      # Presentation: pure UI components (Tailwind), no business logic
  hooks/           # Hooks/State: orchestration for fetching + UI state
  services/        # Services: business rules (time calc, constraints)
  repositories/    # Data access: Prisma CRUD + DB abstraction
  types/           # Domain entities and shared TypeScript types
```

### 🛡️ Layer Responsibilities

| Layer            | Responsibility           | Notes                                        |
| :--------------- | :----------------------- | :------------------------------------------- |
| **Presentation** | Render UI, emit events   | No DB / business rules                       |
| **Hooks**        | Bridge UI and data layer | Manage loading/error state                   |
| **API**          | Request entry point      | Input sanitation (e.g., Zod), HTTP responses |
| **Services**     | Business logic           | Rules like “no overlapping entries”          |
| **Repositories** | DB operations            | Prisma queries, provider-specific details    |

### 🧩 Key Domain Entities

- **Project**: `id`, `name`, `clientId`, `createdAt`
- **TaskName**: `id`, `name`, `projectId` (FK), `isBillable`
- **TimeEntry**: `id`, `startTime`, `endTime`, `duration`, `taskId` (FK), `userId`

### 🔄 Dependency Flow

```text
UI -> Hooks -> API -> Services -> Repositories -> DB
```

---
