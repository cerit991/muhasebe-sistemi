import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })
  .format(amount)
  .replace(/\s/g, '') + ' ₺' // Remove any spaces and add ₺ at the end
}

// Format number as Turkish style with exactly 2 decimal places
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount)
}

// Format balance with A/B indicator
export function formatBalance(amount: number): string {
  const formattedAmount = formatNumber(Math.abs(amount))
  return `${formattedAmount} ₺ ${amount >= 0 ? '(A)' : '(B)'}`
}
