import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET() {
  try {
    // Son 6 ayın verilerini al
    const today = new Date()
    const monthlyData = []
    
    for (let i = 0; i < 6; i++) {
      const currentMonth = subMonths(today, i)
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)

      // Gelirler (Satış faturaları)
      const income = await prisma.invoice.aggregate({
        where: {
          type: 'sale',
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          total: true
        }
      })

      // Giderler (Alış faturaları)
      const expense = await prisma.invoice.aggregate({
        where: {
          type: 'purchase',
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          total: true
        }
      })

      monthlyData.push({
        month: currentMonth.toLocaleString('tr-TR', { month: 'short' }),
        gelir: income._sum.total || 0,
        gider: expense._sum.total || 0,
        kar: (income._sum.total || 0) - (expense._sum.total || 0)
      })
    }

    // Genel istatistikler
    const currentMonthStart = startOfMonth(today)
    const lastMonthStart = startOfMonth(subMonths(today, 1))
    const lastMonthEnd = endOfMonth(subMonths(today, 1))

    // Bu ayki toplam gelir
    const currentMonthIncome = await prisma.invoice.aggregate({
      where: {
        type: 'sale',
        date: {
          gte: currentMonthStart
        }
      },
      _sum: {
        total: true
      }
    })

    // Geçen ayki toplam gelir
    const lastMonthIncome = await prisma.invoice.aggregate({
      where: {
        type: 'sale',
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      },
      _sum: {
        total: true
      }
    })

    // Bu ayki toplam gider
    const currentMonthExpense = await prisma.invoice.aggregate({
      where: {
        type: 'purchase',
        date: {
          gte: currentMonthStart
        }
      },
      _sum: {
        total: true
      }
    })

    // Geçen ayki toplam gider
    const lastMonthExpense = await prisma.invoice.aggregate({
      where: {
        type: 'purchase',
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      },
      _sum: {
        total: true
      }
    })

    // Toplam müşteri sayısı
    const totalCustomers = await prisma.customer.count()
    const lastMonthCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    })

    // Bekleyen faturalar
    const pendingInvoices = await prisma.invoice.count({
      where: {
        status: 'pending'
      }
    })

    // Son işlemler
    const recentTransactions = await prisma.invoice.findMany({
      take: 5,
      orderBy: {
        date: 'desc'
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json({
      monthlyData: monthlyData.reverse(),
      stats: {
        currentMonthIncome: currentMonthIncome._sum.total || 0,
        lastMonthIncome: lastMonthIncome._sum.total || 0,
        currentMonthExpense: currentMonthExpense._sum.total || 0,
        lastMonthExpense: lastMonthExpense._sum.total || 0,
        totalCustomers,
        lastMonthCustomers,
        pendingInvoices
      },
      recentTransactions
    })
  } catch (error) {
    console.error('Dashboard veri hatası:', error)
    return NextResponse.json(
      { error: 'Veriler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}