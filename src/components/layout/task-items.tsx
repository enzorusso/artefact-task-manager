'use client';

import { useState } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';
import type { TaskInput } from '@/features/tasks/schemas/task.schema';
import { taskInputSchema } from '@/features/tasks/schemas/task.schema';
import type { Task } from '@/features/tasks/types/task.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function TaskItem({
  task,
  onDelete,
  onSave,
  isDeleting,
  isSaving,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onSave: (id: string, input: TaskInput) => Promise<boolean>;
  isDeleting: boolean;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.titulo);
  const [description, setDescription] = useState(task.descricao ?? '');

  function startEditing() {
    setTitle(task.titulo);
    setDescription(task.descricao ?? '');
    setIsEditing(true);
  }

  function cancelEditing() {
    setTitle(task.titulo);
    setDescription(task.descricao ?? '');
    setIsEditing(false);
  }

  return (
    <li className={`task-item${isEditing ? ' task-item--editing' : ''}`}>
      {isEditing ? (
        <form
          className="task-edit-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = taskInputSchema.safeParse({
              titulo: title,
              descricao: description || undefined,
            });
            if (!result.success) {
              toast.error(result.error.issues[0]?.message ?? 'Confira os dados da tarefa.');
              return;
            }
            if (await onSave(task.id, result.data)) setIsEditing(false);
          }}
        >
          <div className="task-composer">
            <Input
              aria-label="Título da tarefa"
              className="task-title-input"
              onChange={(event) => setTitle(event.currentTarget.value)}
              placeholder="Digite o título"
              required
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
          <div className="task-edit-actions">
            <Button
              className="cancel-edit-button"
              disabled={isSaving}
              onClick={cancelEditing}
              type="button"
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button className="add-task-button" disabled={!title.trim() || isSaving} type="submit">
              {isSaving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-item__content">
            <h2>{task.titulo}</h2>
            {task.descricao && <p>{task.descricao}</p>}
            <time dateTime={task.dataCriacao}>
              Criada em {task.dataCriacao.slice(0, 10).split('-').reverse().join('/')}
            </time>
          </div>
          <div className="task-item__actions">
            <button
              className="icon-button"
              type="button"
              aria-label={`Editar: ${task.titulo}`}
              onClick={startEditing}
            >
              <LuPencil aria-hidden="true" />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label={`Excluir: ${task.titulo}`}
              disabled={isDeleting}
              onClick={() => onDelete(task.id)}
            >
              <FaRegTrashCan aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
