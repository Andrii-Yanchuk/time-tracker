# 🤖 AI-Log #3: Prisma Schema Definition

## 🎯 Objective

Define an initial Prisma schema for the core entities (`Project`, `TaskName`, `TimeEntry`) and their relationships.

## 🛠 Tools & Stack

- **AI Tool**: Cursor
- **Tech Stack**: Prisma, PostgreSQL (via `DATABASE_URL`), TypeScript

## 🔄 Tasks Performed

- [x] Drafted Prisma models for Projects, Task Names, and Time Entries
- [x] Defined relations between `Project` ↔ `TaskName` ↔ `TimeEntry`
- [x] Added useful indexes for lookup and query performance

## 🧱 Architecture & Specifications

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id          String      @id @default(cuid())
  name        String
  color       String?     @default("#3b82f6")
  createdAt   DateTime    @default(now())

  timeEntries TimeEntry[]
  tasks       TaskName[]

  @@index([name])
}

model TaskName {
  id          String      @id @default(cuid())
  name        String      @unique
  projectId   String?

  project     Project?    @relation(fields: [projectId], references: [id])
  timeEntries TimeEntry[]

  @@index([projectId])
}

model TimeEntry {
  id          String    @id @default(cuid())
  description String?
  start       DateTime  @default(now())
  end         DateTime?
  duration    Int?      @default(0) // Stored in seconds
  createdAt   DateTime  @default(now())

  projectId   String?
  project     Project?  @relation(fields: [projectId], references: [id])

  taskId      String?
  task        TaskName? @relation(fields: [taskId], references: [id])

  @@index([start])
  @@index([projectId])
}
```

---
