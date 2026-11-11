import { Container } from '@/components/layout/container';
import { TaskList } from '@/components/layout/task-list';
import { serverApi } from '@/trpc/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialPage = await serverApi.tasks.list({ limit: 20 });

  return (
    <Container>
      <TaskList initialPage={initialPage} />
    </Container>
  );
}
