import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, unit, vatRate } = body

    if (!name || !unit || !vatRate) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const productCount = await prisma.product.count()
    const code = `PRD${(productCount + 1).toString().padStart(4, '0')}`

    const product = await prisma.product.create({
      data: {
        code,
        name,
        unit,
        price: 0,
        vatRate: parseFloat(vatRate),
        quantity: 0,
        minQuantity: 0,
        category: "Genel"
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}