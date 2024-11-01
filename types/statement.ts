export interface Customer {
    code: string
    name: string
    type: string
    taxNumber: string
    phone: string
    balance: number
  }
  
  export interface Transaction {
    id: string
    date: string
    description: string
    type: 'debit' | 'credit'
    amount: number
    documentType: 'invoice' | 'ledger'
    documentNo: string | null
    paymentType: string | null
    balance: number
  }
