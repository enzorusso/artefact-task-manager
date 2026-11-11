'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegTrashCan } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/trpc/client';
import { taskInputSchema, type Task, type TaskInput } from '../task.schema';
import { taskMessages } from '../task-messages';
import {
  removeTaskFromPages,
  TASKS_PAGE_SIZE,
  type TaskListData,
  updateTaskInPages,
} from '../task-cache';

export function TaskCard({ task }: { task: Task }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const listQueryKey = trpc.tasks.list.infiniteQueryKey({ limit: TASKS_PAGE_SIZE });
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.titulo);
  const [description, setDescription] = useState(task.descricao ?? '');

  const updateTask = useMutation(
    trpc.tasks.update.mutationOptions({
      onMutate: async ({ id, ...input }) => {
        await queryClient.cancelQueries({ queryKey: listQueryKey });
        const previous = queryClient.getQueriesData<TaskListData>({ queryKey: listQueryKey });
        queryClient.setQueriesData<TaskListData>({ queryKey: listQueryKey }, (data) =>
          updateTaskInPages(data, id, input),
        );
        return { previous };
      },
      onSuccess: () => toast.success(taskMessages.card.updated, { duration: 2500 }),
      onError: (error, _input, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(error.message);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),
  );

  const deleteTask = useMutation(
    trpc.tasks.delete.mutationOptions({
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({ queryKey: listQueryKey });
        const previous = queryClient.getQueriesData<TaskListData>({ queryKey: listQueryKey });
        queryClient.setQueriesData<TaskListData>({ queryKey: listQueryKey }, (data) =>
          removeTaskFromPages(data, id),
        );
        return { previous };
      },
      onSuccess: () => toast.success(taskMessages.card.deleted, { duration: 2500 }),
      onError: (error, _input, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(error.message);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),
  );

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

  async function saveTask(input: TaskInput) {
    try {
      await updateTask.mutateAsync({ id: task.id, ...input });
      setIsEditing(false);
    } catch {
      // The mutation reports the error through a toast and rolls back its optimistic update.
    }
  }

  return (
    <li className={`task-item${isEditing ? ' task-item--editing' : ''}`}>
      {isEditing ? (
        <form
          className="task-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            const result = taskInputSchema.safeParse({
              titulo: title,
              descricao: description || undefined,
            });
            if (!result.success) {
              toast.error(result.error.issues[0]?.message ?? taskMessages.validation.invalidTask);
              return;
            }
            void saveTask(result.data);
          }}
        >
          <div className="task-composer">
            <Input
              aria-label={taskMessages.form.titleLabel}
              className="task-title-input"
              onChange={(event) => setTitle(event.currentTarget.value)}
              placeholder={taskMessages.form.titlePlaceholder}
              required
              value={title}
            />
            <textarea
              aria-label={taskMessages.form.descriptionLabel}
              className="task-description-input"
              onChange={(event) => setDescription(event.target.value)}
              placeholder={taskMessages.form.descriptionPlaceholder}
              rows={3}
              value={description}
            />
          </div>
          <div className="task-edit-actions">
            <Button
              className="cancel-edit-button"
              disabled={updateTask.isPending}
              onClick={cancelEditing}
              type="button"
            >
              {taskMessages.card.cancel}
            </Button>
            <Button
              className="add-task-button"
              disabled={!title.trim() || updateTask.isPending}
              type="submit"
            >
              {updateTask.isPending ? taskMessages.card.saving : taskMessages.card.save}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-item__content">
            <h2>{task.titulo}</h2>
            {task.descricao && <p>{task.descricao}</p>}
            <time dateTime={task.dataCriacao}>
              {taskMessages.card.createdOn} {task.dataCriacao.slice(0, 10).split('-').reverse().join('/')}
            </time>
          </div>
          <div className="task-item__actions">
            <button
              className="icon-button icon-button--edit"
              type="button"
              aria-label={taskMessages.card.editLabel(task.titulo)}
              onClick={startEditing}
            >
              <LuPencil aria-hidden="true" />
            </button>
            <button
              className="icon-button icon-button--delete"
              type="button"
              aria-label={taskMessages.card.deleteLabel(task.titulo)}
              disabled={deleteTask.isPending}
              onClick={() => deleteTask.mutate({ id: task.id })}
            >
              <FaRegTrashCan aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
