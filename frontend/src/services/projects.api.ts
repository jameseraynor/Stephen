/**
 * Projects API Service
 *
 * API client for project-related endpoints.
 */

import { apiClient } from "@/lib/api-client";
import type {
  Project,
  CreateProject,
  UpdateProject,
  ApiResponse,
  PaginationParams,
} from "@/types";

export const projectsApi = {
  /**
   * List all projects
   */
  async list(
    params?: PaginationParams & { status?: string },
  ): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(
      "/projects",
      params as PaginationParams & Record<string, unknown>,
    );
  },

  /**
   * Get project by ID
   */
  async get(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  /**
   * Create new project
   */
  async create(data: CreateProject): Promise<ApiResponse<Project>> {
    return apiClient.post<Project, CreateProject>("/projects", data);
  },

  /**
   * Update project
   */
  async update(id: string, data: UpdateProject): Promise<ApiResponse<Project>> {
    return apiClient.put<Project, UpdateProject>(`/projects/${id}`, data);
  },

  /**
   * Delete project
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/projects/${id}`);
  },

  /**
   * Get project summary (budget, actuals, projections)
   */
  async getSummary(id: string): Promise<
    ApiResponse<{
      project: Project;
      totalBudget: number;
      totalActuals: number;
      totalProjected: number;
      gpPercentage: number;
    }>
  > {
    return apiClient.get(`/projects/${id}/summary`);
  },
};
