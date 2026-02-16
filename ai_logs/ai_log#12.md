# 🤖 AI-Log #12: Database Logic Extraction (Server Actions + Services)

## 🎯 Objective

Enforce Single Responsibility by extracting all Prisma/database logic out of React components into server-side layers (Server Actions + Services).

## 🛠 Tools & Stack

- **AI Tool**: Windsurf
- **Tech Stack**: Next.js 14 (App Router), TypeScript, Prisma (SQLite), Server Actions

## 🔄 Tasks Performed

- [x] Introduced Server Actions layer for mutations (`Create/Update/Delete`)
- [x] Standardized data fetching via Server Components calling Services
- [x] Enforced rule: no direct `prisma` imports inside UI `.tsx` components

## 🧱 Architecture & Specifications

### 📁 Architecture Changes

| Layer                 | Location              | Responsibility                                                  |
| :-------------------- | :-------------------- | :-------------------------------------------------------------- |
| **Server Actions**    | `src/app/actions/`    | Mutations (create/update/delete) invoked from client components |
| **Server Components** | `src/app/**/page.tsx` | Reads via direct service calls at render time                   |
| **Service Layer**     | `src/services/`       | Only place allowed to import/use `prisma`                       |

### 🎨 Technical Rules (Clean UI)

- **No `prisma` imports in `.tsx`**: remove Prisma client usage from components
- **Server Actions for Forms**: use `action={someAction}` instead of client `fetch` effects
- **Data Fetching**: prefer async Server Components calling services

---
