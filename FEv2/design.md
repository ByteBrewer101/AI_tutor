# Design System — "The Marginalia" Study Journal

> A study app that behaves like a notebook you've kept for years, not software you log into. Every screen is a page; every session leaves a mark.

This document is the source of truth for anyone (human or Claude) implementing the frontend in **React + Tailwind CSS + Framer Motion**. It translates the mood-board brief into concrete tokens, components, and code conventions — and calls out, explicitly, the defaults to avoid so the result doesn't read as AI-generated.

---

## 0. Design Thesis

The subject isn't "studying" in the abstract — it's the specific ritual of **annotation**: underlining, dog-earing, writing in the margin. The one thing this product does that a generic study app doesn't is let marginalia *accumulate*. That's the signature (see §7).

Everything else — palette, type, motion — exists to make that one idea feel inevitable, not to decorate the page.

---

## 1. Color Tokens

Named, not generic. Six colors, no more. Define once in `tailwind.config.js`, never hardcode hex in components.

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F1EAD9` | Base background — aged parchment, warm, slightly yellowed. **Not** `#F4F1EA` (that's the cream-plus-terracotta AI default — this is warmer and duller, less "designed") |
| `ink` | `#2A241C` | Primary text — soft brown-black, never pure `#000` |
| `pine` | `#39493D` | Primary accent — deep, desaturated forest green. Used for links, active states, primary buttons |
| `claret` | `#6E2E2C` | Secondary accent — dried-burgundy. Used sparingly: due dates, warnings, "important" marginalia |
| `walnut` | `#5A4331` | Structural color — borders, dividers, icon strokes |
| `brass` | `#9C7A3C` | Highlight only — used at <10% of surface area: seal stamps, streak counters, completed-chapter marks. Never a gradient, never a glow |

```js
// tailwind.config.js
colors: {
  paper:  '#F1EAD9',
  ink:    '#2A241C',
  pine:   '#39493D',
  claret: '#6E2E2C',
  walnut: '#5A4331',
  brass:  '#9C7A3C',
}
```

**Explicit rule:** no pure white, no pure black, no neon, no drop-shadow glows, no gradient accents. If a component wants a gradient, it should be an actual physical effect (an ink-bleed radial fade at 4–6% opacity) — not a decorative brand gradient.

---

## 2. Typography

Three roles, each doing one job. Restraint matters more than variety — a common AI tell is reaching for a handwritten font everywhere. Handwriting is a **garnish**, used only where a human would actually pick up a pen.

| Role | Typeface | Used for |
|---|---|---|
| Display / headings | **Cormorant Garamond** (600, 500) | Page titles, chapter headings, the logo wordmark |
| Body | **EB Garamond** (400, 500) | Paragraphs, cards, nav labels, buttons — anything read continuously |
| Marginalia / annotation | **Caveat** (500) | ONLY: user's own written notes, streak labels, "done" stamps. Never body copy, never navigation |
| Data / utility | **Courier Prime** | Timestamps, page numbers, counters, code/formula snippets |

```css
--font-display: 'Cormorant Garamond', serif;
--font-body: 'EB Garamond', serif;
--font-hand: 'Caveat', cursive;
--font-mono: 'Courier Prime', monospace;
```

Type scale (rem, 1.25 ratio, capped — this is a reading app, not a landing page):

```
--text-xs:   0.75rem   (page numbers, footnotes)
--text-sm:   0.9375rem (captions, meta)
--text-base: 1.0625rem (body copy — slightly larger than web-default for reading comfort)
--text-lg:   1.375rem  (card titles)
--text-xl:   1.875rem  (section headings)
--text-2xl:  2.5rem    (chapter / page titles)
--text-3xl:  3.25rem   (hero only, used once per session)
```

Line-height for body copy: `1.7`. Letter-spacing on Cormorant headings: `0.01em` — old-style serifs need slightly *less* tracking than a geometric sans, not more.

---

## 3. Layout Principles

- **The page is a spread, not a dashboard.** Content sits inside a single centered column (max-width `680px` for reading, `1040px` for the library/grid views) with generous top/bottom margin — like a book laid open, not a grid of widgets.
- **Cards are pages, not tiles.** A "study set" card should look like an index card or a torn journal page — subtle rotation (`-0.4deg` to `0.6deg`, randomized per card via a seeded hash of its id, not `Math.random()` on every render) rather than a drop shadow doing the whole job.
- **No more than one texture layer active at once.** The brief lists a dozen textures (coffee rings, deckled edges, pressed flowers, wrinkles...). Using all of them together is what makes an AI-generated notebook UI look like a mood board vomited onto a screen. Pick **one** ambient texture per view (usually: a very faint paper-grain noise, opacity 3–4%) and reserve the others as *rare, earned* details (see §7).
- **Hairline rules, not boxes.** Dividers are `1px solid walnut/25` — like a ruled notebook line — not full bordered containers. Avoid boxy `border + rounded-lg + shadow` card treatment on every element; let whitespace and the rotation do the separating.
- **Asymmetric margins carry the "notebook" feeling.** Give the reading column a slightly wider left margin than right (e.g. `pl-16 pr-10` inside the content shell) — as if there's a binding on the left, room for a marginal note on the right.

