import { createTRPCClient, httpBatchLink } from '@trpc/client';

const action = process.argv[2];
const baseUrl = (process.env.TASKS_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const pageSize = 50;
const seedCount = 65;

if (!['seed', 'clear'].includes(action)) {
  console.error('Use: npm run tasks:seed ou npm run tasks:clear');
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
          titulo: 'Tarefa de teste ' + String(number).padStart(2, '0'),
          descricao: 'Item ' + number + ' para testar a rolagem infinita.',
        });
      }),
    );
    console.log('Criadas ' + end + '/' + seedCount + ' tarefas.');
  }
}

async function clearTasks() {
  let removed = 0;

  while (true) {
    const page = await client.tasks.list.query({ limit: pageSize });
    if (page.items.length === 0) break;

    await Promise.all(page.items.map(({ id }) => client.tasks.delete.mutate({ id })));
    removed += page.items.length;
    console.log('Removidas ' + removed + ' tarefas.');
  }
}

try {
  if (action === 'seed') await seedTasks();
  if (action === 'clear') await clearTasks();
  console.log(action === 'seed' ? 'Seed concluído.' : 'Lista limpa.');
} catch (error) {
  console.error('Não foi possível executar "' + action + '" em ' + baseUrl + '.');
  console.error('Confira se o servidor Next.js está rodando e se a URL está correta.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
