import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: 'Müşteriler yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const customer = await prisma.customer.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        taxNumber: data.taxNumber,
        phone: data.phone,
        email: data.email,
        address: data.address
      }
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Müşteri kaydedilirken hata oluştu' }, { status: 500 })
  }
}