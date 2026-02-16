import { NextResponse } from "next/server";
import { projectService } from "@/services/project.service";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const projectId = Number(id);
    const body = (await req.json()) as { name?: string; color?: string };

    const updated = await projectService.updateProject(projectId, {
      name: body.name,
      color: body.color,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/projects/:id failed:", error);
    const message = error instanceof Error ? error.message : "Failed to update project";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const projectId = Number(id);

    const deleted = await projectService.deleteProject(projectId);
    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/projects/:id failed:", error);
    const message = error instanceof Error ? error.message : "Failed to delete project";
    return NextResponse.json({ message }, { status: 400 });
  }
}
