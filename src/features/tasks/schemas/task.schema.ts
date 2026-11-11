import { z } from 'zod';

export const taskInputSchema = z.object({
  titulo: z.string().trim().min(1, 'Informe um título.').max(120, 'Use até 120 caracteres.'),
  descricao: z.string().trim().max(2000, 'Use até 2.000 caracteres.').optional(),
});

export const taskIdSchema = z.object({ id: z.string().uuid() });

export const updateTaskSchema = taskIdSchema.extend(taskInputSchema.shape);

export const taskPageSchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
