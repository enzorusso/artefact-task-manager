import 'server-only';

import { router } from '@/server/api/trpc';
import { taskRouter } from './task.router';

export const appRouter = router({ tasks: taskRouter });
export type AppRouter = typeof appRouter;
