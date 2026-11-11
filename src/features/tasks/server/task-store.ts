import 'server-only';

import type { Task } from '../task.schema';

const tasks = new Map<string, Task>();

export const taskStore = {
  list(): Task[] {
    return [...tasks.values()].sort(
      (a, b) => b.dataCriacao.localeCompare(a.dataCriacao) || b.id.localeCompare(a.id),
    );
  },
  get(id: string) {
    return tasks.get(id);
  },
  set(task: Task) {
    tasks.set(task.id, task);
    return task;
  },
  delete(id: string) {
    return tasks.delete(id);
  },
};
