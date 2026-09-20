/**
 * JS-side mirror of the surface/border tokens declared in `globals.css`.
 *
 * Most components should use Tailwind utilities (`bg-panel`, `border-line`) or
 * inline `style={{ stroke: 'var(--color-line)' }}`, both of which resolve the
 * CSS custom properties directly.
 *
 * This module exists only for renderers that forward colours as SVG
 * *presentation attributes* — notably recharts — where `var()` is not
 * substituted by the browser and would silently fall back to black.
 *
 * KEEP IN SYNC WITH `src/styles/globals.css` → `@theme`.
 */
export const SURFACE = {
  void: '#08090b',
  base: '#0c0e11',
  panel: '#11141a',
  panel2: '#151a21',
  raised: '#1b212a',
} as const;

export const BORDER = {
  line: '#242c35',
  line2: '#2e3841',
  line3: '#3b4650',
} as const;

export const INK = {
  ink: '#e6ebf1',
  ink2: '#aeb9c6',
  ink3: '#97a2af',
  ink4: '#828d9a',
} as const;

export const ACCENT = {
  term: '#3fb37f',
  termDim: '#2f8a61',
  cyber: '#4a9ec4',
  volt: '#5d8bd7',
  ai: '#9481c6',
} as const;
