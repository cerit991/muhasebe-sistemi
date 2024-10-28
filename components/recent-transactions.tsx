"use client"

import { Avatar } from "@/components/ui/avatar"
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  number: string
  type: string
  total: number
  status: string
  customer: {
    name: string
    email?: string
  }
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://avatar.vercel.sh/${transaction.customer.name}`}
              alt={transaction.customer.name}
            />
            <AvatarFallback>
              {transaction.customer.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.customer.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.number}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium">
              ₺{transaction.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
              {transaction.status === 'paid' ? 'Ödendi' : 'Beklemede'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}