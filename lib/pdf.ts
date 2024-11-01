import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Customer, Transaction } from '@/types/statement'

export function generateCustomerStatement(customer: Customer, transactions: Transaction[]) {
  const doc = new jsPDF('p', 'pt', 'a4')
  doc.addFont('Helvetica', 'Helvetica', 'normal')
  doc.setFont('Helvetica')
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const today = format(new Date(), 'dd.MM.yyyy', { locale: tr })

  // Header
  doc.setFontSize(10)
  doc.text(``, 250, 20, { align: 'center' })
  doc.text('', pageWidth - 50, 20)

  // Title
  doc.setFontSize(12)
  doc.text('Cari Hesap Ekstresi', pageWidth / 2.5, 35, { align: 'center' })

  // Customer Info
  doc.setFontSize(10)
  doc.text([
    `Cari      : ${customer.name}`,
    `Hesap Kodu : ${customer.code}`,
    `Telefon    : ${customer.phone}`,
    `VKN       : ${customer.taxNumber}`,
    `Tipi      : ${customer.type === 'customer' ? 'Müşteri' : 'Tedarikçi'}`
  ], 20, 45)

  // Date Range
  doc.text([
    `ilk : ${format(new Date(transactions[transactions.length - 1].date), 'dd.MM.yyyy', { locale: tr })}`,
    `son: ${format(new Date(transactions[0].date), 'dd.MM.yyyy', { locale: tr })}`,
  ], pageWidth - 75, 23)

  // Calculate totals
  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  // Transactions Table
  autoTable(doc, {
    startY: 100,
    head: [[
      'Tarih',
      'Fis No',
      'Türü',
      'Belge No',
      'Açıklama',
      'Borç',
      'Alacak',
      'Bakiye'
    ]],
    body: transactions.map(t => [
      format(new Date(t.date), 'dd.MM.yyyy', { locale: tr }),
      t.documentNo || '-',
      t.type === 'debit' ? 'Borç' : 'Alacak',
      t.documentNo || '-',
      t.description,
      t.type === 'debit' ? `${t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '',
      t.type === 'credit' ? `${t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '',
      `${Math.abs(t.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${t.balance >= 0 ? '(A)' : '(B)'}`
    ]),
    styles: {
      font: 'Helvetica',
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center' }, // Tarih
      1: { halign: 'center' }, // Fiş No
      2: { halign: 'center' }, // Türü
      3: { halign: 'center' }, // Belge No
      4: { halign: 'left' },   // Açıklama
      5: { halign: 'right' },  // Borç
      6: { halign: 'right' },  // Alacak
      7: { halign: 'right' }   // Bakiye
    },
    theme: 'grid',
    didParseCell: function(data) {
      if (data.section === 'head') {
        data.cell.styles.halign = 'center'
      }
    }
  })

  // Footer with totals
  const finalY = (doc as any).lastAutoTable.finalY || 90
  doc.setFontSize(8)

  // Left aligned labels
  doc.text([
    `Listelenen: ${transactions.length}`,
  ], 20, finalY + 20)

  // Right aligned totals with labels
  const totalsY = finalY + 20
  const totalsX = pageWidth - 20

  // Borç column totals
  doc.text([
    `${totalDebit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
  ], pageWidth - 150, totalsY, { align: 'right' })

  // Alacak column totals
  doc.text([
    `${totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
  ], pageWidth - 105, totalsY, { align: 'right' })

  // Bakiye column totals
  doc.text([
    `${Math.abs(customer.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${customer.balance >= 0 ? '(A)' : '(B)'}`,
  ], pageWidth - 40, totalsY, { align: 'right' })

  return doc
}
