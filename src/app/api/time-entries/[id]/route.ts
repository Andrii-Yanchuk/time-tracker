import { NextResponse } from "next/server";
import { timeEntryService } from "@/services/timeEntry.service";
import { ValidationError } from "@/services/timeEntry.service";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const entryId = Number(id);

    const body = (await req.json()) as {
      description?: string;
      start?: string;
      end?: string;
      duration?: number;
      projectId?: number;
    };

    const updated = await timeEntryService.updateTimeEntry(entryId, {
      description: body.description,
      start: body.start ? new Date(body.start) : undefined,
      end: body.end ? new Date(body.end) : undefined,
      duration: body.duration,
      projectId: body.projectId,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/time-entries/:id failed:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to update time entry";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const entryId = Number(id);

    const deleted = await timeEntryService.deleteTimeEntry(entryId);
    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/time-entries/:id failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete time entry";
    return NextResponse.json({ message }, { status: 400 });
  }
}
