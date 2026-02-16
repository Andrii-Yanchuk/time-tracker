# 🤖 AI-Log #6: Time Entry List UI Specification

## 🎯 Objective

Specify a grouped time-entry list UI (grouped by project) with inline editing and destructive actions.

## 🛠 Tools & Stack

- **AI Tool**: v0.dev
- **Tech Stack**: Next.js 14, Tailwind CSS, shadcn/ui

## 🔄 Tasks Performed

- [x] Defined the component locations for list and group rendering
- [x] Specified grouping strategy and per-row editable fields
- [x] Provided a component structure mockup for implementation

## 🧱 Architecture & Specifications

### 📁 Component Location

- `src/components/tracker/entry-list.tsx`
- `src/components/tracker/entry-group.tsx`

### 🎨 UI Specs (Grouping & Actions)

- **Grouping Strategy**:
  - Parent container: **Project Group** with header (project name + color dot)
  - Header right: **Total Duration** (sum for that project)
- **Entry Row**:
  - **Task**: `Input` (ghost/borderless) for inline editing
  - **Project**: `Select` trigger to switch projects
  - **Duration**: `Input` (mask: `hh:mm`) for manual override
  - **Actions**: Ghost `Button` with `Trash` icon (destructive hover)

### 🧱 Component Structure (Mockup)

```tsx
// src/components/tracker/entry-list.tsx
// - Iterate over grouped data
//   - <EntryGroup key={projectId}>
//     - <ProjectHeader name={name} total={total} />
//     - <EntryRow key={entryId} />
//   - </EntryGroup>
```

---
