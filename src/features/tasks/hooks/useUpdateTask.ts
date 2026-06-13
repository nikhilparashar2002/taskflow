'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { taskService } from '@/services/taskService';
import type { Task, UpdateTaskInput } from '@/types/task';
import { taskKeys } from './queryKeys';

interface UpdateVariables {
  id: string;
  input: UpdateTaskInput;
}

interface UpdateContext {
  previous: Array<[readonly unknown[], Task[] | undefined]>;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateVariables, UpdateContext>({
    mutationFn: ({ id, input }) => taskService.updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });

      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (old) =>
        old?.map((task) =>
          task._id === id ? { ...task, ...input, updatedAt: new Date().toISOString() } : task,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
