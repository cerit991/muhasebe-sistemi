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
import type { InvoiceItem, Product, InvoiceTotals } from "./types"
import { cn } from "@/lib/utils"

interface InvoiceItemsProps {
  items: InvoiceItem[]
  products: Product[]
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onProductSelect: (index: number, productId: string) => void
  onUpdateItem: (index: number, updates: Partial<InvoiceItem>) => void
  totals: InvoiceTotals
  openCombobox: number | null
  setOpenCombobox: (index: number | null) => void
}

export function InvoiceItems({
  items,
  products,
  onAddItem,
  onRemoveItem,
  onProductSelect,
  onUpdateItem,
  totals,
  openCombobox,
  setOpenCombobox,
}: InvoiceItemsProps) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Items</h3>
        <Button onClick={onAddItem}>
          <Plus className="mr-2 h-4 w-4" /> Ürün Ekle
        </Button>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%] min-w-[200px]">Stok Adı</TableHead>
              <TableHead className="w-[10%] min-w-[80px]">Miktar</TableHead>
              <TableHead className="w-[10%] min-w-[80px]">Birim</TableHead>
              <TableHead className="w-[12%] min-w-[100px]">Birim Fiyat</TableHead>
              <TableHead className="w-[10%] min-w-[80px]">İskonto %</TableHead>
              <TableHead className="w-[8%] min-w-[70px]">KDV %</TableHead>
              <TableHead className="w-[10%] min-w-[100px]">Total</TableHead>
              <TableHead className="w-[5%] min-w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="min-w-[200px]">
                  <Popover 
                    open={openCombobox === index} 
                    onOpenChange={(open) => setOpenCombobox(open ? index : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {item.productId ? (
                          <span className="flex items-center truncate">
                            <span className="font-medium truncate">{item.productName}</span>
                            <span className="ml-2 text-muted-foreground shrink-0">({item.productCode})</span>
                          </span>
                        ) : (
                          "Select product..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.name} ${product.code}`}
                              onSelect={() => {
                                onProductSelect(index, product.id)
                                setOpenCombobox(null)
                              }}
                            >
                              <div className="flex justify-between w-full">
                                <span className="truncate">{product.name}</span>
                                <span className="ml-2 text-muted-foreground shrink-0">
                                  ({product.code})
                                </span>
                              </div>
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
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={item.unit} 
                    readOnly 
                    className="w-full bg-muted" 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => onUpdateItem(index, { price: Number(e.target.value) })}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => onUpdateItem(index, { discount: Number(e.target.value) })}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={item.vatRate} 
                    readOnly 
                    className="w-full bg-muted" 
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    readOnly
                    className="w-full bg-muted text-right"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(index)}
                    className="h-8 w-8"
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
        <div className="text-sm">Subtotal: ₺{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        <div className="text-sm">VAT Total: ₺{totals.vatTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        <div className="text-lg font-bold">Total: ₺{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>
  )
}