'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api-client';
import { toDateInputValue } from '@/utils/date';
import { useUpdateTask } from '@/features/tasks/hooks/useUpdateTask';
import type { Task } from '@/types/task';
import { TaskForm, type TaskFormValues } from './TaskForm';

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [error, setError] = useState<string>();
  const updateTask = useUpdateTask();

  function handleSubmit(values: TaskFormValues) {
    setError(undefined);
    updateTask.mutate(
      {
        id: task._id,
        input: {
          title: values.title,
          description: values.description,
          dueDate: new Date(values.dueDate).toISOString(),
        },
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) => setError(err instanceof ApiError ? err.message : 'Failed to update task'),
      },
    );
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setError(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the details of your task.</DialogDescription>
        </DialogHeader>
        <TaskForm
          defaultValues={{
            title: task.title,
            description: task.description,
            dueDate: toDateInputValue(task.dueDate),
          }}
          submitLabel="Save changes"
          isSubmitting={updateTask.isPending}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
