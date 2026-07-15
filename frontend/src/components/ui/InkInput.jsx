<<<<<<< HEAD
import React from 'react';

export function InkInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-paper/50 border border-walnut/40 rounded-full focus:border-pine focus:bg-paper focus:shadow-sm font-body text-base px-5 py-2 outline-none placeholder:text-ink/40 transition-all duration-200 ${className}`}
=======
export default function InkInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-transparent border-b border-walnut/40 focus:border-pine
                   focus-visible:outline-2 focus-visible:outline-pine focus-visible:outline-offset-[2px]
                   font-body text-base py-1.5 outline-none placeholder:text-ink/40
                   transition-colors duration-150 ${className}`}
>>>>>>> 1634ab3c1a58d388e1710a964a3526d8c4fbd65b
      {...props}
    />
  );
}
