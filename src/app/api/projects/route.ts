import { NextResponse } from "next/server";
import { projectService } from "@/services/project.service";

export async function GET() {
  try {
    const projects = await projectService.getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; color?: string };
    const project = await projectService.createProject({
      name: body.name ?? "",
      color: body.color ?? "",
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ message }, { status: 400 });
  }
}
