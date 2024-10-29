"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Plus, Trash2, ChevronsUpDown } from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  code: string
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
  productCode: string
  productName: string
  quantity: number
  unit: string
  price: number
  vatRate: number
  discount: number
  total: number
}

interface InvoiceFormData {
  invoiceNumber: string
  invoiceDate: Date
  customerId: string
  customerName: string
  customerTaxNumber: string
}

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
  const [openCombobox, setOpenCombobox] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

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
        title: "Error",
        description: "Failed to load data"
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

    return {
      subtotal,
      vatTotal,
      total: subtotal + vatTotal
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.invoiceNumber || !formData.customerId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields!"
        })
        return
      }

      if (items.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please add at least one item!"
        })
        return
      }

      const totals = calculateTotals()
      await fetchApi('invoices', {
        method: 'POST',
        body: {
          ...formData,
          type,
          items,
          totals
        }
      })

      toast({
        title: "Success",
        description: "Invoice created successfully"
      })

      onOpenChange(false)
      if (onSuccess) {
        await onSuccess()
      }

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
        title: "Error",
        description: "Failed to create invoice"
      })
    }
  }

  const totals = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "purchase" ? "Purchase Invoice" : "Sales Invoice"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Invoice Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right">Fatura NO:</Label>
              <Input
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                className="col-span-2"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right">Fatura Tarihi</Label>
              <div className="col-span-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.invoiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.invoiceDate ? format(formData.invoiceDate, "PPP") : <span>Tarih Seç</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.invoiceDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right">Cari</Label>
              <Select onValueChange={handleCustomerSelect} value={formData.customerId}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Cari Seç" />
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
              <Label className="text-right">Vergi NO:</Label>
              <Input
                value={formData.customerTaxNumber}
                readOnly
                className="col-span-2 bg-muted"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Stoklar</h3>
              <Button onClick={addNewItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Ürün</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead>Birim Fiyatı</TableHead>
                    <TableHead>İskonto %</TableHead>
                    <TableHead>KDV %</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Popover 
                          open={openCombobox === index} 
                          onOpenChange={(open) => setOpenCombobox(open ? index : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-[200px] justify-between",
                                !item.productId && "text-muted-foreground"
                              )}
                            >
                              {item.productId ? (
                                <span className="flex items-center truncate">
                                  <span className="font-medium">{item.productName}</span>
                                  <span className="ml-2 text-muted-foreground">({item.productCode})</span>
                                </span>
                              ) : (
                                "Select product..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Search product..." />
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-auto">
                                {products.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={`${product.name} ${product.code}`}
                                    onSelect={() => {
                                      handleProductSelect(index, product.id)
                                      setOpenCombobox(null)
                                    }}
                                  >
                                    <span className="truncate">{product.name}</span>
                                    <span className="ml-2 text-muted-foreground">({product.code})</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemCalculations(index, { quantity: Number(e.target.value) })}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.unit} 
                          readOnly 
                          className="w-20 bg-muted" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemCalculations(index, { price: Number(e.target.value) })}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItemCalculations(index, { discount: Number(e.target.value) })}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.vatRate} 
                          readOnly 
                          className="w-20 bg-muted" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          readOnly
                          className="w-28 bg-muted text-right"
                        />
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
            </div>

            <div className="mt-4 flex flex-col items-end space-y-2">
              <div className="text-sm">Kdv Hariç: ₺{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div className="text-sm">KDV toplam: ₺{totals.vatTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div className="text-lg font-bold">Total: ₺{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}