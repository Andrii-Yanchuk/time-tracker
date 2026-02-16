"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError, projectsApi, timeEntriesApi } from "@/lib/api";
import type { ProjectWithStats } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Timer() {
  const { toast } = useToast();
  const [task, setTask] = useState("");
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [manualHours, setManualHours] = useState<string>("");
  const [manualMinutes, setManualMinutes] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    if (intervalRef.current) return;

    setFieldErrors({});

    try {
      const entry = await timeEntriesApi.create({
        description: task,
        start: new Date(),
        projectId: project ? parseInt(project) : undefined,
      });

      setCurrentEntryId(entry.id);
      setRunning(true);
      setElapsed(0);

      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      toast({
        title: "Timer started",
        description: "Tracking has started.",
      });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      }
      toast({
        title: "Failed to start",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [task, project, toast]);

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (currentEntryId) {
      try {
        await timeEntriesApi.update(currentEntryId, {
          end: new Date(),
        });
        setCurrentEntryId(null);

        toast({
          title: "Timer stopped",
          description: "Time entry saved.",
        });
      } catch (error) {
        toast({
          title: "Failed to stop",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    }

    setRunning(false);
  }, [currentEntryId, toast]);

  const manualSeconds = (() => {
    const h = manualHours.trim() === "" ? 0 : Number(manualHours);
    const m = manualMinutes.trim() === "" ? 0 : Number(manualMinutes);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 3600 + m * 60;
  })();

  const clientValidate = () => {
    const errs: Record<string, string> = {};

    if (task.trim().length === 0)
      errs.description = "Task name cannot be empty";
    if (!project) errs.projectId = "Project must be selected";

    const hasManual = manualHours.trim() !== "" || manualMinutes.trim() !== "";
    if (hasManual) {
      const h = manualHours.trim() === "" ? 0 : Number(manualHours);
      const m = manualMinutes.trim() === "" ? 0 : Number(manualMinutes);
      if (!Number.isInteger(h) || h < 0 || h > 23)
        errs.manualHours = "Hours must be 0–23";
      if (!Number.isInteger(m) || m < 0 || m > 59)
        errs.manualMinutes = "Minutes must be 0–59";

      if (manualSeconds !== null && manualSeconds <= 0) {
        errs.duration = "Time duration must be > 0";
      }
    }

    return errs;
  };

  const handleManualSave = async () => {
    const errs = clientValidate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (manualSeconds === null) return;

    try {
      setFieldErrors({});
      await timeEntriesApi.create({
        description: task,
        start: new Date(),
        end: new Date(),
        duration: manualSeconds,
        projectId: parseInt(project),
      });

      toast({
        title: "Saved",
        description: "Time entry saved.",
      });

      setTask("");
      setProject("");
      setManualHours("");
      setManualMinutes("");
      setElapsed(0);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      }
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    void projectsApi
      .getAll()
      .then((projectsData) => {
        setProjects(projectsData);
      })
      .catch((error) => {
        console.error("Failed to load projects:", error);
      });

    void timeEntriesApi
      .getActive()
      .then((active) => {
        const entry = active[0];
        if (!entry) return;

        setCurrentEntryId(entry.id);
        setTask(entry.description);
        setProject(entry.projectId ? entry.projectId.toString() : "");

        const startedAt = new Date(entry.start).getTime();
        const now = Date.now();
        const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
        setElapsed(seconds);

        setRunning(true);
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            setElapsed((prev) => prev + 1);
          }, 1000);
        }
      })
      .catch((error) => {
        console.error("Failed to restore active timer:", error);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleToggle = () => {
    if (running) {
      void stop();
      return;
    }
    void start();
  };

  const handleReset = () => {
    void stop();
    setElapsed(0);
    setTask("");
    setProject("");
    setManualHours("");
    setManualMinutes("");
    setFieldErrors({});
  };

  const selectedProject = projects.find((p) => p.id.toString() === project);

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Timer display */}
      <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-6">
        <div className="relative flex items-center gap-3">
          {running && (
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          )}
          <span
            className={cn(
              "font-mono text-5xl font-bold tracking-wider tabular-nums transition-colors",
              running ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {formatElapsed(elapsed)}
          </span>
        </div>
        {running && (
          <Badge
            variant="secondary"
            className="bg-accent/10 text-accent border border-accent/20 text-xs"
          >
            Recording
          </Badge>
        )}
        {!running && elapsed === 0 && (
          <p className="text-xs text-muted-foreground">
            Ready to start tracking
          </p>
        )}
        {!running && elapsed > 0 && (
          <p className="text-xs text-muted-foreground">Timer paused</p>
        )}
      </div>

      {/* Task and project inputs */}
      <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
        <div>
          <label
            htmlFor="timer-task"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            What are you working on?
          </label>
          <Input
            id="timer-task"
            placeholder="e.g. Dashboard UI redesign"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className={cn(
              "h-10 bg-background text-sm",
              fieldErrors.description &&
                "border-destructive focus-visible:ring-destructive",
            )}
            disabled={running}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.description}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="timer-project"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Project
          </label>
          <Select value={project} onValueChange={setProject} disabled={running}>
            <SelectTrigger
              id="timer-project"
              className={cn(
                "h-10 bg-background text-sm",
                fieldErrors.projectId && "border-destructive ring-destructive",
              )}
            >
              <SelectValue placeholder="Select a project">
                {selectedProject && (
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full",
                        selectedProject.color,
                      )}
                    />
                    {selectedProject.name}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full",
                        p.color,
                      )}
                    />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.projectId && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.projectId}
            </p>
          )}
        </div>

        {/* Manual duration */}
        {!running && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Manual time (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  inputMode="numeric"
                  placeholder="Hours"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  className={cn(
                    "h-10 bg-background text-sm",
                    (fieldErrors.manualHours || fieldErrors.duration) &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {fieldErrors.manualHours && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.manualHours}
                  </p>
                )}
              </div>
              <div>
                <Input
                  inputMode="numeric"
                  placeholder="Minutes"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className={cn(
                    "h-10 bg-background text-sm",
                    (fieldErrors.manualMinutes || fieldErrors.duration) &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {fieldErrors.manualMinutes && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.manualMinutes}
                  </p>
                )}
              </div>
            </div>
            {fieldErrors.duration && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.duration}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 border-t border-border px-6 py-4">
        {!running &&
        (manualHours.trim() !== "" || manualMinutes.trim() !== "") ? (
          <Button
            onClick={handleManualSave}
            className={cn(
              "flex-1 gap-2 font-medium bg-accent text-accent-foreground hover:bg-accent/90",
            )}
            size="lg"
            disabled={Object.keys(clientValidate()).length > 0}
          >
            Save
          </Button>
        ) : (
          <Button
            onClick={handleToggle}
            className={cn(
              "flex-1 gap-2 font-medium",
              running
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/90",
            )}
            size="lg"
            disabled={!running && Object.keys(clientValidate()).length > 0}
          >
            {running ? (
              <>
                <Square className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 ml-0.5" />
                Start
              </>
            )}
          </Button>
        )}
        {(elapsed > 0 || running) && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
