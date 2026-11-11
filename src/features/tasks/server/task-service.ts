import 'server-only';

import { randomUUID } from 'node:crypto';
import type { Task, TaskInput, TaskPageInput } from '../task.schema';
import { taskRepository } from './task-repository';

export const taskService = {
  list(input: TaskPageInput) {
    return taskRepository.findPage(input.cursor, input.limit);
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
