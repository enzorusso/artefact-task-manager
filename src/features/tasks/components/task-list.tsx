'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTRPC } from '@/trpc/client';
import type { TaskPage } from '../task-cache';
import { TASKS_PAGE_SIZE } from '../task-cache';
import { taskMessages } from '../task-messages';
import { TaskCard } from './task-card';

export function TaskList({ initialPage }: { initialPage: TaskPage }) {
  const trpc = useTRPC();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tasksQuery = useInfiniteQuery(
    trpc.tasks.list.infiniteQueryOptions(
      { limit: TASKS_PAGE_SIZE },
      {
        initialCursor: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: { pages: [initialPage], pageParams: [null] },
      },
    ),
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = tasksQuery;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (tasksQuery.isError) {
      toast.error(taskMessages.list.loadError(tasksQuery.error.message));
    }
  }, [tasksQuery.error, tasksQuery.isError]);

  const tasks = tasksQuery.data.pages.flatMap((page) => page.items);

  return (
    <section className="task-results" aria-label={taskMessages.list.label}>
      <ul className="task-items">
        {tasks.length === 0 && !tasksQuery.isError && (
          <li className="task-empty">{taskMessages.list.empty}</li>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
      <div ref={sentinelRef} aria-hidden="true" />
      {tasksQuery.isFetchingNextPage && <p role="status">{taskMessages.list.loadingMore}</p>}
    </section>
  );
}
