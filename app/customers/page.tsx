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
import { CustomerDialog } from "@/components/customer-dialog"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface Customer {
  id: string
  code: string
  name: string
  type: string
  taxNumber: string
  phone: string
  balance: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await fetchApi('customers')
      setCustomers(data)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Müşteriler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleCustomerAdded = async () => {
    await loadCustomers()
    setIsDialogOpen(false)
    toast({
      title: "Başarılı",
      description: "Yeni cari kart başarıyla eklendi",
    })
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.taxNumber.includes(searchTerm)
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cari Kartlar</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Yeni Cari Kart
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Cari ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cari Kodu</TableHead>
              <TableHead>Cari Adı</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Vergi No</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-right">Bakiye</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Kayıt bulunamadı</TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{customer.code}</TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <Badge variant={customer.type === "customer" ? "default" : "secondary"}>
                      {customer.type === "customer" ? "Müşteri" : "Tedarikçi"}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.taxNumber}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className={`text-right font-medium whitespace-nowrap ${
                    customer.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(customer.balance)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/customers/${customer.id}/statement`)}
                    >
                      Ekstre
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCustomerAdded}
      />
    </div>
  )
}
