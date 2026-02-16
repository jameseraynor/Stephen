/**
 * useProjects Hook
 *
 * Custom hook for managing projects with CRUD operations.
 */

import { useEffect, useCallback } from "react";
import { projectsApi } from "@/services/projects.api";
import { useApi, useApiMutation } from "./useApi";
import type {
  Project,
  CreateProject,
  UpdateProject,
  PaginationParams,
} from "@/types";

interface UseProjectsOptions {
  autoFetch?: boolean;
  filters?: PaginationParams & { status?: string };
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { autoFetch = true, filters } = options;

  // List projects
  const {
    data: projects,
    isLoading,
    error,
    execute: fetchProjects,
  } = useApi<Project[]>(projectsApi.list);

  // Create project
  const {
    isLoading: isCreating,
    error: createError,
    mutate: createProject,
  } = useApiMutation<Project, [CreateProject]>(projectsApi.create);

  // Update project
  const {
    isLoading: isUpdating,
    error: updateError,
    mutate: updateProject,
  } = useApiMutation<Project, [string, UpdateProject]>(projectsApi.update);

  // Delete project
  const {
    isLoading: isDeleting,
    error: deleteError,
    mutate: deleteProject,
  } = useApiMutation<null, [string]>(projectsApi.delete);

  /**
   * Fetch projects on mount or when filters change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchProjects(filters);
    }
  }, [autoFetch, filters, fetchProjects]);

  /**
   * Refetch projects
   */
  const refetch = useCallback(() => {
    return fetchProjects(filters);
  }, [fetchProjects, filters]);

  /**
   * Create and refetch
   */
  const create = useCallback(
    async (data: CreateProject) => {
      const project = await createProject(data);
      await refetch();
      return project;
    },
    [createProject, refetch],
  );

  /**
   * Update and refetch
   */
  const update = useCallback(
    async (id: string, data: UpdateProject) => {
      const project = await updateProject(id, data);
      await refetch();
      return project;
    },
    [updateProject, refetch],
  );

  /**
   * Delete and refetch
   */
  const remove = useCallback(
    async (id: string) => {
      await deleteProject(id);
      await refetch();
    },
    [deleteProject, refetch],
  );

  return {
    // Data
    projects: projects || [],

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isMutating: isCreating || isUpdating || isDeleting,

    // Errors
    error,
    createError,
    updateError,
    deleteError,

    // Actions
    refetch,
    create,
    update,
    remove,
  };
}

/**
 * useProject Hook
 *
 * Hook for managing a single project.
 */
export function useProject(id: string) {
  const {
    data: project,
    isLoading,
    error,
    execute: fetchProject,
  } = useApi<Project>(projectsApi.get);

  /**
   * Fetch project on mount or when ID changes
   */
  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  /**
   * Refetch project
   */
  const refetch = useCallback(() => {
    return fetchProject(id);
  }, [fetchProject, id]);

  return {
    project,
    isLoading,
    error,
    refetch,
  };
}
