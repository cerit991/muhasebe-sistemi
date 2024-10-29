import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// Helper function to generate next invoice number
async function generateInvoiceNumber(type: 'sale' | 'purchase'): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const prefix = type === 'sale' ? 'INV' : 'PUR'
  
  // Get the last invoice for this type and month
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      type,
      number: {
        startsWith: `${prefix}${year}${month}`
      }
    },
    orderBy: {
      number: 'desc'
    }
  })

  let sequence = 1
  if (lastInvoice) {
    // Extract sequence number from last invoice
    const lastSequence = parseInt(lastInvoice.number.slice(-4))
    sequence = lastSequence + 1
  }

  // Format: INV/PUR + YYYYMM + 4-digit sequence
  return `${prefix}${year}${month}${sequence.toString().padStart(4, '0')}`
}

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
    const { type, invoiceDate, customerId, items, totals } = body

    if (!type || !invoiceDate || !customerId || !items || !totals) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber(type)

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: { invoice: { create: (arg0: { data: { number: string; type: any; date: Date; customerId: any; subtotal: any; vatTotal: any; total: any; status: string; items: { create: any } }; include: { customer: boolean; items: { include: { product: boolean } } } }) => any }; customer: { update: (arg0: { where: { id: any }; data: { balance: { [x: string]: any } } }) => any }; product: { update: (arg0: { where: { id: any } | { id: any }; data: { price: any; quantity: { increment: any } } | { quantity: { decrement: any } } }) => any } }) => {
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

      // Update customer balance based on invoice type
      await tx.customer.update({
        where: { id: customerId },
        data: {
          balance: {
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
              price: item.price,
              quantity: {
                increment: item.quantity
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
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}