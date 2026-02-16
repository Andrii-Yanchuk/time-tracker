# 🤖 AI-Log #10: App Router Refactor (Route Segments & Layout)

## 🎯 Objective

Migrate from state-based navigation to Next.js App Router route segments, enabling URL-based navigation, SSR/RSC-friendly pages, and a shared persistent layout.

## 🛠 Tools & Stack

- **AI Tool**: Cursor
- **Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS

## 🔄 Tasks Performed

- [x] Mapped new route segments and moved pages into `src/app/*/page.tsx`
- [x] Removed navigation state (`activeNav`) in favor of file-based routing
- [x] Updated Sidebar navigation to `next/link` + active state via `usePathname`

## 🧱 Architecture & Specifications

### 📁 New Route Segments & Locations

- `src/app/page.tsx` — Dashboard Home (previously `DashboardView`)
- `src/app/projects/page.tsx` — Projects page
- `src/app/reports/page.tsx` — Reports page
- `src/app/layout.tsx` — global shared layout (Sidebar + Header)

### 🎨 Refactoring Rules (Next.js 14)

- **Routing Logic**:
  - remove client-side nav state (`useState('...')`)
  - let the App Router render pages via URL
- **Sidebar & Navigation**:
  - use `<Link />` from `next/link`
  - use `usePathname()` for active link highlighting
- **Server vs Client Components**:
  - keep root pages (`page.tsx`) server-first when possible
  - add `"use client"` only to interactive UI (Sidebar, Header, forms)

### 🧱 Component Structure (Mockup)

```tsx
// src/app/layout.tsx
// - <Sidebar /> (persistent navigation)
// - <main>
//    - <Header /> (shared header)
//    - {children} (dynamic route content)
// - </main>

// src/app/projects/page.tsx
// - Projects feature UI
// - data fetching (server-side ready)
```

---
