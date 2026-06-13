'use client';

import { useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { TaskFilters as TaskFiltersType } from '@/types/task';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskFilters, type StatusFilter } from './TaskFilters';
import { TaskList } from './TaskList';
import { TaskStats } from './TaskStats';

export function DashboardClient() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const filters = useMemo<TaskFiltersType>(() => {
    const next: TaskFiltersType = {};
    if (status !== 'all') next.status = status;
    if (debouncedSearch.trim()) next.search = debouncedSearch.trim();
    return next;
  }, [status, debouncedSearch]);

  // Filtered list drives the task list; the unfiltered query keeps the stat
  // row showing global totals regardless of the active filters.
  const tasksQuery = useTasks(filters);
  const allTasksQuery = useTasks();

  const hasActiveFilters = status !== 'all' || debouncedSearch.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Track your progress and stay on top of your tasks.
        </p>
      </div>

      <TaskStats tasks={allTasksQuery.data ?? []} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Your tasks</h2>
          <CreateTaskDialog />
        </div>

        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        <TaskList
          tasks={tasksQuery.data ?? []}
          isLoading={tasksQuery.isLoading}
          isError={tasksQuery.isError}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  );
}
