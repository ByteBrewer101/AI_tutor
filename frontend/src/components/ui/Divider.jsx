export default function Divider({ dinkus = false, className = '' }) {
  if (dinkus) {
    return (
      <div className={`flex items-center justify-center my-8 text-walnut/40 font-body text-lg ${className}`}>
        <span className="tracking-[0.5em]">⁂</span>
      </div>
    );
  }
  return <hr className={`border-0 border-t border-walnut/25 my-6 ${className}`} />;
}
