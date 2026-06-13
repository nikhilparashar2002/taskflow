import type { Task } from '@/types/task';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

/** Derive the dashboard stat-row metrics from a list of tasks. */
export function getTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, pending, completionRate };
}
