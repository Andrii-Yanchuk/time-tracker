import {
  timeEntryRepository,
  type TimeEntryWithProject,
} from "@/repositories/timeEntry.repository";
import { taskNameRepository } from "@/repositories/taskName.repository";

export type CreateTimeEntryData = {
  description: string;
  start: Date;
  end?: Date;
  duration?: number;
  projectId?: number;
};

export type UpdateTimeEntryData = {
  description?: string;
  start?: Date;
  end?: Date;
  duration?: number;
  projectId?: number;
};

export type { TimeEntryWithProject };

export type SummaryPeriod = "day" | "week" | "month";

export class ValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export class TimeEntryService {
  private getDateRange(period: SummaryPeriod): { start: Date; end: Date } {
    const now = new Date();

    if (period === "day") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      return { start, end };
    }

    if (period === "week") {
      // Week starts on Monday
      const dayOfWeek = now.getDay(); // 0 (Sun) .. 6 (Sat)
      const diffToMonday = (dayOfWeek + 6) % 7;
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diffToMonday,
      );
      const end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 7,
      );
      return { start, end };
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  async getSummaryStats(period: SummaryPeriod): Promise<number> {
    try {
      const { start, end } = this.getDateRange(period);
      return await timeEntryRepository.sumDurationSecondsByDateRange(
        start,
        end,
      );
    } catch (error) {
      console.error("Error fetching summary stats:", error);
      throw new Error("Failed to fetch summary stats");
    }
  }

  async getSummaryEntryCount(period: SummaryPeriod): Promise<number> {
    try {
      const { start, end } = this.getDateRange(period);
      return await timeEntryRepository.countEntriesByDateRange(start, end);
    } catch (error) {
      console.error("Error fetching summary entry count:", error);
      throw new Error("Failed to fetch summary entry count");
    }
  }

  async getSummaryDistinctProjectsCount(
    period: SummaryPeriod,
  ): Promise<number> {
    try {
      const { start, end } = this.getDateRange(period);
      return await timeEntryRepository.countDistinctProjectsByDateRange(
        start,
        end,
      );
    } catch (error) {
      console.error("Error fetching summary project count:", error);
      throw new Error("Failed to fetch summary project count");
    }
  }

  async getAllTimeEntries(): Promise<TimeEntryWithProject[]> {
    try {
      return await timeEntryRepository.findAll();
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw new Error("Failed to fetch time entries");
    }
  }

  async getTimeEntryById(id: number): Promise<TimeEntryWithProject | null> {
    try {
      return await timeEntryRepository.findById(id);
    } catch (error) {
      console.error("Error fetching time entry:", error);
      throw new Error("Failed to fetch time entry");
    }
  }

  async createTimeEntry(
    data: CreateTimeEntryData,
  ): Promise<TimeEntryWithProject> {
    try {
      const fieldErrors: Record<string, string> = {};

      if (!data.description || data.description.trim().length === 0) {
        fieldErrors.description = "Task name cannot be empty";
      }

      if (data.projectId === undefined || data.projectId === null) {
        fieldErrors.projectId = "Project must be selected";
      }

      if (!data.start || Number.isNaN(data.start.getTime())) {
        fieldErrors.start = "Start time is required";
      }

      if (data.end && Number.isNaN(data.end.getTime())) {
        fieldErrors.end = "End time is invalid";
      }

      if (data.start && data.end && data.start.getTime() > data.end.getTime()) {
        fieldErrors.end = "Start time cannot be after end time";
      }

      // Auto-calculate duration if end time is provided
      let duration = data.duration;
      if (data.end && duration === undefined && data.start) {
        duration = Math.floor(
          (data.end.getTime() - data.start.getTime()) / 1000,
        );
      }

      // Duration rules:
      // - Active timers may have no end and no duration yet
      // - Completed/manual entries must have duration > 0
      if (duration !== undefined) {
        if (!Number.isFinite(duration) || duration <= 0) {
          fieldErrors.duration = "Time duration must be > 0";
        }
      } else if (data.end) {
        fieldErrors.duration = "Time duration must be > 0";
      }

      if (duration !== undefined && duration < 0) {
        fieldErrors.duration = "Time duration cannot be negative";
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw new ValidationError("Invalid time entry", fieldErrors);
      }

      const description = data.description.trim();
      await taskNameRepository.findOrCreate(description);

      return await timeEntryRepository.create({
        description,
        start: data.start,
        end: data.end,
        duration,
        projectId: data.projectId,
      });
    } catch (error) {
      console.error("Error creating time entry:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create time entry");
    }
  }

  async updateTimeEntry(
    id: number,
    data: UpdateTimeEntryData,
  ): Promise<TimeEntryWithProject> {
    try {
      const fieldErrors: Record<string, string> = {};

      if (
        data.description !== undefined &&
        data.description.trim().length === 0
      ) {
        fieldErrors.description = "Task name cannot be empty";
      }

      if (data.projectId !== undefined && data.projectId === null) {
        fieldErrors.projectId = "Project must be selected";
      }

      const updateData: UpdateTimeEntryData = {};
      if (data.description !== undefined) {
        updateData.description = data.description.trim();
      }
      if (data.start !== undefined) {
        updateData.start = data.start;
      }
      if (data.end !== undefined) {
        updateData.end = data.end;
      }
      if (data.duration !== undefined) {
        updateData.duration = data.duration;
      }
      if (data.projectId !== undefined) {
        updateData.projectId = data.projectId;
      }

      if (updateData.start && Number.isNaN(updateData.start.getTime())) {
        fieldErrors.start = "Start time is invalid";
      }
      if (updateData.end && Number.isNaN(updateData.end.getTime())) {
        fieldErrors.end = "End time is invalid";
      }

      // Auto-calculate duration if end time is provided but duration is not
      if (updateData.end && !updateData.duration) {
        const existingEntry = await timeEntryRepository.findById(id);
        const startTime = updateData.start || existingEntry?.start;
        if (startTime) {
          updateData.duration = Math.floor(
            (updateData.end.getTime() - startTime.getTime()) / 1000,
          );
        }
      }

      if (updateData.start && updateData.end) {
        if (updateData.start.getTime() > updateData.end.getTime()) {
          fieldErrors.end = "Start time cannot be after end time";
        }
      }

      if (updateData.duration !== undefined) {
        if (!Number.isFinite(updateData.duration) || updateData.duration <= 0) {
          fieldErrors.duration = "Time duration must be > 0";
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw new ValidationError("Invalid time entry", fieldErrors);
      }

      if (updateData.description !== undefined) {
        await taskNameRepository.findOrCreate(updateData.description);
      }

      return await timeEntryRepository.update(id, updateData);
    } catch (error) {
      console.error("Error updating time entry:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update time entry");
    }
  }

  async deleteTimeEntry(id: number): Promise<TimeEntryWithProject> {
    try {
      // Check if time entry exists
      const timeEntry = await timeEntryRepository.findById(id);
      if (!timeEntry) {
        throw new Error("Time entry not found");
      }

      return await timeEntryRepository.delete(id);
    } catch (error) {
      console.error("Error deleting time entry:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete time entry");
    }
  }

  async getTodayEntries(): Promise<TimeEntryWithProject[]> {
    try {
      return await timeEntryRepository.findTodayEntries();
    } catch (error) {
      console.error("Error fetching today entries:", error);
      throw new Error("Failed to fetch today entries");
    }
  }

  async getEntriesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TimeEntryWithProject[]> {
    try {
      return await timeEntryRepository.findByDateRange(startDate, endDate);
    } catch (error) {
      console.error("Error fetching entries by date range:", error);
      throw new Error("Failed to fetch entries by date range");
    }
  }

  async getEntriesByProject(
    projectId: number,
  ): Promise<TimeEntryWithProject[]> {
    try {
      return await timeEntryRepository.findByProject(projectId);
    } catch (error) {
      console.error("Error fetching entries by project:", error);
      throw new Error("Failed to fetch entries by project");
    }
  }

  async getReportData(
    startDate?: Date,
    endDate?: Date,
    projectId?: number,
  ): Promise<TimeEntryWithProject[]> {
    try {
      return await timeEntryRepository.getReportData(
        startDate,
        endDate,
        projectId,
      );
    } catch (error) {
      console.error("Error fetching report data:", error);
      throw new Error("Failed to fetch report data");
    }
  }

  async getTodayStats(): Promise<{
    totalEntries: number;
    totalHours: number;
    averageEntryDuration: number;
  }> {
    try {
      const todayEntries = await this.getTodayEntries();

      const totalEntries = todayEntries.length;
      const totalHours = todayEntries.reduce((sum, entry) => {
        return sum + (entry.duration ? entry.duration / 3600 : 0);
      }, 0);

      const averageEntryDuration =
        totalEntries > 0
          ? todayEntries.reduce(
              (sum, entry) => sum + (entry.duration || 0),
              0,
            ) / totalEntries
          : 0;

      return {
        totalEntries,
        totalHours,
        averageEntryDuration,
      };
    } catch (error) {
      console.error("Error fetching today stats:", error);
      throw new Error("Failed to fetch today stats");
    }
  }

  async startTimer(
    description: string,
    projectId?: number,
  ): Promise<TimeEntryWithProject> {
    try {
      return await this.createTimeEntry({
        description,
        start: new Date(),
        projectId,
      });
    } catch (error) {
      console.error("Error starting timer:", error);
      throw new Error("Failed to start timer");
    }
  }

  async stopTimer(id: number): Promise<TimeEntryWithProject> {
    try {
      const endTime = new Date();
      return await this.updateTimeEntry(id, {
        end: endTime,
      });
    } catch (error) {
      console.error("Error stopping timer:", error);
      throw new Error("Failed to stop timer");
    }
  }

  async getActiveTimers(): Promise<TimeEntryWithProject[]> {
    try {
      return await timeEntryRepository.findActiveTimers();
    } catch (error) {
      console.error("Error fetching active timers:", error);
      throw new Error("Failed to fetch active timers");
    }
  }
}

export const timeEntryService = new TimeEntryService();
