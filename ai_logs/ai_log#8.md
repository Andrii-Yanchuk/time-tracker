# 🤖 AI-Log #8: Reports Page UI Specification

## 🎯 Objective

Define the UI specifications for a Reports page (date filtering, summary table, and CSV export).

## 🛠 Tools & Stack

- **AI Tool**: v0.dev
- **Tech Stack**: Next.js 14, Tailwind CSS, shadcn/ui

## 🔄 Tasks Performed

- [x] Defined component locations for reports UI building blocks
- [x] Specified date range picker behavior (presets + custom range)
- [x] Specified summary table columns and export interaction feedback

## 🧱 Architecture & Specifications

### 📁 Component Location

- `src/components/reports/date-range-picker.tsx` — calendar range selector
- `src/components/reports/summary-table.tsx` — data table visualization
- `src/components/reports/export-button.tsx` — CSV export trigger

### 🎨 UI Specs

| Area                  | Specification                                                                                |
| :-------------------- | :------------------------------------------------------------------------------------------- |
| **Date Range Picker** | Presets (Today / Last 7 Days / This Month) + custom dual-calendar popover                    |
| **Summary Table**     | Columns: `Project`, `Total Tasks`, `Billable Time`, `Total Duration`; footer grand-total row |
| **Export Action**     | Top-right outline button with `Download` icon + loading spinner during generation            |

### 🧱 Component Structure (Mockup)

```tsx
// src/components/reports/report-shell.tsx
// - Header (Title + Export CSV Button)
// - Filters Bar (DateRangePicker + Project Filter)
// - Summary Cards (Total Hours, Most Active Project)
// - Summary Table (Grouped Data)
```

---
