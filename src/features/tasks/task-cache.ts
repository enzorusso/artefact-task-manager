import type { InfiniteData } from '@tanstack/react-query';
import type { Task, TaskInput } from './task.schema';

export const TASKS_PAGE_SIZE = 20;

export type TaskPage = { items: Task[]; nextCursor: string | null };
export type TaskListData = InfiniteData<TaskPage, string | null>;

export function addTaskToFirstPage(
  data: TaskListData | undefined,
  task: Task,
): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0 ? { ...page, items: [task, ...page.items] } : page,
    ),
  };
}

export function updateTaskInPages(
  data: TaskListData | undefined,
  id: string,
  input: TaskInput,
): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((task) => (task.id === id ? { ...task, ...input } : task)),
    })),
  };
}

export function replaceTaskInPages(
  data: TaskListData | undefined,
  id: string,
  task: Task,
): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((current) => (current.id === id ? task : current)),
    })),
  };
}

export function removeTaskFromPages(
  data: TaskListData | undefined,
  id: string,
): TaskListData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((task) => task.id !== id),
    })),
  };
}
