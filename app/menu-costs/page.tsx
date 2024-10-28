"use client"

import { useEffect, useState } from "react"
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
import { Card } from "@/components/ui/card"
import { MenuItemDialog } from "@/components/menu-item-dialog"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  id: string
  code: string
  name: string
  description: string
  price: number
  totalCost: number
  profitMargin: number
  ingredients: Array<{
    quantity: number
    product: {
      name: string
      price: number
      unit: string
    }
  }>
}

export default function MenuCostsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      const data = await fetchApi('menu-items')
      setMenuItems(data)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Menü kalemleri yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleMenuItemAdded = async () => {
    await loadMenuItems()
    setIsDialogOpen(false)
    toast({
      title: "Başarılı",
      description: "Yeni menü kalemi başarıyla eklendi",
    })
  }

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menü Maliyet Analizi</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Yeni Menü Kalemi
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium">Ortalama Maliyet</h3>
          <div className="mt-2 text-2xl font-bold">
            ₺{(menuItems.reduce((acc, item) => acc + item.totalCost, 0) / menuItems.length || 0).toFixed(2)}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Ortalama Kar Marjı</h3>
          <div className="mt-2 text-2xl font-bold">
            %{(menuItems.reduce((acc, item) => acc + item.profitMargin, 0) / menuItems.length || 0).toFixed(2)}
          </div>
        </Card>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Menü kalemi ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kod</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead className="text-right">Maliyet</TableHead>
              <TableHead className="text-right">Satış Fiyatı</TableHead>
              <TableHead className="text-right">Kar Marjı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : filteredMenuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Kayıt bulunamadı</TableCell>
              </TableRow>
            ) : (
              filteredMenuItems.map((item) => (
                <TableRow 
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    // TODO: Detay görünümü eklenecek
                  }}
                >
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">
                    ₺{item.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    %{item.profitMargin.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MenuItemDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleMenuItemAdded}
      />
    </div>
  )
}