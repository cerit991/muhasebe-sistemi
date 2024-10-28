"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InvoiceForm } from "./invoice-form"
import { InvoiceItems } from "./invoice-items"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import type { Customer, Product, InvoiceItem, InvoiceFormData } from "@/types/invoice"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "sale" | "purchase"
  onSuccess?: () => void | Promise<void>
}

export function InvoiceDialog({ open, onOpenChange, type, onSuccess }: InvoiceDialogProps) {
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    invoiceDate: new Date(),
    customerId: "",
    customerName: "",
    customerTaxNumber: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Müşterileri ve ürünleri yükle
  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        fetchApi('customers'),
        fetchApi('products')
      ])
      setCustomers(customersData)
      setProducts(productsData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu"
      })
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerTaxNumber: customer.taxNumber,
      }))
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, invoiceDate: date }))
    }
  }

  const addNewItem = () => {
    setItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      productCode: "",
      productName: "",
      quantity: 1,
      unit: "",
      price: 0,
      vatRate: 0,
      discount: 0,
      total: 0
    }])
  }

  const calculateItemTotal = (price: number, quantity: number, discount: number, vatRate: number) => {
    const subtotal = price * quantity
    const discountAmount = subtotal * (discount / 100)
    const afterDiscount = subtotal - discountAmount
    const vatAmount = afterDiscount * (vatRate / 100)
    return afterDiscount + vatAmount
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        price: product.price,
        vatRate: product.vatRate,
        unit: product.unit,
        total: calculateItemTotal(
          product.price,
          newItems[index].quantity,
          newItems[index].discount,
          product.vatRate
        )
      }
      setItems(newItems)
    }
  }

  const updateItemCalculations = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...items]
    const currentItem = { ...newItems[index], ...updates }
    currentItem.total = calculateItemTotal(
      currentItem.price,
      currentItem.quantity,
      currentItem.discount,
      currentItem.vatRate
    )
    newItems[index] = currentItem
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity
      const discountAmount = itemSubtotal * (item.discount / 100)
      return sum + (itemSubtotal - discountAmount)
    }, 0)

    const vatTotal = items.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity
      const discountAmount = itemSubtotal * (item.discount / 100)
      const afterDiscount = itemSubtotal - discountAmount
      return sum + (afterDiscount * (item.vatRate / 100))
    }, 0)

    const total = subtotal + vatTotal

    return { subtotal, vatTotal, total }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.invoiceNumber || !formData.customerId) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen zorunlu alanları doldurun!"
        })
        return
      }

      if (items.length === 0) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "En az bir ürün eklemelisiniz!"
        })
        return
      }

      const totals = calculateTotals()
      const response = await fetchApi('invoices', {
        method: 'POST',
        body: {
          ...formData,
          type,
          items,
          totals
        }
      })

      toast({
        title: "Başarılı",
        description: "Fatura başarıyla kaydedildi"
      })

      onOpenChange(false)
      if (onSuccess) {
        await onSuccess()
      }

      // Form verilerini sıfırla
      setFormData({
        invoiceNumber: "",
        invoiceDate: new Date(),
        customerId: "",
        customerName: "",
        customerTaxNumber: "",
      })
      setItems([])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Fatura kaydedilirken bir hata oluştu"
      })
    }
  }

  // Dialog açıldığında verileri yükle
  useState(() => {
    if (open) {
      loadData()
    }
  })

  const totals = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>
            {type === "purchase" ? "Alış Faturası" : "Satış Faturası"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <InvoiceForm
            formData={formData}
            customers={customers}
            onCustomerSelect={handleCustomerSelect}
            onDateSelect={handleDateSelect}
            onInvoiceNumberChange={(value) => setFormData(prev => ({ ...prev, invoiceNumber: value }))}
          />

          <InvoiceItems
            items={items}
            products={products}
            onAddItem={addNewItem}
            onRemoveItem={removeItem}
            onProductSelect={handleProductSelect}
            onUpdateItem={updateItemCalculations}
            totals={totals}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}