export type Account = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type Transaction = {
  id: string
  account_id: string
  amount: number
  type: "debit" | "credit"
  description: string | null
  transaction_date: string
  created_at: string
}

export type AccountBalance = {
  id: string
  name: string
  description: string | null
  balance: number
}

export type AccountRef = {
  id: string
  name: string
}
