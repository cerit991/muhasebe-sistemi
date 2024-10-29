import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from "@/components/ui/button"

export interface Customer {
  id: string
  name: string
  code: string
  taxNumber: string
}

export interface Product {
  id: string
  code: string
  name: string
  price: number
  vatRate: number
  unit: string
}

export interface InvoiceItem {
  id: string
  productId: string
  productCode: string
  productName: string
  quantity: number
  unit: string
  price: number
  vatRate: number
  discount: number
  total: number
}

export interface InvoiceFormData {
  invoiceNumber: string
  invoiceDate: Date
  customerId: string
  customerName: string
  customerTaxNumber: string
}

export interface InvoiceTotals {
  subtotal: number
  vatTotal: number
  total: number
}

export interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "sale" | "purchase"
  onSuccess?: () => void | Promise<void>
}

export type ButtonVariants = VariantProps<typeof buttonVariants>