ASCII wireframe, study-session view:

```
┌─────────────────────────────────────────────┐
│  ↺ Library          Ch. 4 · Thermodynamics   │  ← thin header, page-number style right
│                                                │
│    ┌──────────────────────────┐   ┌────────┐ │
│    │  T                       │   │ margin │ │  ← drop cap, body column
│    │  he Second Law states    │   │ note:  │ │     left-weighted
│    │  that entropy in an      │   │"review │ │
│    │  isolated system never   │   │ w/ prof│ │
│    │  decreases...            │   │ Tue"   │ │
│    │                          │   └────────┘ │
│    │  [ ink-underline highlight]              │
│    └──────────────────────────┘               │
│                                                │
│         ───── ⁂ ─────  (dinkus divider)        │
│                                                │
│    Next: Ch. 5 →                    [ 4/12 ]  │
└─────────────────────────────────────────────┘
```

---

## 4. Component Conventions (React + Tailwind)

### Folder structure

```
src/
  design/
    tokens.ts          // colors, spacing, radii exported as JS constants
    motion.ts           // shared Framer Motion variants (see §6)
  components/
    ui/                 // dumb, reusable primitives
      Button.tsx
      InkInput.tsx
      Card.tsx
      Divider.tsx
      Stamp.tsx
      ProgressThread.tsx
    marginalia/          // the signature system, isolated
      MarginNote.tsx
      MarginRail.tsx
      useMarginalia.ts   // hook: persistence + placement logic
    layout/
      PageShell.tsx
      Header.tsx
      NotebookSpread.tsx
  features/
    library/
    session/
    review/
  hooks/
  lib/
```

Keep `components/ui` free of business logic — a `Card` doesn't know what a "study set" is, it just knows how to look like a page. Feature components compose primitives.

### Buttons

```tsx
// components/ui/Button.tsx
type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const base = 'font-body text-base px-5 py-2.5 rounded-[3px] transition-colors duration-200';
  const variants = {
    primary:   'bg-pine text-paper hover:bg-pine/90 border border-pine',
    secondary: 'bg-transparent text-ink border border-walnut/40 hover:border-walnut',
    ghost:     'text-pine underline underline-offset-4 decoration-pine/40 hover:decoration-pine',
  };
  return <button className={`${base} ${variants[variant]}`} {...props}>{children}</button>;
}
```

Note: `rounded-[3px]`, not `rounded-lg` or `rounded-full`. Sharp-ish corners read as "stamped label," not "app button." This single detail does more anti-AI work than any texture.

### Inputs

Underline-style, not boxed — like writing on a ruled line:

```tsx
export function InkInput(props: InputProps) {
  return (
    <input
      className="w-full bg-transparent border-b border-walnut/40 focus:border-pine
                 font-body text-base py-1.5 outline-none placeholder:text-ink/40
                 transition-colors duration-150"
      {...props}
    />
  );
}
```

### Cards

```tsx
export function Card({ children, seed = 0 }: { children: React.ReactNode; seed?: number }) {
  const rotation = ((seed * 37) % 10) / 10 - 0.5; // deterministic -0.5deg to 0.5deg
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className="bg-paper border border-walnut/20 shadow-[2px_3px_0_rgba(42,36,28,0.06)]
                 p-6 rounded-[2px]"
    >
      {children}
    </div>
  );
}
```

Shadow is a hard offset (`2px 3px 0`), not a soft blur — closer to how a card of paper actually casts a shadow than a CSS box-shadow blur ever looks.

---

## 5. Motion System (Framer Motion)

Centralize variants in `design/motion.ts` — never invent one-off transitions per component. This keeps motion consistent and makes "respect reduced motion" a single switch, not a search-and-replace.

```ts
// design/motion.ts
export const pageTurn = {
  initial: { opacity: 0, x: 24, rotateY: -6 },
  animate: { opacity: 1, x: 0, rotateY: 0 },
  exit:    { opacity: 0, x: -24, rotateY: 6 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

export const inkReveal = {
  initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export const liftOnHover = {
  whileHover: { y: -2, boxShadow: '3px 5px 0 rgba(42,36,28,0.09)' },
  transition: { duration: 0.15 },
};

export const stampIn = {
  initial: { scale: 1.4, opacity: 0, rotate: -8 },
  animate: { scale: 1, opacity: 1, rotate: -3 },
  transition: { type: 'spring', stiffness: 260, damping: 18 },
};
```

