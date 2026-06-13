'use client';

import { useQuery } from '@tanstack/react-query';

import { taskService } from '@/services/taskService';
import type { TaskFilters } from '@/types/task';
import { taskKeys } from './queryKeys';

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskService.getTasks(filters),
  });
}
