'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { taskService } from '@/services/taskService';
import type { CreateTaskInput, Task } from '@/types/task';
import { taskKeys } from './queryKeys';

interface CreateContext {
  previous: Array<[readonly unknown[], Task[] | undefined]>;
}

/** Build an optimistic placeholder task from the create input. */
function optimisticTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  return {
    _id: `temp-${crypto.randomUUID()}`,
    userId: 'optimistic',
    title: input.title,
    description: input.description,
    status: 'pending',
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskInput, CreateContext>({
    mutationFn: (input) => taskService.createTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });

      const placeholder = optimisticTask(input);
      // Prepend to every cached task list (createdAt-desc ordering).
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (old) =>
        old ? [placeholder, ...old] : [placeholder],
      );

      return { previous };
    },
    onError: (_err, _input, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
