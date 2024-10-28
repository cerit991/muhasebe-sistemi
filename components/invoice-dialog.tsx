"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  taxNumber: string
}

interface Product {
  id: string
  code: string
  name: string
  price: number
  vatRate: number
  unit: string
}

interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  vatRate: number
  discount: number
  total: number
}

const mockCustomers: Customer[] = [
  { id: "1", name: "ABC Ltd", taxNumber: "1234567890" },
  { id: "2", name: "XYZ Corp", taxNumber: "9876543210" },
]

const mockProducts: Product[] = [
  { id: "1", code: "P001", name: "Laptop", price: 15000, vatRate: 18, unit: "Adet" },
  { id: "2", code: "P002", name: "Mouse", price: 350, vatRate: 18, unit: "Adet" },
]

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "sale" | "purchase"
}

export function InvoiceDialog({ open, onOpenChange, type }: InvoiceDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([])

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId)
  }

  const addNewItem = () => {
    setItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      productName: "",
      quantity: 1,
      unit: "",
      price: 0,
      vatRate: 0,
      discount: 0,
      total: 0
    }])
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
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

  const calculateItemTotal = (price: number, quantity: number, discount: number, vatRate: number) => {
    const subtotal = price * quantity
    const discountAmount = subtotal * (discount / 100)
    const afterDiscount = subtotal - discountAmount
    const vatAmount = afterDiscount * (vatRate / 100)
    return afterDiscount + vatAmount
  }

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
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
    return items.reduce(
      (acc, item) => {
        const subtotal = item.price * item.quantity
        const discountAmount = subtotal * (item.discount / 100)
        const afterDiscount = subtotal - discountAmount
        const vatAmount = afterDiscount * (item.vatRate / 100)
        
        return {
          subtotal: acc.subtotal + afterDiscount,
          vatTotal: acc.vatTotal + vatAmount,
          total: acc.total + afterDiscount + vatAmount
        }
      },
      { subtotal: 0, vatTotal: 0, total: 0 }
    )
  }

  const totals = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>{type === "purchase" ? "Alış Faturası" : "Satış Faturası"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fatura No</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Fatura numarası girin"
              />
            </div>

            <div className="space-y-2">
              <Label>Cari Seçimi</Label>
              <Select onValueChange={handleCustomerSelect} value={selectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Cari seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Ürünler</h3>
              <Button onClick={addNewItem}>
                <Plus className="mr-2 h-4 w-4" /> Yeni Kalem
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Birim</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>İskonto %</TableHead>
                  <TableHead>KDV %</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ürün seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input value={item.unit} readOnly className="bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, { price: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateItem(index, { discount: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input value={item.vatRate} readOnly className="bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Input value={item.total.toFixed(2)} readOnly className="bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col items-end space-y-2">
              <div className="text-sm">Ara Toplam: ₺{totals.subtotal.toFixed(2)}</div>
              <div className="text-sm">KDV Toplam: ₺{totals.vatTotal.toFixed(2)}</div>
              <div className="text-lg font-bold">Genel Toplam: ₺{totals.total.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button onClick={() => {
              if (!invoiceNumber || !selectedCustomer) {
                alert("Lütfen zorunlu alanları doldurun!")
                return
              }
              console.log({ invoiceNumber, selectedCustomer, items, totals })
              onOpenChange(false)
            }}>
              Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}