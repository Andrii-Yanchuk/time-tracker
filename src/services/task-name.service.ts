import { taskNameRepository } from "@/repositories/taskName.repository";
import { TaskName } from "@prisma/client";

export class TaskNameService {
  async search(query: string): Promise<TaskName[]> {
    try {
      const q = query.trim();
      if (!q) return [];
      return await taskNameRepository.search(q);
    } catch (error) {
      console.error("Error searching task names:", error);
      throw new Error("Failed to search task names");
    }
  }

  async findOrCreate(name: string): Promise<TaskName> {
    try {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error("Task name is required");
      }
      return await taskNameRepository.findOrCreate(trimmed);
    } catch (error) {
      console.error("Error creating task name:", error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to create task name");
    }
  }
}

export const taskNameService = new TaskNameService();
