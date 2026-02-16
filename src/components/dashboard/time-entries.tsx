"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ApiError, projectsApi, timeEntriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ProjectWithStats } from "@/services/project.service";
import type { TimeEntryWithProject } from "@/services/timeEntry.service";

function secondsToDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function TimeEntries() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntryWithProject[]>([]);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editHours, setEditHours] = useState<string>("");
  const [editMinutes, setEditMinutes] = useState<string>("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, projectsData] = await Promise.all([
        timeEntriesApi.getToday(),
        projectsApi.getAll(),
      ]);
      setEntries(entriesData);
      setProjects(projectsData);
    } catch (error) {
      toast({
        title: "Failed to load",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    id: number,
    patch: { description?: string; projectId?: number },
  ) => {
    try {
      await timeEntriesApi.update(id, patch);
      await loadData(); // Reload entries
      toast({
        title: "Saved",
        description: "Entry updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await timeEntriesApi.delete(id);
      await loadData(); // Reload entries
      toast({
        title: "Deleted",
        description: "Entry removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const startEditing = (entry: TimeEntryWithProject) => {
    setEditingId(entry.id);
    const totalSeconds = entry.duration ?? 0;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    setEditHours(String(h));
    setEditMinutes(String(m));
    setEditErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditHours("");
    setEditMinutes("");
    setEditErrors({});
  };

  const validateEdit = () => {
    const errs: Record<string, string> = {};
    const h = editHours.trim() === "" ? 0 : Number(editHours);
    const m = editMinutes.trim() === "" ? 0 : Number(editMinutes);

    if (!Number.isInteger(h) || h < 0 || h > 23)
      errs.hours = "Hours must be 0–23";
    if (!Number.isInteger(m) || m < 0 || m > 59)
      errs.minutes = "Minutes must be 0–59";

    const seconds = h * 3600 + m * 60;
    if (seconds <= 0) errs.duration = "Time duration must be > 0";

    return { errs, seconds };
  };

  const saveDuration = async (id: number) => {
    const { errs, seconds } = validateEdit();
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setSaving(true);
      await timeEntriesApi.update(id, { duration: seconds });
      await loadData();
      toast({
        title: "Saved",
        description: "Duration updated.",
      });
      cancelEditing();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setEditErrors(error.fieldErrors);
      }
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">
          Loading time entries...
        </div>
      </div>
    );
  }

  // Group entries by projectId
  const grouped = entries.reduce<Record<number, TimeEntryWithProject[]>>(
    (acc, entry) => {
      if (!entry.project) return acc;
      if (!acc[entry.project.id]) acc[entry.project.id] = [];
      acc[entry.project.id].push(entry);
      return acc;
    },
    {},
  );

  const projectOrder = Object.keys(grouped).map(Number);

  // Grand total
  const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Grand total bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {"Today's Total"}
          </span>
          <Badge
            variant="secondary"
            className="text-xs font-normal bg-muted text-muted-foreground"
          >
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Badge>
        </div>
        <span className="font-mono text-base font-bold tabular-nums text-foreground">
          {secondsToDuration(totalSeconds)}
        </span>
      </div>

      {/* Project groups */}
      {projectOrder.map((projectId) => {
        const projectEntries = grouped[projectId];
        const project = projects.find((p) => p.id === projectId);

        if (!project || projectEntries.length === 0) return null;

        return (
          <Card key={projectId} className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {projectEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {secondsToDuration(entry.duration || 0)}
                    </span>
                    {editingId === entry.id && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            inputMode="numeric"
                            placeholder="Hours"
                            value={editHours}
                            onChange={(e) => setEditHours(e.target.value)}
                            className={cn(
                              "h-8 text-xs",
                              (editErrors.hours || editErrors.duration) &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            disabled={saving}
                          />
                          {editErrors.hours && (
                            <p className="mt-1 text-xs text-destructive">
                              {editErrors.hours}
                            </p>
                          )}
                        </div>
                        <div>
                          <Input
                            inputMode="numeric"
                            placeholder="Minutes"
                            value={editMinutes}
                            onChange={(e) => setEditMinutes(e.target.value)}
                            className={cn(
                              "h-8 text-xs",
                              (editErrors.minutes || editErrors.duration) &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            disabled={saving}
                          />
                          {editErrors.minutes && (
                            <p className="mt-1 text-xs text-destructive">
                              {editErrors.minutes}
                            </p>
                          )}
                        </div>
                        {editErrors.duration && (
                          <p className="col-span-2 text-xs text-destructive">
                            {editErrors.duration}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {entry.project?.name}
                    </span>

                    {editingId === entry.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void saveDuration(entry.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label={`Save duration: ${entry.description}`}
                          disabled={
                            saving ||
                            Object.keys(validateEdit().errs).length > 0
                          }
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEditing}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label={`Cancel editing duration: ${entry.description}`}
                          disabled={saving}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(entry)}
                        className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                        aria-label={`Edit duration: ${entry.description}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label={`Delete entry: ${entry.description}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
      {entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              No time entries yet
            </span>
            <span className="text-xs text-muted-foreground">
              Create your first time entry to get started
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
