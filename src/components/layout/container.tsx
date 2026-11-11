import type { HTMLAttributes } from 'react';

export function Container({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <main className={`page-container ${className}`.trim()} {...props} />;
}
