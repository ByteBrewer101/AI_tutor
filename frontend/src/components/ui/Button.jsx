import React from 'react';

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'font-body text-base px-5 py-2.5 rounded-xl transition-colors duration-200';
  const variants = {
    primary: 'bg-pine text-paper hover:bg-pine/90 border border-pine',
    secondary: 'bg-transparent text-ink border border-walnut/40 hover:border-walnut',
    ghost: 'text-pine underline underline-offset-4 decoration-pine/40 hover:decoration-pine',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
