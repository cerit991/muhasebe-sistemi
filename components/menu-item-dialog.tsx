"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/components/ui/use-toast"
import { useApi } from "@/lib/hooks/use-api"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  code: string
  name: string
  price: number
  unit: string
}

interface Ingredient {
  id: string
  productId: string
  productName: string
  productCode: string
  quantity: number
  unit: string
  cost: number
}

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void | Promise<void>
}

export function MenuItemDialog({ open, onOpenChange, onSuccess }: MenuItemDialogProps) {
  const { toast } = useToast()
  const { fetchApi, loading } = useApi()
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  })
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [openCombobox, setOpenCombobox] = useState<number | null>(null)

  // Ürünleri yükle
  const loadProducts = async () => {
    try {
      const data = await fetchApi('products')
      setProducts(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu"
      })
    }
  }

  // Dialog açıldığında ürünleri yükle
  useState(() => {
    if (open) {
      loadProducts()
    }
  })

  const addNewIngredient = () => {
    setIngredients(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      productName: "",
      productCode: "",
      quantity: 1,
      unit: "",
      cost: 0
    }])
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const newIngredients = [...ingredients]
      newIngredients[index] = {
        ...newIngredients[index],
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        unit: product.unit,
        cost: product.price * newIngredients[index].quantity
      }
      setIngredients(newIngredients)
    }
  }

  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    const newIngredients = [...ingredients]
    const currentIngredient = { ...newIngredients[index], ...updates }
    
    // Maliyeti güncelle
    const product = products.find(p => p.id === currentIngredient.productId)
    if (product) {
      currentIngredient.cost = product.price * currentIngredient.quantity
    }
    
    newIngredients[index] = currentIngredient
    setIngredients(newIngredients)
  }

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, item) => sum + item.cost, 0)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.price || ingredients.length === 0) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen tüm zorunlu alanları doldurun ve en az bir malzeme ekleyin"
        })
        return
      }

      const response = await fetchApi('menu-items', {
        method: 'POST',
        body: {
          ...formData,
          price: parseFloat(formData.price),
          ingredients: ingredients.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      })

      toast({
        title: "Başarılı",
        description: "Menü kalemi başarıyla kaydedildi"
      })

      onOpenChange(false)
      if (onSuccess) {
        await onSuccess()
      }

      // Formu sıfırla
      setFormData({
        name: "",
        description: "",
        price: "",
      })
      setIngredients([])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Menü kalemi kaydedilirken bir hata oluştu"
      })
    }
  }

  const totalCost = calculateTotalCost()
  const profitMargin = formData.price ? 
    ((parseFloat(formData.price) - totalCost) / parseFloat(formData.price) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Yeni Menü Kalemi</DialogTitle>
          <DialogDescription>
            Menü kaleminin bilgilerini ve malzemelerini girin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Menü Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">Satış Fiyatı</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Malzemeler</h3>
              <Button onClick={addNewIngredient}>
                <Plus className="mr-2 h-4 w-4" /> Malzeme Ekle
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Ürün</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Birim</TableHead>
                  <TableHead className="text-right">Birim Fiyat</TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient, index) => (
                  <TableRow key={ingredient.id}>
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
                              "w-[300px] justify-between",
                              !ingredient.productId && "text-muted-foreground"
                            )}
                          >
                            {ingredient.productId ? (
                              <span className="flex items-center">
                                <span className="font-medium">{ingredient.productName}</span>
                                <span className="ml-2 text-muted-foreground">
                                  ({ingredient.productCode})
                                </span>
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
                                    handleProductSelect(index, product.id)
                                    setOpenCombobox(null)
                                  }}
                                  className="flex justify-between items-center"
                                >
                                  <div>
                                    <span className="font-medium">{product.name}</span>
                                    <span className="ml-2 text-muted-foreground">
                                      ({product.code})
                                    </span>
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
                        min="0.01"
                        step="0.01"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, { 
                          quantity: parseFloat(e.target.value) 
                        })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={ingredient.unit}
                        readOnly
                        className="w-20 bg-muted"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ₺{(ingredient.cost / ingredient.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₺{ingredient.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col items-end space-y-2">
              <div className="text-sm">Toplam Maliyet: ₺{totalCost.toFixed(2)}</div>
              {formData.price && (
                <>
                  <div className="text-sm">
                    Satış Fiyatı: ₺{parseFloat(formData.price).toFixed(2)}
                  </div>
                  <div className="text-sm">
                    Kar Marjı: %{profitMargin.toFixed(2)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}