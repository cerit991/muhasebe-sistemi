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
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import { Download, Printer } from "lucide-react"
import { generateCustomerStatement } from "@/lib/pdf"
import type { Customer, Transaction } from "@/types/statement"

interface Statement {
  customer: Customer
  transactions: Transaction[]
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

  // Calculate totals
  const totalDebit = statement.transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCredit = statement.transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

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
            <p className="text-sm">Hesap Kodu: {statement.customer.code}</p>
            <p className="text-sm">Hesap Adı: {statement.customer.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">İletişim</h3>
            <p className="text-sm">Telefon: {statement.customer.phone}</p>
            <p className="text-sm">VKN: {statement.customer.taxNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Bakiye Durumu</h3>
            <p className="text-sm">Alacak Toplamı: ₺{totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            <p className="text-lg font-bold mt-2">
              Bakiye: ₺{Math.abs(statement.customer.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              {statement.customer.balance >= 0 ? ' (A)' : ' (B)'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Fiş No</TableHead>
                <TableHead>Türü</TableHead>
                <TableHead>Belge No</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">Borç</TableHead>
                <TableHead className="text-right">Alacak</TableHead>
                <TableHead className="text-right">Bakiye</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statement.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{transaction.documentNo || '-'}</TableCell>
                  <TableCell>
                    {transaction.type === 'debit' ? 'Borç' : 'Alacak'}
                  </TableCell>
                  <TableCell>{transaction.documentNo || '-'}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    {transaction.type === 'debit' 
                      ? `₺${transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` 
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.type === 'credit'
                      ? `₺${transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₺{Math.abs(transaction.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    {transaction.balance >= 0 ? ' (A)' : ' (B)'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">
            Listelenen: {statement.transactions.length}
          </div>
          <div className="space-y-1 text-sm text-right">
            <p>Sayfa Toplamı: ₺{totalDebit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / ₺{totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            <p>Rapor Toplamı: ₺{totalDebit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / ₺{totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
