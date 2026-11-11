# TaskManager

A task management application built for the Artefact technical challenge. It uses Next.js 15, React, TypeScript, tRPC, TanStack Query, and Zod to provide typed task creation, listing, editing, deletion, and infinite scrolling.

## Run locally

Install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm run start
```

Useful checks:

```bash
npm run typecheck
npm run lint
```

## Architecture

```text
src/
  app/                     Next.js routes, root layout, global styles, tRPC HTTP route
  components/              Shared UI components such as Container, Button, and Input
  features/tasks/
    components/            TaskForm, TaskList, and TaskCard
    server/                Task router, service, repository, and in-memory store
    task.schema.ts         Shared Zod schemas and inferred task types
    task-cache.ts          TanStack Query cache helpers and pagination types
  server/api/              Shared tRPC setup and application router composition
  trpc/                    Browser provider, query client, and server caller
```

Task-specific code lives together under `features/tasks`. The UI components handle user interaction, while the task server layers separate API validation, business operations, repository access, and storage. Shared components and tRPC infrastructure stay outside the feature.

## Frontend and backend flow

Next.js App Router uses `src/app/page.tsx` as the page entry point and `src/app/layout.tsx` as the root layout. The page is a Server Component by default. It loads the first task page on the server, then renders the interactive React client components inside the shared `TRPCReactProvider`.

In the browser, `TaskForm`, `TaskList`, and `TaskCard` use React state and TanStack Query. The tRPC client sends typed requests to `/api/trpc`. The Next.js route handler at `src/app/api/trpc/[trpc]/route.ts` forwards those requests to the application router. Task procedures validate inputs with the shared Zod schemas and call the task service, repository, and store.

The `AppRouter` type is shared with the browser client at compile time. This gives frontend calls end-to-end TypeScript types without exposing server implementation code to the browser. TanStack Query owns the client-side server state and cache; mutations update the visible list optimistically and roll back if the backend reports an error.

## Server-side rendering

`src/app/page.tsx` exports `dynamic = 'force-dynamic'` and calls `serverApi.tasks.list({ limit: 20 })` for each request. `serverApi` is created with `appRouter.createCaller()` in `src/trpc/server.ts`, so the server can call the tRPC procedure directly without making an HTTP request to itself.

The returned first page is passed to `TaskList` as `initialPage`. The component supplies it to `useInfiniteQuery` as `initialData`, so the initial HTML already contains the tasks and the browser query cache starts with the same data. This avoids an empty loading state and an extra client request for the first page. The query client uses a 30-second `staleTime` to avoid immediately refetching fresh data.

## Infinite scrolling

`TaskList` renders a small sentinel element after the task cards and observes it with the browser's `IntersectionObserver`. When the sentinel approaches the viewport, using a 200-pixel `rootMargin`, the component calls TanStack Query's `fetchNextPage()`.

Each page comes from the tRPC `tasks.list` procedure with a limit of 20. The backend returns `items` and a `nextCursor`. The cursor combines the last task's creation timestamp and ID; sorting and comparing both values keeps pagination stable when tasks are inserted or deleted. When there are no more tasks, `nextCursor` is `null` and no further page is requested.

Using `IntersectionObserver` avoids a manual scroll event handler and lets the browser detect when more content is close to view. The 200-pixel margin starts loading before the user reaches the exact bottom of the list.

## Task storage

Tasks are currently stored in a server-side `Map` in `src/features/tasks/server/task-store.ts`. This keeps the challenge implementation small, but the data is temporary: it is cleared when the server process restarts and is not shared between separate application instances. A shared database can replace the store later without changing the UI's tRPC contract.

## Seed and clear tasks

Keep the Next.js server running, then use these commands in another terminal:

- `npm run tasks:seed` creates 65 sample tasks in batches of 10, enough to scroll through several pages.
- `npm run tasks:clear` removes all tasks by listing and deleting them through the tRPC API.

Both commands run `scripts/tasks.mjs` and target `http://127.0.0.1:3000` by default. Set `TASKS_BASE_URL` to use a different local server URL, for example:

```bash
TASKS_BASE_URL=http://127.0.0.1:3001 npm run tasks:seed
TASKS_BASE_URL=http://127.0.0.1:3001 npm run tasks:clear
```

> [!IMPORTANT]
> Running either script does not automatically refresh an already open task list. The list fetches data when the page loads and when the user scrolls to load another page. Automatically reflecting external seed or clear operations would require periodic polling or a push channel between the script/server and browser. Polling every few seconds is straightforward, but it repeatedly sends requests even when the data has not changed. For this small application, that ongoing server and network cost is unnecessary, so reload the page after running a script to see its changes.
