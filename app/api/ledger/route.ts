import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      include: {
        customer: {
          select: {
            name: true,
            code: true
          }
        }
      },
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
    const { date, type, category, description, amount, paymentType, customerId } = body

    if (!date || !type || !category || !description || !amount || !paymentType) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the ledger entry
      const entry = await tx.ledgerEntry.create({
        data: {
          date: new Date(date),
          type,
          category,
          description,
          amount: parseFloat(amount),
          paymentType,
          customerId: customerId || null
        },
        include: {
          customer: {
            select: {
              name: true,
              code: true
            }
          }
        }
      })

      // If a customer is specified, update their balance
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            balance: {
              // For expenses (payments to supplier), decrease balance
              // For income (payments from customer), increase balance
              [type === 'expense' ? 'decrement' : 'increment']: parseFloat(amount)
            }
          }
        })
      }

      return entry
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Ledger entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create ledger entry' },
      { status: 500 }
    )
  }
}