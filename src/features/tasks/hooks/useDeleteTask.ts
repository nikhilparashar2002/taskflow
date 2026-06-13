'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';
import { taskKeys } from './queryKeys';

interface DeleteContext {
  previous: Array<[readonly unknown[], Task[] | undefined]>;
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, DeleteContext>({
    mutationFn: (id) => taskService.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });

      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (old) =>
        old?.filter((task) => task._id !== id),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
