'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { taskInputSchema } from '@/features/tasks/schemas/task.schema';
import type { TaskInput } from '@/features/tasks/schemas/task.schema';
import type { Task } from '@/features/tasks/types/task.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import { useTRPC } from '@/trpc/client';
import { TaskItem } from './task-items';

const PAGE_SIZE = 20;

type TaskPage = { items: Task[]; nextCursor: string | null };
type TaskListData = InfiniteData<TaskPage, string | null>;

function addToFirstPage(data: TaskListData | undefined, task: Task): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0 ? { ...page, items: [task, ...page.items] } : page,
    ),
  };
}

function replaceTask(data: TaskListData | undefined, id: string, task: Task): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === id ? task : item)),
    })),
  };
}

function removeFromPages(data: TaskListData | undefined, id: string): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((task) => task.id !== id),
    })),
  };
}

export function TaskList({ initialPage }: { initialPage: TaskPage }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const listQueryKey = trpc.tasks.list.infiniteQueryKey({ limit: PAGE_SIZE });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const tasksQuery = useInfiniteQuery(
    trpc.tasks.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      {
        initialCursor: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: { pages: [initialPage], pageParams: [null] },
      },
    ),
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = tasksQuery;

  const createTask = useMutation(
    trpc.tasks.create.mutationOptions({
      onMutate: async (input) => {
        const queryKey = listQueryKey;
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueriesData<TaskListData>({ queryKey });
        const optimisticTask: Task = {
          ...input,
          id: crypto.randomUUID(),
          dataCriacao: new Date().toISOString(),
        };
        queryClient.setQueriesData<TaskListData>({ queryKey }, (data) =>
          addToFirstPage(data, optimisticTask),
        );
        return { optimisticId: optimisticTask.id, previous };
      },
      onSuccess: async (createdTask, _input, context) => {
        queryClient.setQueriesData<TaskListData>(
          { queryKey: listQueryKey },
          (data) => replaceTask(data, context.optimisticId, createdTask),
        );
        setTitle('');
        setDescription('');
        toast.success('Tarefa adicionada.', { duration: 2500 });
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

  const deleteTask = useMutation(
    trpc.tasks.delete.mutationOptions({
      onMutate: async ({ id }) => {
        const queryKey = listQueryKey;
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueriesData<TaskListData>({ queryKey });
        queryClient.setQueriesData<TaskListData>({ queryKey }, (data) => removeFromPages(data, id));
        return { previous };
      },
      onSuccess: () => toast.success('Tarefa removida.', { duration: 2500 }),
      onError: (error, _input, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(error.message);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),
  );

  const updateTask = useMutation(
    trpc.tasks.update.mutationOptions({
      onMutate: async (input) => {
        const queryKey = listQueryKey;
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueriesData<TaskListData>({ queryKey });
        const currentTask = previous
          .flatMap(([, data]) => data?.pages.flatMap((page) => page.items) ?? [])
          .find((task) => task.id === input.id);

        if (currentTask) {
          const optimisticTask: Task = {
            ...currentTask,
            titulo: input.titulo,
            descricao: input.descricao,
          };
          queryClient.setQueriesData<TaskListData>({ queryKey }, (data) =>
            replaceTask(data, input.id, optimisticTask),
          );
        }

        return { previous };
      },
      onSuccess: () => toast.success('Tarefa atualizada.', { duration: 2500 }),
      onError: (error, _input, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(error.message);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (tasksQuery.isError) {
      toast.error(`Não foi possível carregar as tarefas: ${tasksQuery.error.message}`);
    }
  }, [tasksQuery.error, tasksQuery.isError]);

  const tasks = tasksQuery.data.pages.flatMap((page) => page.items);

  return (
    <section className="task-list" aria-label="Tarefas">
      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault();
          const result = taskInputSchema.safeParse({
            titulo: title,
            descricao: description || undefined,
          });
          if (!result.success) {
            toast.error(result.error.issues[0]?.message ?? 'Confira os dados da tarefa.');
            return;
          }
          createTask.mutate(result.data);
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
        <Button
          className="add-task-button"
          disabled={title.trim().length === 0 || createTask.isPending}
          type="submit"
        >
          {createTask.isPending ? (
            'Adicionando…'
          ) : (
            <>
              Adicionar
              <FiPlus aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <ul className="task-items">
        {tasks.length === 0 && !tasksQuery.isError && (
          <li className="task-empty">Suas tarefas aparecerão aqui.</li>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={(id) => deleteTask.mutate({ id })}
            onSave={async (id, input: TaskInput) => {
              try {
                await updateTask.mutateAsync({ id, ...input });
                return true;
              } catch {
                return false;
              }
            }}
            isDeleting={deleteTask.isPending}
            isSaving={updateTask.isPending && updateTask.variables?.id === task.id}
          />
        ))}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" />
      {tasksQuery.isFetchingNextPage && <p role="status">Carregando mais tarefas…</p>}
    </section>
  );
}
