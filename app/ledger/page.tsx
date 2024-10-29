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
import { LedgerEntryDialog } from "@/components/ledger-entry-dialog"
import { Card } from "@/components/ui/card"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

interface LedgerEntry {
  id: string
  date: string
  description: string
  type: string
  category: string
  amount: number
  customer?: {
    name: string
    code: string
  }
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const data = await fetchApi('ledger')
      setEntries(data)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kayıtlar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleEntryAdded = async () => {
    await loadEntries()
    setIsDialogOpen(false)
    toast({
      title: "Başarılı",
      description: "Yeni kayıt başarıyla eklendi",
    })
  }

  const filteredEntries = entries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalIncome = entries
    .filter(e => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpense = entries
    .filter(e => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hesap Defteri</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Yeni Kayıt Ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium">Toplam Gelir</h3>
          <div className="mt-2 text-2xl font-bold text-green-600">
            ₺{totalIncome.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Toplam Gider</h3>
          <div className="mt-2 text-2xl font-bold text-red-600">
            ₺{totalExpense.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Net Durum</h3>
          <div className="mt-2 text-2xl font-bold">
            ₺{(totalIncome - totalExpense).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="İşlem ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Cari</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Kayıt bulunamadı</TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString("tr-TR")}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    {entry.customer ? `${entry.customer.name} (${entry.customer.code})` : "-"}
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>
                    <Badge variant={entry.type === "income" ? "default" : "destructive"}>
                      {entry.type === "income" ? "Gelir" : "Gider"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{entry.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LedgerEntryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleEntryAdded}
      />
    </div>
  )
}