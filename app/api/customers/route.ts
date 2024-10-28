import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, taxNumber, phone, type } = await request.json()

    // Validation
    if (!name || !taxNumber || !phone || !type) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    // Generate a unique customer code
    const customerCount = await prisma.customer.count()
    const code = `CUS${(customerCount + 1).toString().padStart(4, '0')}`

    // Insert customer
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
    console.error('Müşteri kayıt hatası:', error)
    return NextResponse.json(
      { error: 'Müşteri kaydı yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Müşteri listesi alınırken hata:', error)
    return NextResponse.json(
      { error: 'Müşteri listesi alınamadı' },
      { status: 500 }
    )
  }
}