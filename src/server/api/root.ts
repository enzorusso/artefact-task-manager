import 'server-only';

import { taskRouter } from '@/features/tasks/server/task-router';
import { router } from './trpc';

export const appRouter = router({ tasks: taskRouter });
export type AppRouter = typeof appRouter;
