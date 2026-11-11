'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/features/tasks/types/task.types';
import { taskInputSchema } from '@/features/tasks/schemas/task.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/trpc/client';

export function EditTaskForm({ task }: { task: Task }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const listQueryKey = trpc.tasks.list.infiniteQueryKey({ limit: 20 });
  const [title, setTitle] = useState(task.titulo);
  const [description, setDescription] = useState(task.descricao ?? '');
  const [feedback, setFeedback] = useState('');
  const updateTask = useMutation(
    trpc.tasks.update.mutationOptions({
      onSuccess: async () => {
        setFeedback('Tarefa atualizada.');
        await queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
      onError: (error) => setFeedback(error.message),
    }),
  );

  return (
    <section className="task-list" aria-labelledby="edit-task-title">
      <h1 id="edit-task-title">Editar tarefa</h1>
      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault();
          const result = taskInputSchema.safeParse({
            titulo: title,
            descricao: description || undefined,
          });
          if (!result.success) {
            setFeedback(result.error.issues[0]?.message ?? 'Confira os dados da tarefa.');
            return;
          }
          setFeedback('');
          updateTask.mutate({ id: task.id, ...result.data });
        }}
      >
        <div className="task-composer">
          <Input
            aria-label="Título da tarefa"
            className="task-title-input"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Digite o título"
            value={title}
          />
          <textarea
            aria-label="Descrição da tarefa (opcional)"
            className="task-description-input"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição (opcional)"
            rows={3}
            value={description}
          />
        </div>
        <div className="edit-task-actions">
          <Link href="/">Cancelar</Link>
          <Button className="add-task-button" disabled={!title.trim() || updateTask.isPending} type="submit">
            {updateTask.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
      {feedback && <p className="form-feedback" role="status">{feedback}</p>}
    </section>
  );
}
