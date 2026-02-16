# 🤖 AI-Log #14: Architecture Migration (State Nav → App Router)

## 🎯 Objective

Remove state-based navigation (`useState`) and migrate to Next.js App Router route-based navigation for SSR/SEO correctness and URL-driven behavior.

## 🛠 Tools & Stack

- **AI Tool**: Windsurf
- **Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS

## 🔄 Tasks Performed

- [x] Moved page components into `src/app/*/page.tsx` route segments
- [x] Replaced state navigation with `<Link />` navigation
- [x] Implemented active link state via `usePathname()`
- [x] Kept persistent shell (`Sidebar`, `Header`) in `layout.tsx`

## 🧱 Architecture & Specifications

### 📁 New Route Structure

- `src/app/page.tsx` — Dashboard Home
- `src/app/projects/page.tsx` — Projects
- `src/app/reports/page.tsx` — Reports
- `src/app/layout.tsx` — shared layout (Sidebar + Header)

### 🎨 Technical Rules

- **Routing**: remove `activeNav`; let Next.js render by URL
- **Sidebar Links**: replace click handlers with `<Link href="..." />`
- **Active State**: use `usePathname()`
- **Server vs Client**:
  - pages (`page.tsx`) server-first when possible
  - `"use client"` only for interactive islands (Sidebar/Header/timers)

### 🧱 Before vs After

| Function       | Before (SPA-style)                | After (Next.js 14)                          |
| :------------- | :-------------------------------- | :------------------------------------------ |
| **Navigation** | `useState('dashboard')`           | file-based routes (`/projects`, `/reports`) |
| **Pages**      | `src/components/ProjectsPage.tsx` | `src/app/projects/page.tsx`                 |
| **Links**      | `<div onClick={...}>`             | `<Link href="/projects">`                   |
| **Rendering**  | 100% client-side                  | hybrid (server pages + client islands)      |

### 🧹 Cleanup Notes

- removed duplicated `DashboardView` / `ProjectsPage` / `ReportsPage` from `components`
- updated imports (`@/components/...`) to match new structure
- resolved type conflicts from server/client split

---
