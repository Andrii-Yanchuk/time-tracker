import { prisma } from "@/lib/prisma";
import { Project } from "@prisma/client";

export class ProjectRepository {
  async findAll(): Promise<Project[]> {
    return await prisma.project.findMany({
      include: {
        timeEntries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: number): Promise<Project | null> {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        timeEntries: true,
      },
    });
  }

  async create(data: { name: string; color: string }): Promise<Project> {
    return await prisma.project.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      color?: string;
    },
  ): Promise<Project> {
    return await prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Project> {
    return await prisma.project.delete({
      where: { id },
    });
  }

  async findWithStats(): Promise<
    (Project & {
      trackedHours: number;
      entryCount: number;
    })[]
  > {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            timeEntries: true,
          },
        },
      },
    });

    // Calculate total tracked hours for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const timeEntries = await prisma.timeEntry.findMany({
          where: { projectId: project.id },
          select: { duration: true },
        });

        const totalDuration = timeEntries.reduce(
          (sum, entry) => sum + (entry.duration || 0),
          0,
        );

        return {
          ...project,
          trackedHours: totalDuration / 3600, // Convert seconds to hours
          entryCount: project._count.timeEntries,
        };
      }),
    );

    return projectsWithStats;
  }
}

export const projectRepository = new ProjectRepository();
