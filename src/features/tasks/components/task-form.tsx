'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/trpc/client';
import { taskInputSchema, type Task } from '../task.schema';
import { taskMessages } from '../task-messages';
import {
  addTaskToFirstPage,
  replaceTaskInPages,
  TASKS_PAGE_SIZE,
  type TaskListData,
} from '../task-cache';

export function TaskForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const listQueryKey = trpc.tasks.list.infiniteQueryKey({ limit: TASKS_PAGE_SIZE });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const createTask = useMutation(
    trpc.tasks.create.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: listQueryKey });
        const previous = queryClient.getQueriesData<TaskListData>({ queryKey: listQueryKey });
        const optimisticTask: Task = {
          ...input,
          id: crypto.randomUUID(),
          dataCriacao: new Date().toISOString(),
        };
        queryClient.setQueriesData<TaskListData>({ queryKey: listQueryKey }, (data) =>
          addTaskToFirstPage(data, optimisticTask),
        );
        return { optimisticId: optimisticTask.id, previous };
      },
      onSuccess: (createdTask, _input, context) => {
        queryClient.setQueriesData<TaskListData>({ queryKey: listQueryKey }, (data) =>
          replaceTaskInPages(data, context.optimisticId, createdTask),
        );
        setTitle('');
        setDescription('');
        toast.success(taskMessages.form.added, { duration: 2500 });
      },
      onError: (error, _input, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(error.message);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),
  );

  return (
    <form
      className="task-form"
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
        createTask.mutate(result.data);
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
      <Button
        className="add-task-button"
        disabled={title.trim().length === 0 || createTask.isPending}
        type="submit"
      >
        {createTask.isPending ? (
          taskMessages.form.adding
        ) : (
          <>
            {taskMessages.form.add}
            <FiPlus aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
