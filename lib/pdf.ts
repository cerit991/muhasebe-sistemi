import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Customer {
  code: string
  name: string
  type: string
  taxNumber: string
  phone: string
  balance: number
}

interface Transaction {
  date: string
  description: string
  type: string
  amount: number
  paymentType: string
  balance: number
}

export function generateCustomerStatement(customer: Customer, transactions: Transaction[]) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const today = format(new Date(), 'dd MMMM yyyy', { locale: tr })

  // Header
  doc.setFontSize(20)
  doc.text('Hesap Ekstresi', pageWidth / 2, 20, { align: 'center' })
  doc.setFontSize(10)
  doc.text(`Tarih: ${today}`, pageWidth - 20, 30, { align: 'right' })

  // Customer Info
  doc.setFontSize(12)
  doc.text('Cari Bilgileri', 20, 45)
  doc.setFontSize(10)
  doc.text([
    `Cari Adı: ${customer.name}`,
    `Cari Kodu: ${customer.code}`,
    `Vergi No: ${customer.taxNumber}`,
    `Telefon: ${customer.phone}`,
    `Tip: ${customer.type === 'customer' ? 'Müşteri' : 'Tedarikçi'}`,
    `Bakiye: ₺${customer.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  ], 20, 55)

  // Transactions Table
  autoTable(doc, {
    startY: 90,
    head: [[
      'Tarih',
      'Açıklama',
      'İşlem Türü',
      'Ödeme Şekli',
      'Tutar',
      'Bakiye'
    ]],
    body: transactions.map(t => [
      format(new Date(t.date), 'dd.MM.yyyy'),
      t.description,
      t.type === 'income' ? 'Tahsilat' : 'Ödeme',
      getPaymentTypeText(t.paymentType),
      `₺${t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      `₺${t.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [66, 66, 66]
    },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  return doc
}

function getPaymentTypeText(type: string): string {
  switch (type) {
    case 'cash':
      return 'Nakit'
    case 'credit_card':
      return 'Kredi Kartı'
    case 'bank_transfer':
      return 'Banka Transferi'
    case 'check':
      return 'Çek'
    case 'promissory_note':
      return 'Senet'
    default:
      return type
  }
}