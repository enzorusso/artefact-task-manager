import { createTRPCClient, httpBatchLink } from '@trpc/client';

const action = process.argv[2];
const baseUrl = (process.env.TASKS_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const pageSize = 50;
const seedCount = 65;

if (!['seed', 'clear'].includes(action)) {
  console.error('Use: npm run tasks:seed or npm run tasks:clear');
  process.exit(1);
}

const client = createTRPCClient({
  links: [httpBatchLink({ url: baseUrl + '/api/trpc' })],
});

async function seedTasks() {
  for (let start = 1; start <= seedCount; start += 10) {
    const end = Math.min(start + 9, seedCount);
    await Promise.all(
      Array.from({ length: end - start + 1 }, (_, index) => {
        const number = start + index;
        return client.tasks.create.mutate({
          titulo: 'Test task ' + String(number).padStart(2, '0'),
          descricao: 'Item ' + number + ' for testing infinite scroll.',
        });
      }),
    );
    console.log('Created ' + end + '/' + seedCount + ' tasks.');
  }
}

async function clearTasks() {
  let removed = 0;

  while (true) {
    const page = await client.tasks.list.query({ limit: pageSize });
    if (page.items.length === 0) break;

    await Promise.all(page.items.map(({ id }) => client.tasks.delete.mutate({ id })));
    removed += page.items.length;
    console.log('Deleted ' + removed + ' tasks.');
  }
}

try {
  if (action === 'seed') await seedTasks();
  if (action === 'clear') await clearTasks();
  console.log(action === 'seed' ? 'Seeding complete.' : 'Task list cleared.');
} catch (error) {
  console.error('Could not run "' + action + '" against ' + baseUrl + '.');
  console.error('Check that the Next.js server is running and the URL is correct.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
