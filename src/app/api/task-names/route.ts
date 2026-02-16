import { NextResponse } from "next/server";
import { taskNameService } from "@/services/task-name.service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const results = await taskNameService.search(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/task-names failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch task names" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string };
    const created = await taskNameService.findOrCreate(body.name ?? "");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/task-names failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create task name";
    return NextResponse.json({ message }, { status: 400 });
  }
}
