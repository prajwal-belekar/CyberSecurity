import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/** Tailwind-aware className combiner used by every component. */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
