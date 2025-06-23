import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// This function merges class names and removes duplicates. It is used by shadcn/ui components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
