# 🤖 AI-Log #2: Folder Structure & File Stubs

## 🎯 Objective

Define an initial, scalable project structure (API/UI/hooks/services/repositories) and propose file stubs for CRUD features.

## 🛠 Tools & Stack

- **AI Tool**: Cursor
- **Tech Stack**: Next.js (App Router), TypeScript, Prisma, Tailwind CSS, shadcn/ui

## 🔄 Tasks Performed

- [x] Proposed API route segments for Projects, Tasks, and Time Entries
- [x] Outlined UI component folders by feature area
- [x] Defined hooks/services/repositories separation for maintainability

## 🧱 Architecture & Specifications

### 📁 Proposed Folder / File Layout

```text
src/
├── app/
│   └── api/
│       ├── projects/
│       │   └── route.ts            # Project CRUD handlers
│       ├── tasks/
│       │   └── route.ts            # TaskName CRUD handlers
│       └── time-entries/
│           └── route.ts            # TimeEntry CRUD handlers
├── components/
│   ├── ui/                         # Reusable UI (Button, Input, Card)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── projects/                   # Project-specific UI
│   │   └── project-list.tsx
│   ├── tasks/                      # Task-specific UI
│   │   └── task-selector.tsx
│   └── tracker/                    # TimeEntry-specific UI
│       ├── timer.tsx
│       └── entry-form.tsx
├── hooks/                          # State & Data Fetching
│   ├── use-projects.ts
│   ├── use-tasks.ts
│   └── use-time-tracker.ts
├── services/                       # Business Logic
│   ├── project.service.ts
│   ├── task.service.ts
│   └── time-entry.service.ts
├── repositories/                   # Data Access (Prisma)
│   ├── project.repository.ts
│   ├── task.repository.ts
│   └── time-entry.repository.ts
├── lib/
│   └── prisma.ts                   # Prisma client singleton
├── types/
│   └── index.ts                    # Shared domain interfaces
└── constants/
    └── index.ts                    # Enums, validation rules
```

---
