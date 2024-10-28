"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Customer, InvoiceFormData } from "@/types/invoice"

interface InvoiceFormProps {
  formData: InvoiceFormData
  customers: Customer[]
  onCustomerSelect: (customerId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onInvoiceNumberChange: (value: string) => void
}

export function InvoiceForm({
  formData,
  customers,
  onCustomerSelect,
  onDateSelect,
  onInvoiceNumberChange,
}: InvoiceFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right">Fatura No</Label>
        <Input
          required
          value={formData.invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          className="col-span-2"
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right">Fatura Tarihi</Label>
        <div className="col-span-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.invoiceDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.invoiceDate ? format(formData.invoiceDate, "PPP") : <span>Tarih seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.invoiceDate}
                onSelect={onDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right">Cari Seçimi</Label>
        <Select onValueChange={onCustomerSelect} value={formData.customerId}>
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Cari seçin" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right">Vergi No</Label>
        <Input
          value={formData.customerTaxNumber}
          readOnly
          className="col-span-2 bg-muted"
        />
      </div>
    </div>
  )
}