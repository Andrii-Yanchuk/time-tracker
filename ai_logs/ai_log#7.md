# 🤖 AI-Log #7: Project Management UI Specification

## 🎯 Objective

Specify UI for project management (list + create/edit modal + color picker + delete confirmation).

## 🛠 Tools & Stack

- **AI Tool**: v0.dev
- **Tech Stack**: Next.js 14, Tailwind CSS, shadcn/ui

## 🔄 Tasks Performed

- [x] Defined component locations for the project feature UI
- [x] Specified table columns and modal form fields
- [x] Defined delete safety via confirmation dialog

## 🧱 Architecture & Specifications

### 📁 Component Location

- `src/components/projects/project-list.tsx` — Main table/grid
- `src/components/projects/project-modal.tsx` — Unified create/edit dialog
- `src/components/projects/color-picker.tsx` — Color selection

### 🎨 UI Specs

| Area               | Specification                                                       |
| :----------------- | :------------------------------------------------------------------ |
| **Project List**   | Table: `Project Name`, `Color Indicator`, `Created Date`, `Actions` |
| **Visual ID**      | Color badge/dot next to name                                        |
| **Add/Edit Modal** | Trigger: “Add Project”; Fields: `Input` (name) + `ColorPicker`      |
| **Color Picker**   | Preset grid (8-12 hex codes) + optional custom hex input            |
| **Delete Option**  | `AlertDialog` confirmation to prevent accidental loss               |

### 🧱 Component Structure (Mockup)

```tsx
// src/components/projects/project-modal.tsx
// - Dialog Header (Add/Edit)
// - Form (Zod Schema: { name: string, color: string })
// - Color Palette Grid
// - Submit Button (Save)
```

---
