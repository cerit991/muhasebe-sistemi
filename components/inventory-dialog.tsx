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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useApi } from "@/lib/hooks/use-api"

interface InventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void | Promise<void>
}

export function InventoryDialog({ open, onOpenChange, onSuccess }: InventoryDialogProps) {
  const { toast } = useToast()
  const { fetchApi, loading } = useApi()
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    vatRate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validation
      if (!formData.name || !formData.unit || !formData.vatRate) {
        throw new Error("Lütfen tüm alanları doldurun")
      }

      const response = await fetchApi('products', {
        method: 'POST',
        body: formData
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Başarılı",
        description: "Stok kartı başarıyla oluşturuldu",
      })

      onOpenChange(false)
      setFormData({
        name: "",
        unit: "",
        vatRate: "",
      })

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Stok Kartı</DialogTitle>
          <DialogDescription>
            Yeni stok kartı bilgilerini girin. Birim fiyat alış faturalarından otomatik güncellenecektir.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Ürün Adı
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Birim
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Birim seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adet">Adet</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="lt">Litre</SelectItem>
                  <SelectItem value="mt">Metre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vatRate" className="text-right">
                KDV Oranı
              </Label>
              <Select
                value={formData.vatRate}
                onValueChange={(value) => setFormData({ ...formData, vatRate: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="KDV oranı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">%0</SelectItem>
                  <SelectItem value="1">%1</SelectItem>
                  <SelectItem value="10">%10</SelectItem>
                  <SelectItem value="20">%20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}