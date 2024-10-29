"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, Users, FileSpreadsheet, Settings, BarChart, Package2, Calculator } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/dashboard">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/dashboard" && "bg-muted"
          )}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Panel
        </Button>
      </Link>
      <Link href="/invoices">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/invoices" && "bg-muted"
          )}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Faturalar
        </Button>
      </Link>
      <Link href="/customers">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/customers" && "bg-muted"
          )}
        >
          <Users className="mr-2 h-4 w-4" />
          Cari Hesaplar
        </Button>
      </Link>
      <Link href="/inventory">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/inventory" && "bg-muted"
          )}
        >
          <Package2 className="mr-2 h-4 w-4" />
          Stok
        </Button>
      </Link>
      <Link href="/ledger">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/ledger" && "bg-muted"
          )}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Hesap Defteri
        </Button>
      </Link>
      <Link href="/reports">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/reports" && "bg-muted"
          )}
        >
          <BarChart className="mr-2 h-4 w-4" />
          Raporlar
        </Button>
      </Link>
      <Link href="/menu-costs">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/menu-costs" && "bg-muted"
          )}
        >
          <Calculator className="mr-2 h-4 w-4" />
          Maliyet Analizi
        </Button>
      </Link>
      <Link href="/settings">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center",
            pathname === "/settings" && "bg-muted"
          )}
        >
          <Settings className="mr-2 h-4 w-4" />
          Ayarlar
        </Button>
      </Link>
    </nav>
  )
}