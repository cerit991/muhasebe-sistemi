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
    return NextResponse.json({ error: 'Faturalar yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Faturayı oluştur
    const invoice = await prisma.invoice.create({
      data: {
        number: data.invoiceNumber,
        type: data.type,
        date: new Date(data.invoiceDate),
        customerId: data.customerId,
        subtotal: data.totals.subtotal,
        vatTotal: data.totals.vatTotal,
        total: data.totals.total,
        status: 'draft',
        items: {
          create: data.items.map((item: any) => ({
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

    // Alış faturası ise ürün fiyatlarını güncelle
    if (data.type === 'purchase') {
      for (const item of data.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            price: item.price // Son alış fiyatını güncelle
          }
        })
      }
    }

    // Stok miktarlarını güncelle
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            [data.type === 'purchase' ? 'increment' : 'decrement']: item.quantity
          }
        }
      })
    }

    // Müşteri bakiyesini güncelle
    await prisma.customer.update({
      where: { id: data.customerId },
      data: {
        balance: {
          [data.type === 'sale' ? 'increment' : 'decrement']: data.totals.total
        }
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Fatura kayıt hatası:', error)
    return NextResponse.json({ error: 'Fatura kaydedilirken hata oluştu' }, { status: 500 })
  }
}