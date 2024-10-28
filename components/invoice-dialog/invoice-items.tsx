"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus, Trash2, ChevronsUpDown } from "lucide-react"
import type { InvoiceItem, Product, InvoiceTotals } from "@/types/invoice"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface InvoiceItemsProps {
  items: InvoiceItem[]
  products: Product[]
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onProductSelect: (index: number, productId: string) => void
  onUpdateItem: (index: number, updates: Partial<InvoiceItem>) => void
  totals: InvoiceTotals
}

export function InvoiceItems({
  items,
  products,
  onAddItem,
  onRemoveItem,
  onProductSelect,
  onUpdateItem,
  totals,
}: InvoiceItemsProps) {
  const [openCombobox, setOpenCombobox] = useState<number | null>(null)

  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ürünler</h3>
        <Button onClick={onAddItem}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Kalem
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Ürün</TableHead>
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
                <Popover open={openCombobox === index} onOpenChange={(open) => setOpenCombobox(open ? index : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[300px] justify-between",
                        !item.productId && "text-muted-foreground"
                      )}
                    >
                      {item.productId ? (
                        <span className="flex items-center">
                          <span className="font-medium">{item.productName}</span>
                          <span className="ml-2 text-muted-foreground">({item.productCode})</span>
                        </span>
                      ) : (
                        "Ürün seçin veya arayın..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Ürün ara..." className="h-9" />
                      <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.name} ${product.code}`}
                            onSelect={() => {
                              onProductSelect(index, product.id)
                              setOpenCombobox(null)
                            }}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <span className="font-medium">{product.name}</span>
                              <span className="ml-2 text-muted-foreground">({product.code})</span>
                            </div>
                            <span className="text-muted-foreground">
                              ₺{product.price.toLocaleString()}
                            </span>
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
                  onChange={(e) => onUpdateItem(index, { quantity: Number(e.target.value) })}
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
                  onChange={(e) => onUpdateItem(index, { price: Number(e.target.value) })}
                  className="w-28"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.discount}
                  onChange={(e) => onUpdateItem(index, { discount: Number(e.target.value) })}
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
                  onClick={() => onRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex flex-col items-end space-y-2">
        <div className="text-sm">Ara Toplam: ₺{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        <div className="text-sm">KDV Toplam: ₺{totals.vatTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        <div className="text-lg font-bold">Genel Toplam: ₺{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>
  )
}