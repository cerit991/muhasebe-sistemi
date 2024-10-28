"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()
  const [data, setData] = useState({
    monthlyData: [],
    stats: {
      currentMonthIncome: 0,
      lastMonthIncome: 0,
      currentMonthExpense: 0,
      lastMonthExpense: 0,
      totalCustomers: 0,
      lastMonthCustomers: 0,
      pendingInvoices: 0
    },
    recentTransactions: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetchApi('dashboard')
      setData(response)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Dashboard verileri yüklenirken bir hata oluştu"
      })
    }
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium">Toplam Gelir</h3>
          <div className="mt-2 text-2xl font-bold">
            ₺{data.stats.currentMonthIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            {calculatePercentageChange(
              data.stats.currentMonthIncome,
              data.stats.lastMonthIncome
            ).toFixed(1)}% geçen aydan
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Toplam Gider</h3>
          <div className="mt-2 text-2xl font-bold">
            ₺{data.stats.currentMonthExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            {calculatePercentageChange(
              data.stats.currentMonthExpense,
              data.stats.lastMonthExpense
            ).toFixed(1)}% geçen aydan
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Toplam Müşteri</h3>
          <div className="mt-2 text-2xl font-bold">+{data.stats.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            +{data.stats.lastMonthCustomers} geçen aydan
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium">Bekleyen Faturalar</h3>
          <div className="mt-2 text-2xl font-bold">{data.stats.pendingInvoices}</div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Gelir/Gider Grafiği</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                  <Line type="monotone" dataKey="gelir" name="Gelir" stroke="#8884d8" />
                  <Line type="monotone" dataKey="gider" name="Gider" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="kar" name="Kar" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="p-6">
            <h3 className="text-lg font-medium">Son İşlemler</h3>
            <RecentTransactions transactions={data.recentTransactions} />
          </div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <div className="p-6">
            <h3 className="text-lg font-medium">Genel Bakış</h3>
            <Overview data={data.monthlyData} />
          </div>
        </Card>
      </div>
    </div>
  )
}