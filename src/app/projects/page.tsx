"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectsApi } from "@/lib/api";
import type {
  ProjectWithStats,
  CreateProjectData,
} from "@/services/project.service";

// ─── Color palette ───────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { id: "blue", label: "Blue", value: "#3B82F6", tw: "bg-[#3B82F6]" },
  { id: "green", label: "Green", value: "#10B981", tw: "bg-[#10B981]" },
  { id: "amber", label: "Amber", value: "#F59E0B", tw: "bg-[#F59E0B]" },
  { id: "rose", label: "Rose", value: "#F43F5E", tw: "bg-[#F43F5E]" },
  { id: "indigo", label: "Indigo", value: "#6366F1", tw: "bg-[#6366F1]" },
  { id: "teal", label: "Teal", value: "#14B8A6", tw: "bg-[#14B8A6]" },
  { id: "orange", label: "Orange", value: "#F97316", tw: "bg-[#F97316]" },
  { id: "cyan", label: "Cyan", value: "#06B6D4", tw: "bg-[#06B6D4]" },
  { id: "pink", label: "Pink", value: "#EC4899", tw: "bg-[#EC4899]" },
  { id: "slate", label: "Slate", value: "#64748B", tw: "bg-[#64748B]" },
];

function getColor(color: string) {
  return COLOR_OPTIONS.find((c) => c.value === color) ?? COLOR_OPTIONS[0];
}

// ─── Color Picker ────────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onChange(color.id)}
          className={cn(
            "relative h-8 w-8 rounded-full transition-all",
            color.tw,
            value === color.id
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
              : "hover:scale-110 opacity-70 hover:opacity-100",
          )}
          aria-label={`Select ${color.label}`}
          aria-pressed={value === color.id}
        >
          {value === color.id && (
            <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Add/Edit Dialog ─────────────────────────────────────────────────────────

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectWithStats | null;
  onSave: (data: CreateProjectData) => void;
}

function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <ProjectDialogForm
          key={`${open ? "open" : "closed"}-${project?.id ?? "new"}`}
          project={project}
          onSave={onSave}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ProjectDialogForm({
  project,
  onSave,
  onClose,
}: {
  project: ProjectWithStats | null;
  onSave: (data: CreateProjectData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(() => project?.name ?? "");
  const [colorId, setColorId] = useState(() => {
    if (project?.color) {
      const colorOption = COLOR_OPTIONS.find((c) => c.value === project.color);
      return colorOption?.id ?? "blue";
    }
    return "blue";
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Small delay for the dialog animation
    const timer = setTimeout(() => nameInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const isValid = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const selectedColor = COLOR_OPTIONS.find((c) => c.id === colorId);
    if (!selectedColor) return;

    onSave({
      name: name.trim(),
      color: selectedColor.value,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        <DialogDescription>
          {project
            ? "Update the project details below."
            : "Add a new project to organize your time entries."}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input
            ref={nameInputRef}
            id="project-name"
            placeholder="e.g. Marketing Website"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10"
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-2.5">
          <Label>Color</Label>
          <ColorPicker value={colorId} onChange={setColorId} />
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: getColor(colorId).value }}
          />
          <span className="text-sm font-medium text-foreground">
            {name || "Project Name"}
          </span>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid}>
          {project ? "Save Changes" : "Create Project"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Delete Confirmation ─────────────────────────────────────────────────────

function DeleteDialog({
  open,
  onOpenChange,
  projectName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            {"Are you sure you want to delete "}
            <span className="font-medium text-foreground">{projectName}</span>
            {
              "? This action cannot be undone. All associated time entries will be unlinked."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectWithStats;
  onEdit: (p: ProjectWithStats) => void;
  onDelete: (p: ProjectWithStats) => void;
}) {
  const color = getColor(project.color);

  return (
    <Card className="group border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-4 p-5">
        {/* Color indicator */}
        <div
          className="mt-1 h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color.value}15` }}
        >
          <FolderKanban className="h-5 w-5" style={{ color: color.value }} />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color.value }}
            />
            <span className="truncate text-sm font-semibold text-foreground">
              {project.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="font-mono tabular-nums">
                {project.trackedHours.toFixed(1)}h
              </span>
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
              {project.entryCount} entries
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Projects Page ──────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] =
    useState<ProjectWithStats | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      // You could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter((p) => true); // All projects are active for now
  const archivedProjects = projects.filter((p) => false); // No archived projects for now
  const totalHours = projects.reduce((s, p) => s + p.trackedHours, 0);

  const handleAdd = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleEdit = (project: ProjectWithStats) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (project: ProjectWithStats) => {
    setDeletingProject(project);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: CreateProjectData) => {
    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, data);
      } else {
        await projectsApi.create(data);
      }
      await loadProjects(); // Reload projects
    } catch (error) {
      console.error("Failed to save project:", error);
      // You could add toast notification here
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    try {
      await projectsApi.delete(deletingProject.id);
      await loadProjects(); // Reload projects
    } catch (error) {
      console.error("Failed to delete project:", error);
      // You could add toast notification here
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your projects and organize time entries.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Summary strip */}
      <div className="mb-6 flex items-center gap-6 rounded-lg border border-border bg-card px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total
          </span>
          <Badge
            variant="secondary"
            className="text-xs font-normal bg-muted text-muted-foreground"
          >
            {projects.length} projects
          </Badge>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="font-mono font-medium tabular-nums text-foreground">
            {totalHours.toFixed(1)}h
          </span>
          tracked
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          {activeProjects.length} active
        </span>
      </div>

      {/* Active projects */}
      {activeProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Projects
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived projects */}
      {archivedProjects.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Archived
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {archivedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              No projects yet
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Create your first project to start organizing time entries.
            </p>
          </div>
          <Button onClick={handleAdd} size="sm" className="mt-2 gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSave={handleSave}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={deletingProject?.name ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
