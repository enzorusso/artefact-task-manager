import 'server-only';
import { appRouter } from '@/server/api/root';

export const serverApi = appRouter.createCaller({});
