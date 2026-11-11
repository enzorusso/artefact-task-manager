import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return <button className={`${className} button--${variant}`.trim()} {...props} />;
}
