import { QUERY_KEYS } from '@/lib/constants';
import type { TaskFilters } from '@/types/task';

/** Query key factory for task queries. */
export const taskKeys = {
  all: [QUERY_KEYS.tasks] as const,
  list: (filters?: TaskFilters) => [QUERY_KEYS.tasks, filters ?? {}] as const,
};
