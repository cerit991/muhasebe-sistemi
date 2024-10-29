import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Ledger entries fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ledger entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, type, category, description, amount, paymentType } = body

    if (!date || !type || !category || !description || !amount) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const entry = await prisma.ledgerEntry.create({
      data: {
        date: new Date(date),
        type,
        category,
        description,
        amount: parseFloat(amount),
        paymentType: type === 'income' ? paymentType : null
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Ledger entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create ledger entry' },
      { status: 500 }
    )
  }
}