# 🤖 AI-Log #5: Timer Header UI Specification

## 🎯 Objective

Specify the UI for the active timer header (task input + project selector + elapsed time + start/stop actions).

## 🛠 Tools & Stack

- **AI Tool**: v0.dev
- **Tech Stack**: Next.js 14, Tailwind CSS, shadcn/ui

## 🔄 Tasks Performed

- [x] Defined the timer header component location
- [x] Documented UI layout and interaction requirements
- [x] Provided a component-level structure mockup

## 🧱 Architecture & Specifications

### 📁 Component Location

- `src/components/tracker/timer-header.tsx`

### 🎨 UI Specs

- **Layout**: Horizontal bar (`flex items-center`), `gap-4`, padded container
- **Task Input**: `Input` with placeholder “What are you working on?”, full width
- **Project Selector**: `Select` / `Popover` with color dots beside project names
- **Time Display**: Monospace digits (`font-mono`) for stability (`00:00:00`)
- **Action Button**:
  - **Start**: `Button` with Play icon (primary)
  - **Stop**: `Button` with Stop icon (destructive)

### 🧱 Component Structure (Mockup)

```tsx
// src/components/tracker/timer-header.tsx
// - Task Input (Left)
// - Project Dropdown (Middle)
// - Elapsed Time Display (Right-Middle)
// - Start/Stop Button (Right)
```

---
