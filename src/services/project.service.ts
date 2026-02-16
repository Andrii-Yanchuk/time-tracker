import { projectRepository } from "@/repositories/project.repository";
import { Project } from "@prisma/client";

export type ProjectWithStats = Project & {
  trackedHours: number;
  entryCount: number;
};

export type CreateProjectData = {
  name: string;
  color: string;
};

export type UpdateProjectData = {
  name?: string;
  color?: string;
};

export class ProjectService {
  async getAllProjects(): Promise<ProjectWithStats[]> {
    try {
      return await projectRepository.findWithStats();
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error("Failed to fetch projects");
    }
  }

  async getProjectById(id: number): Promise<Project | null> {
    try {
      return await projectRepository.findById(id);
    } catch (error) {
      console.error("Error fetching project:", error);
      throw new Error("Failed to fetch project");
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      // Validate input
      if (!data.name || data.name.trim().length === 0) {
        throw new Error("Project name is required");
      }

      if (!data.color) {
        throw new Error("Project color is required");
      }

      return await projectRepository.create({
        name: data.name.trim(),
        color: data.color,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create project");
    }
  }

  async updateProject(id: number, data: UpdateProjectData): Promise<Project> {
    try {
      // Validate input
      if (data.name !== undefined && data.name.trim().length === 0) {
        throw new Error("Project name cannot be empty");
      }

      const updateData: UpdateProjectData = {};
      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.color !== undefined) {
        updateData.color = data.color;
      }

      return await projectRepository.update(id, updateData);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update project");
    }
  }

  async deleteProject(id: number): Promise<Project> {
    try {
      // Check if project exists
      const project = await projectRepository.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }

      return await projectRepository.delete(id);
    } catch (error) {
      console.error("Error deleting project:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete project");
    }
  }

  async getActiveProjects(): Promise<ProjectWithStats[]> {
    try {
      const allProjects = await this.getAllProjects();
      // For now, all projects are considered active
      // In the future, you might add an 'active' status field to the Project model
      return allProjects;
    } catch (error) {
      console.error("Error fetching active projects:", error);
      throw new Error("Failed to fetch active projects");
    }
  }

  async getArchivedProjects(): Promise<ProjectWithStats[]> {
    try {
      const allProjects = await this.getAllProjects();
      // For now, return empty array as we don't have archived status
      // In the future, you might add an 'archived' status field to the Project model
      return [];
    } catch (error) {
      console.error("Error fetching archived projects:", error);
      throw new Error("Failed to fetch archived projects");
    }
  }

  async getProjectStats(): Promise<{
    totalProjects: number;
    totalHours: number;
    activeProjects: number;
  }> {
    try {
      const projects = await this.getAllProjects();

      const totalProjects = projects.length;
      const totalHours = projects.reduce(
        (sum, project) => sum + project.trackedHours,
        0,
      );
      const activeProjects = projects.length; // All projects are active for now

      return {
        totalProjects,
        totalHours,
        activeProjects,
      };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      throw new Error("Failed to fetch project stats");
    }
  }
}

export const projectService = new ProjectService();
