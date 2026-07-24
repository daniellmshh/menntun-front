import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeInput(text: string, preventNewlines: boolean = false): string {
  if (!text) return "";
  let sanitized = text;
  
  // Remove symbols typically used for code or prompt injection
  sanitized = sanitized.replace(/[<>{}\\[\]`~$^=\\\\]/g, '');
  
  if (preventNewlines) {
    sanitized = sanitized.replace(/\\r?\\n|\\r/g, ' ');
  }
  
  return sanitized;
}
