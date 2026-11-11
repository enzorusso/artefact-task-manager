import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { TRPCReactProvider } from '@/trpc/client';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Taskflow',
  description: 'Seu espaço de foco para organizar tarefas.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster richColors />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
