const baseStyles =
  'font-body text-base px-5 py-2.5 rounded-[3px] transition-colors duration-200 cursor-pointer inline-flex items-center justify-center gap-2';

const variants = {
  primary:
    'bg-pine text-paper hover:bg-pine/90 border border-pine',
  secondary:
    'bg-transparent text-ink border border-walnut/40 hover:border-walnut',
  ghost:
    'text-pine underline underline-offset-4 decoration-pine/40 hover:decoration-pine bg-transparent',
};

export default function Button({ variant = 'primary', children, className = '', ...props }) {
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
