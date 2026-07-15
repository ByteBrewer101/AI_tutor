import React from 'react';

export function InkInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-paper/50 border border-walnut/40 rounded-full focus:border-pine focus:bg-paper focus:shadow-sm font-body text-base px-5 py-2 outline-none placeholder:text-ink/40 transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
