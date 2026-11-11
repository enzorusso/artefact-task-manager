import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...inputProps } = props;
  return <input {...inputProps} className={className} />;
}
