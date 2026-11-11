import 'server-only';

import type { Task } from '@/features/tasks/types/task.types';

const tasks = new Map<string, Task>();

export const taskStore = {
  list(): Task[] {
    return [...tasks.values()].sort(
      (a, b) => b.dataCriacao.localeCompare(a.dataCriacao) || b.id.localeCompare(a.id),
    );
  },
  get(id: string): Task | undefined {
    return tasks.get(id);
  },
  set(task: Task): Task {
    tasks.set(task.id, task);
    return task;
  },
  delete(id: string): boolean {
    return tasks.delete(id);
  },
};
