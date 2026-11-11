import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { TRPCReactProvider } from '@/trpc/client';

export const metadata: Metadata = {
  title: 'Taskflow',
  description: 'Seu espaço de foco para organizar tarefas.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
