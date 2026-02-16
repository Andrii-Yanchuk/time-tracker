# Chrono — Time Tracking App

Chrono is a full-stack time tracking application built with **Next.js App Router**. It helps you **track work sessions in real-time**, **organize entries by project**, and **generate reports** (including CSV export) powered by a SQLite database via Prisma.

## Project Overview

This application provides:

- **A dashboard** with a timer to start/stop tracking and a summary view.
- **Project management** (create/update/delete) with tracked hours and entry counts.
- **Reports** with filtering by date range and project and server-backed aggregation.

## Architecture Decisions (CRITICAL)

### Clean Architecture (UI → Services → Repositories → Prisma)

This project follows a lightweight **Clean Architecture** style to keep responsibilities explicit and the codebase maintainable:

- **UI layer** (`src/app`, `src/components`)
  - Pages and client components handle rendering, user interaction, and calling internal APIs.
- **Service layer** (`src/services`)
  - Contains business rules and validation.
  - Example: `TimeEntryService` validates inputs and calculates derived data (e.g., duration from `start`/`end`).
- **Repository layer** (`src/repositories`)
  - Encapsulates database queries and data access patterns.
  - Example: `TimeEntryRepository` provides query helpers like `findActiveTimers()` and aggregations like `sumDurationSecondsByDateRange()`.
- **Data layer / ORM** (`src/lib/prisma.ts`, `prisma/schema.prisma`)
  - Prisma Client is the only module that talks directly to the database.

**Why this matters**:

- **Separation of concerns**: UI stays focused on user experience; services encode rules; repositories encode persistence.
- **Testability**: services/repositories can be tested independently (and swapped/mocked if needed).
- **Change resilience**: database schema or query changes are localized to repositories.

### Transition to Next.js App Router (introduced in Next.js 13+; adopted during the Next.js 14 migration)

The project uses the **Next.js App Router** (`src/app`) because it enables:

- **Layout persistence**: shared UI (e.g., dashboard shell) stays mounted while navigating between pages.
- **Server-first primitives**: API routes via Route Handlers and a clean separation between server/client components.
- **SSR and performance**: improved rendering flexibility and better user-perceived performance.

Note: the repository currently runs on a modern Next.js version while keeping the App Router architecture.

### Repository Pattern

Repositories abstract database access behind a small, consistent API.

**Why it’s used here**:

- Keeps Prisma query details out of services and UI.
- Provides a single place for query tuning and DB-specific logic.
- Makes the service layer easier to reason about and evolve.

## Tech Stack

| Category       | Technology                      |
| -------------- | ------------------------------- |
| Framework      | Next.js (App Router)            |
| Language       | TypeScript                      |
| Database / ORM | Prisma + SQLite                 |
| UI Components  | shadcn/ui (Radix UI primitives) |
| Styling        | Tailwind CSS                    |

## Project Structure

`/src` (high-level)

```text
src/
  app/                # Next.js App Router pages + Route Handlers (API)
    api/              # Server endpoints used by the UI (projects, time-entries, reports)
    projects/         # Projects page
    reports/          # Reports page (filtering, CSV export)
    layout.tsx        # Root layout wrapping the app shell
    page.tsx          # Dashboard page

  components/         # React components (dashboard, projects UI, shared UI kit)
    dashboard/        # Timer, summary cards, time entry list, dashboard layout
    projects/         # Project-specific UI components
    task-names/       # Task name helpers (autocomplete/search)
    time-entries/     # Time entry UI components
    ui/               # shadcn/ui components

  hooks/              # Reusable React hooks (toast, mobile)

  lib/                # Cross-cutting utilities (API client, Prisma singleton, helpers)
    api.ts            # Typed fetch wrappers for internal API routes
    prisma.ts         # Prisma client singleton (dev-friendly)
    utils.ts          # Shared utilities

  repositories/       # Data access layer (Prisma queries)
    project.repository.ts
    timeEntry.repository.ts
    taskName.repository.ts

  services/            # Business logic + validation
    project.service.ts
    timeEntry.service.ts
    task-name.service.ts
```

## Setup & Installation

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd time-tracker
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

### 4) Set up the database (Prisma + SQLite)

Run migrations and generate Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5) Start the development server

```bash
npm run dev
```

Then open:

- `http://localhost:3000`

## Features

Verified functionalities based on the current code:

- **Real-time tracking**
  - Start/stop a timer; active timers are restored on refresh via the API.
- **Manual time entry**
  - Save an entry with a manual duration when the timer is not running.
- **Project management**
  - Create, edit, and delete projects.
  - Projects show computed stats (tracked hours + entry count).
- **Reports with database-backed aggregation**
  - Filter entries by date range and project.
  - Summary calculations are performed using repository queries and Prisma aggregations.
  - CSV export from the reports page.

## Development History

This project was built iteratively with help from:

- **Cursor**
- **v0.dev**
- **Windsurf**

The approach focused on shipping UI quickly while continuously refactoring into a clearer **Clean Architecture** (services/repositories) as features matured.
