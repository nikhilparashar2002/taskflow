import { type NextRequest } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/db';
import { Task } from '@/lib/models/Task';
import { getUserFromRequest } from '@/lib/auth';
import { jsonError, jsonOk, withErrorHandling } from '@/lib/api-helpers';
import { serializeTask } from '@/lib/serializers';
import { isNonEmptyString, isValidDate } from '@/lib/validation';
import type { TaskStatus } from '@/types/task';

type RouteContext = { params: Promise<{ id: string }> };

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/tasks/:id — fetch a single owned task.
export async function GET(req: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const auth = getUserFromRequest(req);
    if (!auth) {
      return jsonError('Unauthorized', 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return jsonError('Task not found', 404);
    }

    await connectDB();

    const task = await Task.findOne({ _id: id, userId: auth.userId });
    if (!task) {
      return jsonError('Task not found', 404);
    }

    return jsonOk({ task: serializeTask(task) });
  });
}

// PATCH /api/tasks/:id — update provided fields on an owned task.
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const auth = getUserFromRequest(req);
    if (!auth) {
      return jsonError('Unauthorized', 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return jsonError('Task not found', 404);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError('Invalid request body', 400);
    }

    const { title, description, status, dueDate } = body as {
      title?: unknown;
      description?: unknown;
      status?: unknown;
      dueDate?: unknown;
    };

    const update: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      dueDate: Date;
    }> = {};

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return jsonError('Title cannot be empty', 400);
      }
      update.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return jsonError('Description must be a string', 400);
      }
      update.description = description;
    }

    if (status !== undefined) {
      if (status !== 'pending' && status !== 'completed') {
        return jsonError('Invalid status', 400);
      }
      update.status = status;
    }

    if (dueDate !== undefined) {
      if (!isValidDate(dueDate)) {
        return jsonError('Invalid due date', 400);
      }
      update.dueDate = new Date(dueDate);
    }

    if (Object.keys(update).length === 0) {
      return jsonError('No fields to update', 400);
    }

    await connectDB();

    const task = await Task.findOneAndUpdate({ _id: id, userId: auth.userId }, update, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return jsonError('Task not found', 404);
    }

    return jsonOk({ task: serializeTask(task) });
  });
}

// DELETE /api/tasks/:id — delete an owned task.
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const auth = getUserFromRequest(req);
    if (!auth) {
      return jsonError('Unauthorized', 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return jsonError('Task not found', 404);
    }

    await connectDB();

    const task = await Task.findOneAndDelete({ _id: id, userId: auth.userId });
    if (!task) {
      return jsonError('Task not found', 404);
    }

    return jsonOk({ message: 'Task deleted' });
  });
}
