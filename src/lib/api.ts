import type {
  CreateProjectData,
  ProjectWithStats,
} from "@/services/project.service";
import type {
  CreateTimeEntryData,
  TimeEntryWithProject,
  UpdateTimeEntryData,
} from "@/services/timeEntry.service";
import type { TaskName } from "@prisma/client";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number")
    return new Date(value);
  return new Date("");
}

function normalizeTimeEntry(entry: TimeEntryWithProject): TimeEntryWithProject {
  return {
    ...entry,
    start: toDate(entry.start),
    end: entry.end ? toDate(entry.end) : null,
  };
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function requestJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fieldErrors: Record<string, string> | undefined;
    try {
      const data = (await res.json()) as {
        message?: string;
        fieldErrors?: Record<string, string>;
      };
      if (data?.message) message = data.message;
      if (data?.fieldErrors) fieldErrors = data.fieldErrors;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message, fieldErrors);
  }

  return (await res.json()) as T;
}

export const projectsApi = {
  getAll(): Promise<ProjectWithStats[]> {
    return requestJson<ProjectWithStats[]>("/api/projects");
  },
  create(data: CreateProjectData) {
    return requestJson<ProjectWithStats | { id: number }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: number, data: Partial<CreateProjectData>) {
    return requestJson<ProjectWithStats>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(id: number) {
    return requestJson<unknown>(`/api/projects/${id}`, { method: "DELETE" });
  },
};

export const taskNamesApi = {
  search(query: string): Promise<TaskName[]> {
    const sp = new URLSearchParams();
    sp.set("q", query);
    return requestJson<TaskName[]>(`/api/task-names?${sp.toString()}`);
  },
  findOrCreate(name: string): Promise<TaskName> {
    return requestJson<TaskName>("/api/task-names", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
};

export const timeEntriesApi = {
  getAll(): Promise<TimeEntryWithProject[]> {
    return requestJson<TimeEntryWithProject[]>("/api/time-entries").then(
      (data) => data.map(normalizeTimeEntry),
    );
  },
  getToday(): Promise<TimeEntryWithProject[]> {
    return requestJson<TimeEntryWithProject[]>(
      "/api/time-entries?today=true",
    ).then((data) => data.map(normalizeTimeEntry));
  },
  getActive(): Promise<TimeEntryWithProject[]> {
    return requestJson<TimeEntryWithProject[]>(
      "/api/time-entries?active=true",
    ).then((data) => data.map(normalizeTimeEntry));
  },
  getReport(params: { start?: Date; end?: Date; projectId?: number }) {
    const sp = new URLSearchParams();
    if (params.start) sp.set("start", params.start.toISOString());
    if (params.end) sp.set("end", params.end.toISOString());
    if (params.projectId !== undefined)
      sp.set("projectId", String(params.projectId));
    const qs = sp.toString();
    return requestJson<TimeEntryWithProject[]>(
      `/api/time-entries${qs ? `?${qs}` : ""}`,
    ).then((data) => data.map(normalizeTimeEntry));
  },
  create(data: CreateTimeEntryData) {
    return requestJson<TimeEntryWithProject>("/api/time-entries", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        start: data.start.toISOString(),
        end: data.end ? data.end.toISOString() : undefined,
      }),
    }).then(normalizeTimeEntry);
  },
  update(id: number, data: UpdateTimeEntryData) {
    return requestJson<TimeEntryWithProject>(`/api/time-entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...data,
        start: data.start ? data.start.toISOString() : undefined,
        end: data.end ? data.end.toISOString() : undefined,
      }),
    }).then(normalizeTimeEntry);
  },
  delete(id: number) {
    return requestJson<unknown>(`/api/time-entries/${id}`, {
      method: "DELETE",
    });
  },
};
