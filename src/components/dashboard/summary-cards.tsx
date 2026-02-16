"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, FolderKanban, CalendarDays } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
  icon: ReactNode;
}

function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    daySeconds: number;
    weekSeconds: number;
    monthSeconds: number;
    dayEntries: number;
    weekEntries: number;
    monthEntries: number;
    activeProjects: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/summary-stats");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = (await res.json()) as {
          daySeconds: number;
          weekSeconds: number;
          monthSeconds: number;
          dayEntries: number;
          weekEntries: number;
          monthEntries: number;
          activeProjects: number;
        };

        if (!cancelled) setStats(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  };

  const todayValue = stats ? formatDuration(stats.daySeconds) : "—";
  const weekValue = stats ? formatDuration(stats.weekSeconds) : "—";
  const monthValue = stats ? formatDuration(stats.monthSeconds) : "—";
  const activeProjectsValue = stats ? String(stats.activeProjects) : "—";

  const todaySublabel = stats
    ? `${stats.dayEntries} entries tracked`
    : loading
      ? "Loading..."
      : error
        ? "Failed to load"
        : "No data";

  const weekSublabel = stats
    ? `${stats.weekEntries} entries tracked`
    : loading
      ? "Loading..."
      : error
        ? "Failed to load"
        : "No data";

  const monthSublabel = stats
    ? `${stats.monthEntries} entries tracked`
    : loading
      ? "Loading..."
      : error
        ? "Failed to load"
        : "No data";

  const activeProjectsSublabel = loading
    ? "Loading..."
    : error
      ? "Failed to load"
      : "Last 30 days";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        label="Today"
        value={todayValue}
        sublabel={todaySublabel}
        icon={<Clock className="h-5 w-5 text-primary" />}
      />
      <StatCard
        label="This Week"
        value={weekValue}
        sublabel={weekSublabel}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
      />
      <StatCard
        label="Active Projects"
        value={activeProjectsValue}
        sublabel={activeProjectsSublabel}
        icon={<FolderKanban className="h-5 w-5 text-primary" />}
      />
      <StatCard
        label="This Month"
        value={monthValue}
        sublabel={monthSublabel}
        icon={<CalendarDays className="h-5 w-5 text-primary" />}
      />
    </div>
  );
}
