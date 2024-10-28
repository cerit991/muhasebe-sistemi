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
import { Badge } from "@/components/ui/badge"
import { InventoryDialog } from "@/components/inventory-dialog"
import { Card } from "@/components/ui/card"
import { Package2, AlertTriangle } from "lucide-react"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  code: string
  name: string
  unit: string
  quantity: number
  minQuantity: number
  price: number
  vatRate: number
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await fetchApi('products')
      setProducts(data)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleProductAdded = async () => {
    await loadProducts()
    setIsDialogOpen(false)
    toast({
      title: "Başarılı",
      description: "Yeni stok kartı başarıyla eklendi",
    })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0)
  const lowStockItems = products.filter(product => product.quantity <= product.minQuantity).length

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stok Yönetimi</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Yeni Stok Kartı
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="p-6">
          <div className="flex items-center">
            <Package2 className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <h3 className="text-sm font-medium">Toplam Ürün</h3>
              <div className="mt-2 text-2xl font-bold">{totalItems} Adet</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <h3 className="text-sm font-medium">Kritik Stok</h3>
              <div className="mt-2 text-2xl font-bold">{lowStockItems} Ürün</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Stok ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stok Kodu</TableHead>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>Birim</TableHead>
              <TableHead className="text-right">Miktar</TableHead>
              <TableHead className="text-right">Birim Fiyat</TableHead>
              <TableHead className="text-right">KDV %</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Kayıt bulunamadı</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-right">
                    {product.quantity}
                    {product.quantity <= product.minQuantity && (
                      <Badge variant="destructive" className="ml-2">
                        Kritik Stok
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">%{product.vatRate}</TableCell>
                  <TableCell>
                    <Badge variant={product.quantity > 0 ? "default" : "secondary"}>
                      {product.quantity > 0 ? "Stokta" : "Tükendi"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InventoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleProductAdded}
      />
    </div>
  )
}