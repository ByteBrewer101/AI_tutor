export default function InkInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-transparent border-b border-walnut/40 focus:border-pine
                   focus-visible:outline-2 focus-visible:outline-pine focus-visible:outline-offset-[2px]
                   font-body text-base py-1.5 outline-none placeholder:text-ink/40
                   transition-colors duration-150 ${className}`}
      {...props}
    />
  );
}
