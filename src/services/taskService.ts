import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/constants';
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '@/types/task';

function buildTasksUrl(filters?: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString();
  return qs ? `${API_ROUTES.tasks.base}?${qs}` : API_ROUTES.tasks.base;
}

export const taskService = {
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    const data = await apiClient<{ tasks: Task[] }>(buildTasksUrl(filters));
    return data.tasks;
  },

  getTask: async (id: string): Promise<Task> => {
    const data = await apiClient<{ task: Task }>(API_ROUTES.tasks.byId(id));
    return data.task;
  },

  createTask: async (input: CreateTaskInput): Promise<Task> => {
    const data = await apiClient<{ task: Task }>(API_ROUTES.tasks.base, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data.task;
  },

  updateTask: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const data = await apiClient<{ task: Task }>(API_ROUTES.tasks.byId(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return data.task;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient<{ message: string }>(API_ROUTES.tasks.byId(id), {
      method: 'DELETE',
    });
  },
};
