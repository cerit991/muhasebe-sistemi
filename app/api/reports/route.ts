import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

interface CustomerIncome {
  customerName: string
  total: string | number
}

interface IncomeDistributionItem {
  name: string
  value: number
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const startDate = subMonths(new Date(), 6)
    const endDate = new Date()

    // Gelir kategorileri analizi
    const incomeByCategory = await prisma.invoice.groupBy({
      by: ['type'],
      where: {
        type: 'sale',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      }
    })

    // Gider kategorileri analizi
    const expenseByCategory = await prisma.invoice.groupBy({
      by: ['type'],
      where: {
        type: 'purchase',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      }
    })

    // Aylık gelir/gider analizi
    const monthlyData = []
    let currentDate = startDate
    
    while (currentDate <= endDate) {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)

      // Gelirler
      const income = await prisma.invoice.aggregate({
        where: {
          type: 'sale',
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          total: true,
          vatTotal: true,
          subtotal: true
        }
      })

      // Giderler
      const expense = await prisma.invoice.aggregate({
        where: {
          type: 'purchase',
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          total: true,
          vatTotal: true,
          subtotal: true
        }
      })

      monthlyData.push({
        month: currentDate.toLocaleString('tr-TR', { month: 'short' }),
        gelir: income._sum.total || 0,
        gider: expense._sum.total || 0,
        kar: (income._sum.total || 0) - (expense._sum.total || 0)
      })

      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
    }

    // Genel istatistikler
    const totalIncome = await prisma.invoice.aggregate({
      where: {
        type: 'sale',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      }
    })

    const totalExpense = await prisma.invoice.aggregate({
      where: {
        type: 'purchase',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      }
    })

    const previousPeriodStart = subMonths(startDate, 6)
    const previousPeriodEnd = startDate

    const previousIncome = await prisma.invoice.aggregate({
      where: {
        type: 'sale',
        date: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      },
      _sum: {
        total: true
      }
    })

    const previousExpense = await prisma.invoice.aggregate({
      where: {
        type: 'purchase',
        date: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      },
      _sum: {
        total: true
      }
    })

    // Müşteri bazlı gelir dağılımı
    const incomeByCustomerRaw = await prisma.$queryRaw<CustomerIncome[]>`
      SELECT 
        c.name as customerName,
        SUM(i.total) as total
      FROM Invoice i
      JOIN Customer c ON i.customerId = c.id
      WHERE i.type = 'sale'
      AND i.date >= ${startDate}
      AND i.date <= ${endDate}
      GROUP BY c.id, c.name
    `

    const incomeByCustomer: IncomeDistributionItem[] = incomeByCustomerRaw.map((row: CustomerIncome) => ({
      name: row.customerName,
      value: Number(row.total)
    }))

    return NextResponse.json({
      monthlyData,
      overview: {
        totalIncome: totalIncome._sum.total || 0,
        totalExpense: totalExpense._sum.total || 0,
        netProfit: (totalIncome._sum.total || 0) - (totalExpense._sum.total || 0),
        previousPeriodIncome: previousIncome._sum.total || 0,
        previousPeriodExpense: previousExpense._sum.total || 0
      },
      incomeByCategory: incomeByCustomer,
      expenseByCategory: expenseByCategory.map((item: any) => ({
        name: item.type === 'purchase' ? 'Alışlar' : item.type,
        value: item._sum.total || 0
      }))
    })
  } catch (error) {
    console.error('Rapor verisi alınırken hata:', error)
    return NextResponse.json(
      { error: 'Rapor verileri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}