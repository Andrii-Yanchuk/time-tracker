import { NextResponse } from "next/server";
import { timeEntryService } from "@/services/timeEntry.service";
import { ValidationError } from "@/services/timeEntry.service";

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const today = url.searchParams.get("today");
    const active = url.searchParams.get("active");
    const start = parseDate(url.searchParams.get("start"));
    const end = parseDate(url.searchParams.get("end"));
    const projectIdParam = url.searchParams.get("projectId");
    const projectId = projectIdParam ? Number(projectIdParam) : undefined;

    if (today === "1" || today === "true") {
      const entries = await timeEntryService.getTodayEntries();
      return NextResponse.json(entries);
    }

    if (active === "1" || active === "true") {
      const entries = await timeEntryService.getActiveTimers();
      return NextResponse.json(entries);
    }

    if (start || end || projectId !== undefined) {
      const entries = await timeEntryService.getReportData(
        start,
        end,
        projectId,
      );
      return NextResponse.json(entries);
    }

    const entries = await timeEntryService.getAllTimeEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/time-entries failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch time entries" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      description?: string;
      start?: string;
      end?: string;
      duration?: number;
      projectId?: number;
    };

    const entry = await timeEntryService.createTimeEntry({
      description: body.description ?? "",
      start: body.start ? new Date(body.start) : new Date(""),
      end: body.end ? new Date(body.end) : undefined,
      duration: body.duration,
      projectId: body.projectId,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/time-entries failed:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to create time entry";
    return NextResponse.json({ message }, { status: 400 });
  }
}
