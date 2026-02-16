"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  Download,
  Clock,
  TrendingUp,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { projectsApi, timeEntriesApi } from "@/lib/api";
import type { ProjectWithStats } from "@/services/project.service";
import type { TimeEntryWithProject } from "@/services/timeEntry.service";

// ─── Shared data ─────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: "chrono-app", name: "Chrono App", color: "#3B82F6" },
  { id: "backend", name: "Backend API", color: "#10B981" },
  { id: "team", name: "Team Meetings", color: "#6366F1" },
  { id: "marketing", name: "Marketing", color: "#F43F5E" },
  { id: "mobile-app", name: "Mobile App", color: "#F59E0B" },
];

interface ReportEntry {
  id: string;
  date: string;
  task: string;
  projectId: string;
  hours: number;
}

function generateEntries(): ReportEntry[] {
  const tasks: Record<string, string[]> = {
    "chrono-app": [
      "Dashboard UI redesign",
      "Design system documentation",
      "Client onboarding flow",
      "Settings page layout",
      "Notification system",
    ],
    backend: [
      "API integration testing",
      "Code review - Auth module",
      "Database migration",
      "WebSocket implementation",
      "Error logging setup",
    ],
    team: [
      "Sprint planning meeting",
      "Daily standup",
      "Retrospective",
      "One-on-one sync",
    ],
    marketing: [
      "Social media campaign",
      "Blog post draft",
      "Email newsletter",
      "Analytics review",
    ],
    "mobile-app": [
      "Navigation setup",
      "Push notification integration",
      "Offline storage",
      "UI component library",
    ],
  };

  const entries: ReportEntry[] = [];
  let id = 1;
  // Generate entries for the last 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    const entriesPerDay = 2 + Math.floor(Math.random() * 3);
    for (let e = 0; e < entriesPerDay; e++) {
      const projKeys = Object.keys(tasks);
      const projId = projKeys[Math.floor(Math.random() * projKeys.length)];
      const projTasks = tasks[projId];
      const task = projTasks[Math.floor(Math.random() * projTasks.length)];
      const hours = Math.round((0.5 + Math.random() * 3.5) * 4) / 4;

      entries.push({
        id: String(id++),
        date: dateStr,
        task,
        projectId: projId,
        hours,
      });
    }
  }
  return entries;
}

const allEntries = generateEntries();

function getProject(id: string) {
  return PROJECTS.find((p) => p.id === id);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
}

function getProjectColor(project: any): string {
  return project?.color || "#64748B";
}

function getProjectName(project: any): string {
  return project?.name || "Unknown";
}

// ─── Date Range Picker ───────────────────────────────────────────────────────

