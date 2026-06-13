export type TaskStatus = 'pending' | 'completed';

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'dueDate'>;

export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueDate'>>;

export interface TaskFilters {
  status?: TaskStatus;
  search?: string;
}
