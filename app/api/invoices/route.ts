import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, invoiceDate, customerId, items, totals, invoiceNumber } = body

    if (!type || !invoiceDate || !customerId || !items || !totals || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // Fatura numarasının benzersiz olup olmadığını kontrol et
    const existingInvoice = await prisma.invoice.findUnique({
      where: { number: invoiceNumber }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Bu fatura numarası zaten kullanılmış' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          type,
          date: new Date(invoiceDate),
          customerId,
          subtotal: totals.subtotal,
          vatTotal: totals.vatTotal,
          total: totals.total,
          status: 'draft',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              vatRate: item.vatRate,
              discount: item.discount,
              total: item.total
            }))
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Update customer balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          balance: {
            // For purchases (supplier invoices), increase balance (we owe them money)
            // For sales (customer invoices), decrease balance (they owe us money)
            [type === 'purchase' ? 'increment' : 'decrement']: totals.total
          }
        }
      })

      // Handle inventory updates
      if (type === 'purchase') {
        // For purchases, update product prices and increase stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              price: item.price, // Update price from purchase invoice
              quantity: {
                increment: item.quantity // Increase stock
              }
            }
          })
        }
      } else {
        // For sales, just decrease stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      return invoice
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
