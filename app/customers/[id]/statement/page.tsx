"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import { Download, Printer } from "lucide-react"
import { generateCustomerStatement } from "@/lib/pdf"

interface Statement {
  customer: {
    code: string
    name: string
    type: string
    taxNumber: string
    phone: string
    balance: number
  }
  transactions: Array<{
    id: string
    date: string
    description: string
    type: string
    amount: number
    paymentType: string
    reference?: string
    balance: number
  }>
}

export default function CustomerStatementPage() {
  const params = useParams()
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()
  const [statement, setStatement] = useState<Statement | null>(null)

  useEffect(() => {
    loadStatement()
  }, [params.id])

  const loadStatement = async () => {
    try {
      const data = await fetchApi(`customers/${params.id}/statement`)
      setStatement(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hesap ekstresi yüklenirken bir hata oluştu"
      })
    }
  }

  const handleDownloadPDF = () => {
    if (!statement) return

    try {
      const doc = generateCustomerStatement(statement.customer, statement.transactions)
      doc.save(`ekstre_${statement.customer.code}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "PDF oluşturulurken bir hata oluştu"
      })
    }
  }

  const handlePrintPDF = () => {
    if (!statement) return

    try {
      const doc = generateCustomerStatement(statement.customer, statement.transactions)
      doc.autoPrint()
      window.open(doc.output('bloburl'), '_blank')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yazdırma işlemi başlatılırken bir hata oluştu"
      })
    }
  }

  if (!statement) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-32">
          {loading ? "Yükleniyor..." : "Hesap ekstresi bulunamadı"}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hesap Ekstresi</h1>
        <div className="flex space-x-2">
          <CalendarDateRangePicker />
          <Button variant="outline" size="icon" onClick={handlePrintPDF}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Cari Bilgileri</h3>
            <p className="text-sm">{statement.customer.name}</p>
            <p className="text-sm text-muted-foreground">({statement.customer.code})</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">İletişim</h3>
            <p className="text-sm">{statement.customer.phone}</p>
            <p className="text-sm text-muted-foreground">VKN: {statement.customer.taxNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Bakiye Durumu</h3>
            <p className={`text-lg font-bold ${statement.customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{statement.customer.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <Badge variant={statement.customer.type === 'customer' ? 'default' : 'secondary'}>
              {statement.customer.type === 'customer' ? 'Müşteri' : 'Tedarikçi'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>İşlem Türü</TableHead>
                <TableHead>Ödeme Şekli</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">Bakiye</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statement.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type === 'income' ? 'Tahsilat' : 'Ödeme'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.paymentType === 'cash' && 'Nakit'}
                    {transaction.paymentType === 'credit_card' && 'Kredi Kartı'}
                    {transaction.paymentType === 'bank_transfer' && 'Banka Transferi'}
                    {transaction.paymentType === 'check' && 'Çek'}
                    {transaction.paymentType === 'promissory_note' && 'Senet'}
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₺{transaction.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}