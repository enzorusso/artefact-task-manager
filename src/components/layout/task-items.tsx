'use client';

import Link from 'next/link';
import { FaRegTrashCan } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';
import type { Task } from '@/features/tasks/types/task.types';

export function TaskItem({
  task,
  onDelete,
  isDeleting,
}: {
  task: Task;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <li className="task-item">
      <div className="task-item__content">
        <h2>{task.titulo}</h2>
        {task.descricao && <p>{task.descricao}</p>}
        <time dateTime={task.dataCriacao}>
          Criada em {task.dataCriacao.slice(0, 10).split('-').reverse().join('/')}
        </time>
      </div>
      <div className="task-item__actions">
        <Link
          className="icon-button"
          href={`/tasks/${task.id}/edit`}
          aria-label={`Editar: ${task.titulo}`}
        >
          <LuPencil aria-hidden="true" />
        </Link>
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
    </li>
  );
}
