import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch customer details
    const customer = await prisma.customer.findUnique({
      where: { id: params.id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Fetch all transactions for this customer
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { customerId: params.id },
      orderBy: { date: 'asc' }
    })

    // Calculate running balance for each transaction
    let runningBalance = 0
    const transactions = ledgerEntries.map((entry: { type: string; amount: number; id: any; date: any; description: any; paymentType: any }) => {
      // For income (customer paying us), increase balance
      // For expense (us paying supplier), decrease balance
      const amount = entry.type === 'income' ? entry.amount : -entry.amount
      runningBalance += amount

      return {
        id: entry.id,
        date: entry.date,
        description: entry.description,
        type: entry.type,
        amount: entry.amount,
        paymentType: entry.paymentType,
        balance: runningBalance
      }
    })

    return NextResponse.json({
      customer: {
        code: customer.code,
        name: customer.name,
        type: customer.type,
        taxNumber: customer.taxNumber,
        phone: customer.phone,
        balance: customer.balance
      },
      transactions
    })
  } catch (error) {
    console.error('Customer statement fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer statement' },
      { status: 500 }
    )
  }
}