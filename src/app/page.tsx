import { Timer } from "@/components/dashboard/timer";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TimeEntries } from "@/components/dashboard/time-entries";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your time, manage projects, and stay productive.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Timer />
          </div>
          <div className="lg:col-span-2">
            <SummaryCards />
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            {"Today's Time Entries"}
          </h2>
          <TimeEntries />
        </div>
      </div>
    </div>
  );
}
