import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

/**
 * A utility function to merge class names with Tailwind CSS classes.
 */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}
