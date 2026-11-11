import type { TaskInput } from '../schemas/task.schema';

export type Task = TaskInput & {
  id: string;
  dataCriacao: string;
};