**Rules:**
1. Durations stay in the `0.15s–0.6s` range. Nothing snappy/bouncy-corporate, nothing glacial.
2. Only **one** orchestrated moment per view — e.g. the page-turn on chapter navigation. Hover states are quiet (a 2px lift, never a scale-up-and-glow).
3. Always wrap in `useReducedMotion()`:

```tsx
const shouldReduce = useReducedMotion();
<motion.div {...(shouldReduce ? {} : pageTurn)} />
```

4. No confetti, no bouncing emoji, no spinning loaders. Loading state = a single line of ink slowly filling in (see `ProgressThread`), because that's what the brief's "ink gradually filling a line" idea actually calls for.

---

## 6. Texture & Ambient Detail (used sparingly, on purpose)

- **Base texture:** one shared SVG noise filter (`feTurbulence`) applied as a fixed background layer at 3% opacity across the whole app. One file, one place, not re-implemented per component.
- **Earned details, not decoration:** a coffee-ring or a pressed-flower doodle should be tied to an event — e.g. a coffee-ring appears near a study set the user has revisited 5+ times ("well-loved"), not scattered randomly at page load. This is what makes it feel like *your* notebook rather than a stock texture pack.
- **Torn/deckled edges:** reserve for exactly one element type (recommend: section dividers), not every card — otherwise it reads as a Photoshop-brush default.

---

## 7. Signature Element — The Margin Rail

This is the one thing to spend the "boldness budget" on (per design-review discipline: bold in one place, quiet everywhere else).

**What it is:** a persistent right-hand rail alongside reading content where the user's own notes, underlines, and timestamps accumulate — genuinely, in `localStorage`/backend, across sessions — rendered in `font-hand` (Caveat), each note slightly rotated and placed with a deterministic seed so it looks handwritten-in, not templated.

- Notes don't animate in with a bounce; they appear with `inkReveal` (a slow ink-bleed reveal), like they're actually being written.
- Over weeks of use, a chapter with many margin notes visually looks "well-thumbed" — more notes, a faint coffee ring, a dog-ear on the card corner. **The UI ages with the user.** No competing study app does this; it's the reason the product exists as a distinct thing rather than a themed to-do list.
- Implementation lives entirely in `components/marginalia/`, decoupled from the reading view, so it can be reused in library, review, and session screens without duplicating logic.

---

## 8. Anti-"AI-Generated" Checklist

Run every screen against this before calling it done:

- [ ] Is the background exactly `#F4F1EA` with a terracotta accent? → **Change it.** That specific combination is the single most common AI-default palette right now.
- [ ] Are there more than 2 decorative textures active on one screen at once? → **Cut to one.**
- [ ] Does every card have identical rounded-corners + soft-blur-shadow? → **Vary it** (hard offset shadow, asymmetric rotation, sharper corners on buttons vs. cards).
- [ ] Is the handwritten font used for anything other than the user's own notes? → **Remove it from there.**
- [ ] Does anything glow, gradient, or pulse without a reason tied to a real event (streak, completion)? → **Remove.**
- [ ] Would this page look identical if "studying" were swapped for "budgeting" or "fitness"? → If yes, the content isn't doing enough of the design work — bring in real subject specifics (chapter numbers, actual page counts, real subject names in copy).

---

## 9. Voice & Copy

- Buttons say what happens: `Mark chapter read`, not `Submit`. `Add a note`, not `Create`.
- Empty states are invitations, in the notebook's voice, not the system's: *"This page is still blank — write the first note."* rather than *"No data available."*
- Errors state what happened and what to do, calmly: *"That note didn't save — try again in a moment."* No apology, no exclamation points.
- Numbers are real: page counts, chapter counts, day-streaks — never placeholder "Lorem" data in the delivered build.

---

## 10. Accessibility & Performance Floor (non-negotiable, even for a "vintage" UI)

- Contrast: `ink` (#2A241C) on `paper` (#F1EAD9) ≈ 11:1 — comfortably passes AA/AAA. Verify any new accent pairing the same way.
- Visible keyboard focus ring on every interactive element — style it as a thin `pine`-colored ink outline (`outline: 2px solid #39493D; outline-offset: 2px`) rather than removing it.
- All motion respects `prefers-reduced-motion`.
- Texture/noise layers are `pointer-events-none` and marked `aria-hidden`.
- Font loading: self-host or preload the four typefaces; set a system-serif fallback stack so text isn't invisible during load (`font-display: swap`).

---

### Summary

Palette and paper texture set the mood; the type system (three restrained roles, not five decorative ones) sets the rhythm; sharp-cornered buttons and hard-offset shadows keep it from sliding into the generic "cozy cottagecore SaaS" look; and the margin rail is the one idea worth being bold about. Everything else stays quiet on purpose.