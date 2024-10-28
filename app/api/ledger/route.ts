import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Kayıtlar yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const entry = await prisma.ledgerEntry.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        paymentType: data.type === 'income' ? data.paymentType : null // Sadece gelir için ödeme türü
      }
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt eklenirken hata oluştu' }, { status: 500 })
  }
}