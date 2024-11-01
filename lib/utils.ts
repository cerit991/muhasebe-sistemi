import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  })
  .format(amount)
  .replace('.', ',') // Nokta yerine virgül kullan
  .replace(/\s/g, '') + ' ₺'
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  })
  .format(amount)
  .replace('.', ',') // Nokta yerine virgül kullan
}

export function formatBalance(amount: number): string {
  const formattedAmount = formatNumber(Math.abs(amount))
  return `${formattedAmount} ₺ ${amount >= 0 ? '(A)' : '(B)'}`
}
