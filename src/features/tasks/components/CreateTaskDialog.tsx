'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api-client';
import { useCreateTask } from '@/features/tasks/hooks/useCreateTask';
import { TaskForm, type TaskFormValues } from './TaskForm';

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const createTask = useCreateTask();

  function handleSubmit(values: TaskFormValues) {
    setError(undefined);
    createTask.mutate(
      {
        title: values.title,
        description: values.description,
        dueDate: new Date(values.dueDate).toISOString(),
      },
      {
        onSuccess: () => setOpen(false),
        onError: (err) => setError(err instanceof ApiError ? err.message : 'Failed to create task'),
      },
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Add a new task to your list.</DialogDescription>
        </DialogHeader>
        <TaskForm
          submitLabel="Create task"
          isSubmitting={createTask.isPending}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
