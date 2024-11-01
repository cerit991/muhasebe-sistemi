import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Customer, Transaction } from '@/types/statement'

export async function generateCustomerStatement(customer: Customer, transactions: Transaction[]): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const today = format(new Date(), 'dd MMMM yyyy', { locale: tr })

  // Header
  doc.setFontSize(20)
  doc.text(customer.name, pageWidth / 2, 20, { align: 'center' })
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
    `Bakiye: ${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(customer.balance))} ₺ ${customer.balance >= 0 ? '(A)' : '(B)'}`
  ], 20, 55)

  // Transactions Table
  autoTable(doc, {
    startY: 90,
    head: [[
      'Tarih',
      'Fiş No',
      'Türü',
      'Belge No',
      'Açıklama',
      'Borç',
      'Alacak',
      'Bakiye'
    ]],
    body: transactions.map(t => [
      format(new Date(t.date), 'dd.MM.yyyy'),
      t.documentNo || '-',
      t.type === 'debit' ? 'Borç' : 'Alacak',
      t.documentNo || '-',
      t.description,
      t.type === 'debit' ? new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t.amount) : '-',
      t.type === 'credit' ? new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t.amount) : '-',
      `${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(t.balance))} ${t.balance >= 0 ? '(A)' : '(B)'}`
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [66, 66, 66]
    },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    }
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Return as blob
  return doc.output('blob')
}
