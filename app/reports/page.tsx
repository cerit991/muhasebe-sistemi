"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function ReportsPage() {
  const { fetchApi, loading } = useApi()
  const { toast } = useToast()
  const [period, setPeriod] = useState("monthly")
  const [data, setData] = useState({
    monthlyData: [],
    overview: {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      previousPeriodIncome: 0,
      previousPeriodExpense: 0
    },
    incomeByCategory: [],
    expenseByCategory: []
  })

  useEffect(() => {
    loadReportData()
  }, [period])

  const loadReportData = async () => {
    try {
      const response = await fetchApi(`reports?period=${period}`)
      setData(response)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Rapor verileri yüklenirken bir hata oluştu"
      })
    }
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periyot seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadReportData} disabled={loading}>
            {loading ? "Yükleniyor..." : "Rapor Oluştur"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="income">Gelir Analizi</TabsTrigger>
          <TabsTrigger value="expenses">Gider Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium">Toplam Gelir</h3>
              <div className="mt-2 text-2xl font-bold">
                ₺{data.overview.totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentageChange(
                  data.overview.totalIncome,
                  data.overview.previousPeriodIncome
                ).toFixed(1)}% geçen dönemden
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Toplam Gider</h3>
              <div className="mt-2 text-2xl font-bold">
                ₺{data.overview.totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentageChange(
                  data.overview.totalExpense,
                  data.overview.previousPeriodExpense
                ).toFixed(1)}% geçen dönemden
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Net Kar</h3>
              <div className="mt-2 text-2xl font-bold">
                ₺{data.overview.netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentageChange(
                  data.overview.netProfit,
                  data.overview.previousPeriodIncome - data.overview.previousPeriodExpense
                ).toFixed(1)}% geçen dönemden
              </p>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Aylık Gelir/Gider Grafiği</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="gelir" stroke="#8884d8" name="Gelir" />
                    <Line type="monotone" dataKey="gider" stroke="#82ca9d" name="Gider" />
                    <Line type="monotone" dataKey="kar" stroke="#ffc658" name="Kar" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Gelir Dağılımı</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.incomeByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.incomeByCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Gelir Detayları</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[400px]">
                  <h4 className="text-sm font-medium mb-4">Müşteri Bazlı Gelir Dağılımı</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.incomeByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.incomeByCategory.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[400px]">
                  <h4 className="text-sm font-medium mb-4">Aylık Gelir Trendi</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="gelir" name="Gelir" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Gider Detayları</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[400px]">
                  <h4 className="text-sm font-medium mb-4">Gider Kategorileri</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#82ca9d"
                        dataKey="value"
                      >
                        {data.expenseByCategory.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[400px]">
                  <h4 className="text-sm font-medium mb-4">Aylık Gider Trendi</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="gider" name="Gider" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}