function DateRangePicker({
  range,
  onChange,
}: {
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  const label = range?.from
    ? range.to
      ? `${formatDate(range.from)} - ${formatDate(range.to)}`
      : formatDate(range.from)
    : "Select date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 justify-start gap-2 text-sm font-normal",
            !range?.from && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(value) => {
            onChange(value);
            if (value?.from && value?.to) setOpen(false);
          }}
          numberOfMonths={2}
          defaultMonth={
            new Date(new Date().getFullYear(), new Date().getMonth() - 1)
          }
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Preset buttons ──────────────────────────────────────────────────────────

function PresetButtons({ onSelect }: { onSelect: (range: DateRange) => void }) {
  const today = new Date();

  const presets: { label: string; range: DateRange }[] = [
    {
      label: "Last 7 days",
      range: {
        from: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 6,
        ),
        to: today,
      },
    },
    {
      label: "Last 14 days",
      range: {
        from: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 13,
        ),
        to: today,
      },
    },
    {
      label: "This month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: today,
      },
    },
    {
      label: "Last month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((p) => (
        <Button
          key={p.label}
          variant="secondary"
          size="sm"
          onClick={() => onSelect(p.range)}
          className="h-7 text-xs"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-xl font-bold tabular-nums text-foreground">
            {value}
          </span>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Export CSV ──────────────────────────────────────────────────────────────

function exportCSV(entries: TimeEntryWithProject[]) {
  const header = "Date,Task,Project,Hours\n";
  const rows = entries
    .map((e) => {
      const proj = e.project;
      return `${e.start.toISOString().split("T")[0]},"${e.description}","${proj?.name ?? "Unknown"}",${(e.duration || 0) / 3600}`;
    })
    .join("\n");
  const csv = header + rows;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `time-report-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Summary by Project ─────────────────────────────────────────────────────

function ProjectSummaryTable({ entries }: { entries: TimeEntryWithProject[] }) {
  const summary = useMemo(() => {
    const grouped: Record<
      number,
      { hours: number; entries: number; project: any }
    > = {};
    for (const e of entries) {
      if (!e.project) continue;

      if (!grouped[e.project.id]) {
        grouped[e.project.id] = { hours: 0, entries: 0, project: e.project };
      }
      grouped[e.project.id].hours += (e.duration || 0) / 3600;
      grouped[e.project.id].entries += 1;
    }
    return Object.values(grouped).sort((a, b) => b.hours - a.hours);
  }, [entries]);

  const totalHours = summary.reduce((s, r) => s + r.hours, 0);
  const totalEntries = summary.reduce((s, r) => s + r.entries, 0);

  return (
    <Card className="border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Summary by Project
        </h3>
        <Badge
          variant="secondary"
          className="bg-muted text-xs font-normal text-muted-foreground"
        >
          {summary.length} projects
        </Badge>
      </div>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Project</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="pr-5 text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.map((row) => {
              const pct = totalHours > 0 ? (row.hours / totalHours) * 100 : 0;

              return (
                <TableRow key={row.project.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: getProjectColor(row.project),
                        }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {getProjectName(row.project)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                    {row.entries}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium tabular-nums text-foreground">
                    {formatHours(row.hours)}
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-2.5">
                      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: getProjectColor(row.project),
                          }}
                        />
                      </div>
                      <span className="min-w-[36px] text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableCell className="pl-5 text-sm font-semibold text-foreground">
                Total
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                {totalEntries}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatHours(totalHours)}
              </TableCell>
              <TableCell className="pr-5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                100%
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Detail Table ────────────────────────────────────────────────────────────

function DetailTable({ entries }: { entries: TimeEntryWithProject[] }) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.start.getTime() - a.start.getTime()),
    [entries],
  );

  return (
    <Card className="border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Detailed Entries
        </h3>
        <Badge
          variant="secondary"
          className="bg-muted text-xs font-normal text-muted-foreground"
        >
          {entries.length} entries
        </Badge>
      </div>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Date</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="pr-5 text-right">Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.slice(0, 25).map((entry) => {
              return (
                <TableRow key={entry.id}>
                  <TableCell className="pl-5 font-mono text-xs tabular-nums text-muted-foreground">
                    {entry.start.toISOString().split("T")[0]}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {entry.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: getProjectColor(entry.project),
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {getProjectName(entry.project)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-5 text-right font-mono text-sm font-medium tabular-nums text-foreground">
                    {formatHours((entry.duration || 0) / 3600)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {sorted.length > 25 && (
          <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
            Showing 25 of {sorted.length} entries. Export CSV for the full
            report.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Reports Page ──────────────────────────────────────────────────────

export default function ReportsPage() {
  const today = new Date();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13),
    to: today,
  });
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [entries, setEntries] = useState<TimeEntryWithProject[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load entries when filters change
  useEffect(() => {
    if (projects.length > 0) {
      loadEntries();
    }
  }, [dateRange, projectFilter, projects]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, entriesData] = await Promise.all([
        projectsApi.getAll(),
        timeEntriesApi.getAll(),
      ]);
      setProjects(projectsData);
      setEntries(entriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const entriesData = await timeEntriesApi.getReport({
        start: dateRange?.from,
        end: dateRange?.to,
        projectId:
          projectFilter === "all" ? undefined : parseInt(projectFilter),
      });
      setEntries(entriesData);
    } catch (error) {
      console.error("Failed to load entries:", error);
    }
  };

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      // Date filter is already applied in loadEntries
      // Project filter is already applied in loadEntries
      return true;
    });
  }, [entries]);

  const totalHours = filtered.reduce(
    (s, e) => s + (e.duration ? e.duration / 3600 : 0),
    0,
  );
  const uniqueProjects = new Set(
    filtered.map((e) => e.project?.id).filter(Boolean),
  ).size;
  const avgPerDay = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return totalHours;
    const days = Math.max(
      1,
      Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1,
    );
    return totalHours / days;
  }, [dateRange, totalHours]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze tracked time across projects and date ranges.
          </p>
        </div>
        <Button
          onClick={() => exportCSV(filtered)}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker range={dateRange} onChange={setDateRange} />
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="h-9 w-[180px] text-sm">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PresetButtons
            onSelect={(range) => {
              setDateRange(range);
              setProjectFilter("all");
            }}
          />
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Total Hours"
          value={formatHours(totalHours)}
          sub={`${filtered.length} entries`}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg / Day"
          value={formatHours(avgPerDay)}
          sub="across the range"
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={String(uniqueProjects)}
          sub="with tracked time"
        />
      </div>

      {/* Tables */}
      <div className="flex flex-col gap-6">
        <ProjectSummaryTable entries={filtered} />
        <DetailTable entries={filtered} />
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
          <span className="text-sm font-medium text-muted-foreground">
            No entries found
          </span>
          <span className="text-xs text-muted-foreground">
            Try adjusting the date range or project filter.
          </span>
        </div>
      )}
    </div>
  );
}
