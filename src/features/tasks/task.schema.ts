import { z } from 'zod';

export const taskInputSchema = z.object({
  titulo: z.string().trim().min(1, 'Informe um título.').max(120, 'Use até 120 caracteres.'),
  descricao: z.string().trim().max(2000, 'Use até 2.000 caracteres.').optional(),
});

export const taskSchema = taskInputSchema.extend({
  id: z.uuid(),
  dataCriacao: z.iso.datetime(),
});

// I copied the variables name from the PDF, which is why it is in Portuguese.

export const taskIdSchema = z.object({ id: z.uuid() });
export const updateTaskSchema = taskIdSchema.extend(taskInputSchema.shape);
export const taskPageSchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskPageInput = z.infer<typeof taskPageSchema>;
