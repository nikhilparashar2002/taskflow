import type { ITask } from '@/lib/models/Task';
import type { Task } from '@/types/task';

/** Convert a Mongoose task document into the API/client Task shape. */
export function serializeTask(doc: ITask): Task {
  return {
    _id: doc._id?.toString() ?? '',
    userId: doc.userId,
    title: doc.title,
    description: doc.description,
    status: doc.status,
    dueDate: doc.dueDate.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
