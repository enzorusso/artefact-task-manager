import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { Container } from '@/components/layout/container';
import { EditTaskForm } from '@/components/layout/edit-task-form';
import { serverApi } from '@/trpc/server';

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const task = await serverApi.tasks.byId({ id });
    return (
      <Container>
        <EditTaskForm task={task} />
      </Container>
    );
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST')
    ) {
      notFound();
    }
    throw error;
  }
}
