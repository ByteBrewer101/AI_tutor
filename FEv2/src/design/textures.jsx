export function PaperTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 aria-hidden"
      aria-hidden="true"
      style={{ opacity: 0.03 }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="paper-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>
    </div>
  )
}

export function CoffeeRing({ className = '', size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`pointer-events-none opacity-[0.06] ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#5A4331"
        strokeWidth="3"
        strokeDasharray="8 3 15 4"
        opacity="0.7"
      />
      <circle
        cx="52"
        cy="48"
        r="38"
        fill="none"
        stroke="#5A4331"
        strokeWidth="1"
        strokeDasharray="12 5"
        opacity="0.4"
      />
    </svg>
  )
}

export function DogEar({ className = '' }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 0 L24 0 L24 24 Z"
        fill="#E8DFC8"
        stroke="#5A4331"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <path
        d="M24 0 L24 24 L0 0 Z"
        fill="#D4C9B0"
        opacity="0.3"
      />
    </svg>
  )
}

export function Dinkus() {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-walnut/40">
      <span className="block h-px w-12 bg-walnut/25" />
      <span className="font-display text-lg tracking-widest">⁂</span>
      <span className="block h-px w-12 bg-walnut/25" />
    </div>
  )
}
