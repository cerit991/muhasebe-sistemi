import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }

    let data

    switch (path) {
      case 'customers':
        data = await prisma.customer.findMany({
          orderBy: { createdAt: 'desc' }
        })
        break

      case 'products':
        data = await prisma.product.findMany({
          orderBy: { createdAt: 'desc' }
        })
        break

      case 'invoices':
        data = await prisma.invoice.findMany({
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
        break

      case 'ledger':
        data = await prisma.ledgerEntry.findMany({
          orderBy: { date: 'desc' }
        })
        break

      case 'settings':
        data = await prisma.settings.findFirst()
        break

      default:
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const body = await request.json()

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }

    let data

    switch (path) {
      case 'customers':
        data = await prisma.customer.create({
          data: {
            code: `CUS${(await prisma.customer.count() + 1).toString().padStart(4, '0')}`,
            name: body.name,
            taxNumber: body.taxNumber,
            phone: body.phone,
            type: body.type,
            balance: 0
          }
        })
        break

      case 'products':
        data = await prisma.product.create({
          data: {
            code: `PRD${(await prisma.product.count() + 1).toString().padStart(4, '0')}`,
            name: body.name,
            unit: body.unit,
            price: 0,
            vatRate: parseFloat(body.vatRate),
            quantity: 0,
            minQuantity: 0,
            category: "Genel"
          }
        })
        break

      case 'invoices':
        data = await prisma.invoice.create({
          data: {
            number: body.invoiceNumber,
            type: body.type,
            date: new Date(body.invoiceDate),
            customerId: body.customerId,
            subtotal: body.totals.subtotal,
            vatTotal: body.totals.vatTotal,
            total: body.totals.total,
            status: 'draft',
            items: {
              create: body.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                vatRate: item.vatRate,
                discount: item.discount,
                total: item.total
              }))
            }
          }
        })
        break

      case 'ledger':
        data = await prisma.ledgerEntry.create({
          data: {
            date: new Date(body.date),
            type: body.type,
            category: body.category,
            description: body.description,
            amount: parseFloat(body.amount),
            paymentType: body.type === 'income' ? body.paymentType : null
          }
        })
        break

      case 'settings':
        const existingSettings = await prisma.settings.findFirst()
        if (existingSettings) {
          data = await prisma.settings.update({
            where: { id: existingSettings.id },
            data: body
          })
        } else {
          data = await prisma.settings.create({
            data: body
          })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}