import { NextResponse } from "next/server";
import { timeEntryService } from "@/services/timeEntry.service";

export async function GET() {
  try {
    const [daySeconds, weekSeconds, monthSeconds] = await Promise.all([
      timeEntryService.getSummaryStats("day"),
      timeEntryService.getSummaryStats("week"),
      timeEntryService.getSummaryStats("month"),
    ]);

    const [dayEntries, weekEntries, monthEntries, activeProjects] =
      await Promise.all([
        timeEntryService.getSummaryEntryCount("day"),
        timeEntryService.getSummaryEntryCount("week"),
        timeEntryService.getSummaryEntryCount("month"),
        timeEntryService.getSummaryDistinctProjectsCount("month"),
      ]);

    return NextResponse.json({
      daySeconds,
      weekSeconds,
      monthSeconds,
      dayEntries,
      weekEntries,
      monthEntries,
      activeProjects,
    });
  } catch (error) {
    console.error("GET /api/summary-stats failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch summary stats" },
      { status: 500 },
    );
  }
}
