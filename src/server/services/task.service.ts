import 'server-only';

import { randomUUID } from 'node:crypto';
import type { TaskInput } from '@/features/tasks/schemas/task.schema';
import type { Task } from '@/features/tasks/types/task.types';
import type { z } from 'zod';
import type { taskPageSchema } from '@/features/tasks/schemas/task.schema';
import { taskRepository } from '@/server/repositories/task.repository';

export const taskService = {
  listPage(input: z.infer<typeof taskPageSchema>) {
    return taskRepository.findPage(input.cursor, input.limit);
  },
  get(id: string) {
    return taskRepository.findById(id);
  },
  create(input: TaskInput): Task {
    return taskRepository.save({ ...input, id: randomUUID(), dataCriacao: new Date().toISOString() });
  },
  update(id: string, input: TaskInput) {
    const current = taskRepository.findById(id);
    if (!current) return undefined;
    return taskRepository.save({ ...current, ...input });
  },
  delete(id: string) {
    return taskRepository.remove(id);
  },
};
