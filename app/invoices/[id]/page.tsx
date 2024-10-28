"use client"

import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Send, Printer } from "lucide-react"

// Örnek fatura verisi - Gerçek uygulamada API'den gelecek
const invoice = {
  id: "INV001",
  date: "2024-01-20",
  dueDate: "2024-02-20",
  status: "pending",
  customer: {
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    address: "Kadıköy, İstanbul",
    taxNumber: "1234567890"
  },
  items: [
    { id: 1, description: "Web Tasarım Hizmeti", quantity: 1, price: 5000, total: 5000 },
    { id: 2, description: "Hosting (Yıllık)", quantity: 1, price: 1200, total: 1200 }
  ],
  subtotal: 6200,
  tax: 1116,
  total: 7316
}

export default function InvoiceDetailPage() {
  const params = useParams()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fatura #{params.id}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" />
            Email Gönder
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Fatura Bilgileri</h3>
              <div className="space-y-1 text-sm">
                <p>Fatura No: {invoice.id}</p>
                <p>Tarih: {invoice.date}</p>
                <p>Son Ödeme: {invoice.dueDate}</p>
                <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                  {invoice.status === "paid" ? "Ödendi" : "Beklemede"}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Müşteri Bilgileri</h3>
              <div className="space-y-1 text-sm">
                <p>{invoice.customer.name}</p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.address}</p>
                <p>Vergi No: {invoice.customer.taxNumber}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Fatura Kalemleri</h3>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Açıklama</th>
                  <th className="px-6 py-3 text-right">Miktar</th>
                  <th className="px-6 py-3 text-right">Birim Fiyat</th>
                  <th className="px-6 py-3 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">₺{item.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">₺{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={3} className="px-6 py-4 text-right font-semibold">Ara Toplam</td>
                  <td className="px-6 py-4 text-right">₺{invoice.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-semibold">KDV (%18)</td>
                  <td className="px-6 py-4 text-right">₺{invoice.tax.toLocaleString()}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={3} className="px-6 py-4 text-right">Genel Toplam</td>
                  <td className="px-6 py-4 text-right">₺{invoice.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}