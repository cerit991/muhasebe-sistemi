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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useApi } from "@/lib/hooks/use-api"

interface Customer {
  id: string
  name: string
  code: string
}

interface LedgerEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void | Promise<void>
}

export function LedgerEntryDialog({ open, onOpenChange, onSuccess }: LedgerEntryDialogProps) {
  const { toast } = useToast()
  const { fetchApi, loading } = useApi()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    type: "",
    category: "",
    paymentType: "",
    customerId: "",
  })

  useEffect(() => {
    if (open) {
      loadCustomers()
    }
  }, [open])

  const loadCustomers = async () => {
    try {
      const data = await fetchApi('customers')
      setCustomers(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Cari listesi yüklenirken bir hata oluştu"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validation
      if (!formData.date || !formData.description || !formData.amount || !formData.type || !formData.category) {
        throw new Error("Lütfen tüm zorunlu alanları doldurun")
      }

      if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        throw new Error("Geçerli bir tutar girin")
      }

      // Ödeme türü her zaman zorunlu
      if (!formData.paymentType) {
        throw new Error("Lütfen ödeme türünü seçin")
      }

      const response = await fetchApi('ledger', {
        method: 'POST',
        body: formData
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Başarılı",
        description: "Kayıt başarıyla eklendi",
      })

      onOpenChange(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        amount: "",
        type: "",
        category: "",
        paymentType: "",
        customerId: "",
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
          <DialogTitle>Yeni Kayıt Ekle</DialogTitle>
          <DialogDescription>
            Hesap defterine yeni bir kayıt ekleyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Tarih
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tür
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cari Seçimi */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Cari
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              >
                <SelectTrigger className="col-span-3">
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

            {/* Ödeme Türü - Hem gelir hem gider için göster */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentType" className="text-right">
                Ödeme Türü
              </Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Ödeme türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Nakit</SelectItem>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="bank_transfer">Banka Transferi</SelectItem>
                  {formData.type === "expense" && (
                    <>
                      <SelectItem value="check">Çek</SelectItem>
                      <SelectItem value="promissory_note">Senet</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategori
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Satışlar</SelectItem>
                  <SelectItem value="rent">Kira</SelectItem>
                  <SelectItem value="utilities">Faturalar</SelectItem>
                  <SelectItem value="salary">Maaşlar</SelectItem>
                  <SelectItem value="supplies">Malzemeler</SelectItem>
                  <SelectItem value="maintenance">Bakım Onarım</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Tutar
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Açıklama
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                required
              />
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