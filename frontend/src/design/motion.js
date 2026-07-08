export const pageTurn = {
  initial: { opacity: 0, x: 24, rotateY: -6 },
  animate: { opacity: 1, x: 0, rotateY: 0 },
  exit: { opacity: 0, x: -24, rotateY: 6 },
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

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

export const staggerList = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};
