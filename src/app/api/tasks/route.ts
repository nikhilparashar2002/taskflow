import { type NextRequest } from 'next/server';

import { connectDB } from '@/lib/db';
import { Task } from '@/lib/models/Task';
import { getUserFromRequest } from '@/lib/auth';
import { jsonError, jsonOk, withErrorHandling } from '@/lib/api-helpers';
import { serializeTask } from '@/lib/serializers';
import { isNonEmptyString, isValidDate } from '@/lib/validation';

// GET /api/tasks?status=&search= — list the authenticated user's tasks.
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const auth = getUserFromRequest(req);
    if (!auth) {
      return jsonError('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = { userId: auth.userId };

    if (status === 'pending' || status === 'completed') {
      query.status = status;
    }

    if (search && search.trim()) {
      // Escape regex metacharacters so user input is treated literally.
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escaped, $options: 'i' };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    return jsonOk({ tasks: tasks.map(serializeTask) });
  });
}

// POST /api/tasks — create a task for the authenticated user.
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const auth = getUserFromRequest(req);
    if (!auth) {
      return jsonError('Unauthorized', 401);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError('Invalid request body', 400);
    }

    const { title, description, dueDate } = body as {
      title?: unknown;
      description?: unknown;
      dueDate?: unknown;
    };

    if (!isNonEmptyString(title)) {
      return jsonError('Title is required', 400);
    }

    if (!isValidDate(dueDate)) {
      return jsonError('A valid due date is required', 400);
    }

    await connectDB();

    const task = await Task.create({
      userId: auth.userId,
      title: title.trim(),
      description: isNonEmptyString(description) ? description : '',
      dueDate: new Date(dueDate),
      status: 'pending',
    });

    return jsonOk({ task: serializeTask(task) }, 201);
  });
}
