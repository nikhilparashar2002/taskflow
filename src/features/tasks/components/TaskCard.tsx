'use client';

import { useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeDueDate, isOverdue } from '@/utils/date';
import { useUpdateTask } from '@/features/tasks/hooks/useUpdateTask';
import type { Task } from '@/types/task';
import { EditTaskDialog } from './EditTaskDialog';
import { DeleteTaskDialog } from './DeleteTaskDialog';

export function TaskCard({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateTask = useUpdateTask();

  const isCompleted = task.status === 'completed';
  const overdue = !isCompleted && isOverdue(task.dueDate);

  function toggleStatus() {
    updateTask.mutate({
      id: task._id,
      input: { status: isCompleted ? 'pending' : 'completed' },
    });
  }

  return (
    <>
      <Card className="gap-0 py-0">
        <CardContent className="flex items-start gap-3 p-4">
          <button
            type="button"
            onClick={toggleStatus}
            disabled={updateTask.isPending}
            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
            className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-colors disabled:opacity-50"
          >
            {isCompleted ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <Circle className="size-5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'font-medium break-words',
                  isCompleted && 'text-muted-foreground line-through',
                )}
              >
                {task.title}
              </h3>
              <Badge variant={isCompleted ? 'success' : 'secondary'} className="shrink-0">
                {isCompleted ? 'Completed' : 'Pending'}
              </Badge>
            </div>

            {task.description && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm break-words">
                {task.description}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <div
                className={cn(
                  'text-muted-foreground flex items-center gap-1.5 text-xs',
                  overdue && 'text-destructive',
                )}
              >
                <CalendarDays className="size-3.5" />
                <span title={formatDate(task.dueDate)}>
                  {overdue
                    ? `Overdue · ${formatDate(task.dueDate)}`
                    : formatRelativeDueDate(task.dueDate)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit task"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-8"
                  onClick={() => setDeleteOpen(true)}
                  aria-label="Delete task"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteTaskDialog task={task} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
