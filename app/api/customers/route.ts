import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, taxNumber, phone, type } = body

    if (!name || !taxNumber || !phone || !type) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const customerCount = await prisma.customer.count()
    const code = `CUS${(customerCount + 1).toString().padStart(4, '0')}`

    const customer = await prisma.customer.create({
      data: {
        code,
        name,
        taxNumber,
        phone,
        type,
        balance: 0
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}