import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
export const FormatCurr = (curr) =>
  new Intl.NumberFormat().format(parseInt(curr));

