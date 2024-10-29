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
import type { Customer, InvoiceFormData } from "./types"

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
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="invoiceNumber" className="text-sm font-medium mb-1.5 block">
              Invoice Number
            </Label>
            <Input
              id="invoiceNumber"
              required
              value={formData.invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              className="w-full"
              placeholder="Enter invoice number"
            />
          </div>

          <div>
            <Label htmlFor="invoiceDate" className="text-sm font-medium mb-1.5 block">
              Invoice Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="invoiceDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.invoiceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.invoiceDate ? format(formData.invoiceDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer" className="text-sm font-medium mb-1.5 block">
              Customer/Tedarikçi
            </Label>
            <Select onValueChange={onCustomerSelect} value={formData.customerId}>
              <SelectTrigger id="customer" className="w-full">
                <SelectValue placeholder="Select customer/supplier" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{customer.name}</span>
                      <span className="text-muted-foreground">({customer.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taxNumber" className="text-sm font-medium mb-1.5 block">
              Tax Number
            </Label>
            <Input
              id="taxNumber"
              value={formData.customerTaxNumber}
              readOnly
              className="w-full bg-muted"
              placeholder="Tax number will appear here"
            />
          </div>
        </div>
      </div>

      {formData.customerName && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">Cari Seç: </span>
            {formData.customerName}
          </div>
        </div>
      )}
    </div>
  )
}