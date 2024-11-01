import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verileri createdAt'e göre sıralı şekilde çek
    const [invoices, ledgerEntries] = await Promise.all([
      prisma.invoice.findMany({
        where: { customerId: params.id },
        orderBy: { createdAt: 'asc' } // Oluşturulma sırasına göre
      }),
      prisma.ledgerEntry.findMany({
        where: { customerId: params.id },
        orderBy: { createdAt: 'asc' } // Oluşturulma sırasına göre
      })
    ])

    // Tüm işlemleri tek dizide birleştir
    const transactions = []

    // Her iki diziyi createdAt'e göre sıralı birleştir
    let invoiceIndex = 0
    let ledgerIndex = 0

    while (invoiceIndex < invoices.length || ledgerIndex < ledgerEntries.length) {
      const nextInvoice = invoices[invoiceIndex]
      const nextLedger = ledgerEntries[ledgerIndex]

      // Hangi işlemin daha önce oluşturulduğunu kontrol et
      if (
        !nextLedger ||
        (nextInvoice && 
         new Date(nextInvoice.createdAt) <= new Date(nextLedger.createdAt))
      ) {
        // Fatura işlemini ekle
        transactions.push({
          id: nextInvoice.id,
          date: nextInvoice.date,
          createdAt: nextInvoice.createdAt,
          description: `Fatura: ${nextInvoice.number}`,
          type: nextInvoice.type === 'sale' ? 'debit' : 'credit',
          amount: nextInvoice.total,
          documentType: 'invoice',
          documentNo: nextInvoice.number,
          paymentType: null,
          balance: 0
        })
        invoiceIndex++
      } else {
        // Ledger işlemini ekle
        transactions.push({
          id: nextLedger.id,
          date: nextLedger.date,
          createdAt: nextLedger.createdAt,
          description: nextLedger.description,
          type: nextLedger.type === 'income' ? 'credit' : 'debit',
          amount: nextLedger.amount,
          documentType: 'ledger',
          documentNo: null,
          paymentType: nextLedger.paymentType,
          balance: 0
        })
        ledgerIndex++
      }
    }

    // İşlemler zaten createdAt'e göre sıralı geldiği için
    // ekstra sıralama yapmaya gerek yok

    // Bakiyeleri hesapla
    let runningBalance = 0
    for (const transaction of transactions) {
      if (transaction.type === 'debit') {
        runningBalance -= transaction.amount
      } else {
        runningBalance += transaction.amount
      }
      transaction.balance = runningBalance
    }

    // createdAt'i API yanıtından çıkar
    const cleanTransactions = transactions.map(({ createdAt, ...rest }) => ({
      ...rest,
      date: new Date(rest.date).toISOString()
    }))

    return NextResponse.json({
      customer,
      transactions: cleanTransactions
    })
  } catch (error) {
    console.error('Customer statement fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer statement' },
      { status: 500 }
    )
  }
}
