'use client';

import { ClipboardList } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
}

export function TaskList({ tasks, isLoading, isError, hasActiveFilters }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border p-8 text-center">
        <p className="font-medium">Couldn&apos;t load your tasks.</p>
        <p className="text-sm">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
        <ClipboardList className="size-8" />
        <p className="text-foreground font-medium">
          {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
        </p>
        <p className="text-sm">
          {hasActiveFilters
            ? 'Try adjusting your search or status filter.'
            : 'Create your first task to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
}
