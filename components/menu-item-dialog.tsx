"use client"

import { useState, useEffect } from "react"
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

  // Load products when dialog opens
  useEffect(() => {
    if (open) {
      loadProducts()
    }
  }, [open])

  const loadProducts = async () => {
    try {
      const data = await fetchApi('products')
      setProducts(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products"
      })
    }
  }

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
      setOpenCombobox(null)
    }
  }

  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    const newIngredients = [...ingredients]
    const currentIngredient = { ...newIngredients[index], ...updates }
    
    // Update cost
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
          title: "Error",
          description: "Please fill in all required fields and add at least one ingredient"
        })
        return
      }

      await fetchApi('menu-items', {
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
        title: "Success",
        description: "Menu item saved successfully"
      })

      onOpenChange(false)
      if (onSuccess) {
        await onSuccess()
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
      })
      setIngredients([])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save menu item"
      })
    }
  }

  const totalCost = calculateTotalCost()
  const profitMargin = formData.price ? 
    ((parseFloat(formData.price) - totalCost) / parseFloat(formData.price) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Menü Kalemi</DialogTitle>
          <DialogDescription>
            Menu cost için reçete belirleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Menudeki İsim</Label>
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
              <h3 className="text-lg font-medium">Reçete</h3>
              <Button onClick={addNewIngredient}>
                <Plus className="mr-2 h-4 w-4" /> Ürün Ekle
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Ürün</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
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
                                    onSelect={() => handleProductSelect(index, product.id)}
                                  >
                                    <div className="flex justify-between w-full">
                                      <span>
                                        <span className="font-medium">{product.name}</span>
                                        <span className="ml-2 text-muted-foreground">
                                          ({product.code})
                                        </span>
                                      </span>
                                      <span className="text-muted-foreground">
                                        ₺{product.price.toLocaleString()}
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
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="text-sm">Total Maliyet: ₺{totalCost.toFixed(2)}</div>
              {formData.price && (
                <>
                  <div className="text-sm">
                    Satış Fiyatı: ₺{parseFloat(formData.price).toFixed(2)}
                  </div>
                  <div className="text-sm">
                    Kar Oranı: %{profitMargin.toFixed(2)}
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
            {loading ? "Saving..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}