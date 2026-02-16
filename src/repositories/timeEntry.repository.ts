import { prisma } from "@/lib/prisma";
import { TimeEntry, Project } from "@prisma/client";

export type TimeEntryWithProject = TimeEntry & {
  project: Project | null;
};

export class TimeEntryRepository {
  async findAll(): Promise<TimeEntryWithProject[]> {
    return await prisma.timeEntry.findMany({
      include: {
        project: true,
      },
      orderBy: {
        start: "desc",
      },
    });
  }

  async sumDurationSecondsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await prisma.timeEntry.aggregate({
      where: {
        start: {
          gte: startDate,
          lt: endDate,
        },
        duration: {
          not: null,
        },
      },
      _sum: {
        duration: true,
      },
    });

    return result._sum.duration ?? 0;
  }

  async countEntriesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return await prisma.timeEntry.count({
      where: {
        start: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  async countDistinctProjectsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const rows = await prisma.timeEntry.findMany({
      where: {
        start: {
          gte: startDate,
          lt: endDate,
        },
        projectId: {
          not: null,
        },
      },
      distinct: ["projectId"],
      select: {
        projectId: true,
      },
    });

    return rows.length;
  }

  async findActiveTimers(): Promise<TimeEntryWithProject[]> {
    return await prisma.timeEntry.findMany({
      where: {
        end: null,
      },
      include: {
        project: true,
      },
      orderBy: {
        start: "desc",
      },
    });
  }

  async findById(id: number): Promise<TimeEntryWithProject | null> {
    return await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  async create(data: {
    description: string;
    start: Date;
    end?: Date;
    duration?: number;
    projectId?: number;
  }): Promise<TimeEntryWithProject> {
    return await prisma.timeEntry.create({
      data,
      include: {
        project: true,
      },
    });
  }

  async update(
    id: number,
    data: {
      description?: string;
      start?: Date;
      end?: Date;
      duration?: number;
      projectId?: number;
    },
  ): Promise<TimeEntryWithProject> {
    return await prisma.timeEntry.update({
      where: { id },
      data,
      include: {
        project: true,
      },
    });
  }

  async delete(id: number): Promise<TimeEntryWithProject> {
    return await prisma.timeEntry.delete({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TimeEntryWithProject[]> {
    return await prisma.timeEntry.findMany({
      where: {
        start: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        start: "desc",
      },
    });
  }

  async findByProject(projectId: number): Promise<TimeEntryWithProject[]> {
    return await prisma.timeEntry.findMany({
      where: {
        projectId,
      },
      include: {
        project: true,
      },
      orderBy: {
        start: "desc",
      },
    });
  }

  async findTodayEntries(): Promise<TimeEntryWithProject[]> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return await prisma.timeEntry.findMany({
      where: {
        start: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        start: "desc",
      },
    });
  }

  async getReportData(
    startDate?: Date,
    endDate?: Date,
    projectId?: number,
  ): Promise<TimeEntryWithProject[]> {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.start = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    return await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        project: true,
      },
      orderBy: {
        start: "desc",
      },
    });
  }
}

export const timeEntryRepository = new TimeEntryRepository();
