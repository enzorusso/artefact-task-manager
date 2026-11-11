import 'server-only';

import { taskStore } from '@/server/data/task.store';
import type { Task } from '@/features/tasks/types/task.types';

export const taskRepository = {
  findPage(cursor: string | null | undefined, limit: number) {
    const tasks = taskStore.list();
    const [cursorDate, cursorId] = cursor?.split('::') ?? [];
    const remaining = cursorDate && cursorId
      ? tasks.filter(
          (task) =>
            task.dataCriacao < cursorDate ||
            (task.dataCriacao === cursorDate && task.id < cursorId),
        )
      : tasks;
    const items = remaining.slice(0, limit);
    const last = items.at(-1);
    return {
      items,
      nextCursor: remaining.length > limit && last ? `${last.dataCriacao}::${last.id}` : null,
    };
  },
  findById: (id: string) => taskStore.get(id),
  save: (task: Task) => taskStore.set(task),
  remove: (id: string) => taskStore.delete(id),
};
