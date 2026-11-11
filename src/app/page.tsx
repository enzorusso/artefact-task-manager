import { Container } from '@/components/layout/container';
import { TaskForm } from '@/features/tasks/components/task-form';
import { TaskList } from '@/features/tasks/components/task-list';
import { taskMessages } from '@/features/tasks/task-messages';
import { serverApi } from '@/trpc/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialPage = await serverApi.tasks.list({ limit: 20 });

  return (
    <Container className="task-panel">
      <h1>{taskMessages.app.title}</h1>
      <TaskForm />
      <TaskList initialPage={initialPage} />
    </Container>
  );
}
