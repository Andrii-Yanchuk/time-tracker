import { prisma } from "@/lib/prisma";
import { TaskName } from "@prisma/client";

export class TaskNameRepository {
  async findAll(): Promise<TaskName[]> {
    return await prisma.taskName.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findById(id: number): Promise<TaskName | null> {
    return await prisma.taskName.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<TaskName | null> {
    return await prisma.taskName.findUnique({
      where: { name },
    });
  }

  async create(data: { name: string }): Promise<TaskName> {
    return await prisma.taskName.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
    },
  ): Promise<TaskName> {
    return await prisma.taskName.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<TaskName> {
    return await prisma.taskName.delete({
      where: { id },
    });
  }

  async findOrCreate(name: string): Promise<TaskName> {
    let taskName = await this.findByName(name);

    if (!taskName) {
      taskName = await this.create({ name });
    }

    return taskName;
  }

  async search(query: string): Promise<TaskName[]> {
    return await prisma.taskName.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export const taskNameRepository = new TaskNameRepository();
