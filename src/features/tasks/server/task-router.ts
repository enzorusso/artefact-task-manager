import 'server-only';

import { taskIdSchema, taskInputSchema, taskPageSchema, updateTaskSchema } from '../task.schema';
import { taskService } from './task-service';
import { publicProcedure, router, TRPCError } from '@/server/api/trpc';

export const taskRouter = router({
  list: publicProcedure.input(taskPageSchema).query(({ input }) => taskService.list(input)),
  create: publicProcedure.input(taskInputSchema).mutation(({ input }) => taskService.create(input)),
  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const { id, ...data } = input;
    const task = taskService.update(id, data);
    if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tarefa não encontrada.' });
    return task;
  }),
  delete: publicProcedure.input(taskIdSchema).mutation(({ input }) => {
    if (!taskService.delete(input.id)) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Tarefa não encontrada.' });
    }
    return { success: true };
  }),
});
