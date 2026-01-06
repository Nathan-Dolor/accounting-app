import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { supabase } from "../supabaseClient"
import type { AccountRef, Transaction } from "../types"

type Props = {
  account: AccountRef
  onTransactionAdded: () => void
}

export default function Transactions({ account, onTransactionAdded }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState<number | "">("")
  const [type, setType] = useState<"debit" | "credit">("debit")
  const [description, setDescription] = useState<string>("")
  const today = new Date().toISOString().slice(0, 10)
  const [transactionDate, setTransactionDate] = useState<string>(today)


  useEffect(() => {
    fetchTransactions()
  }, [account.id])

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("account_id", account.id)
      .order("transaction_date", { ascending: false })

    if (!error && data) {
      setTransactions(data)
    }
  }

  async function addTransaction(e: FormEvent) {
    e.preventDefault()

    if (amount === "") return

    await supabase.from("transactions").insert({
      account_id: account.id,
      amount,
      type,
      description,
      transaction_date: transactionDate
    })

    setAmount("")
    setDescription("")
    
    fetchTransactions()
    onTransactionAdded()
  }

  async function deleteTransaction(transactionId: string) {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this transaction?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)

    if (error) {
        console.error("Delete failed:", error)
        return
    }

    fetchTransactions()
    onTransactionAdded()
}


  return (
    <div>
      <h2>{account.name} acc#: {account.account_number}</h2>

      {/* Add Transaction */}
      <form onSubmit={addTransaction} style={{ marginBottom: "15px" }}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          required
        />

        <select
          value={type}
          onChange={e => setType(e.target.value as "debit" | "credit")}
        >
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={transactionDate}
          onChange={e => setTransactionDate(e.target.value)}
          required
        />


        <button type="submit">Add</button>
      </form>

      {/* Transactions Table */}
      <table width="100%" cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2d0" }}>
            <th align="left">Date</th>
            <th align="left">Type</th>
            <th align="right">Amount</th>
            <th align="left">Description</th>
            <th align="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.transaction_date}</td>
              <td>{tx.type}</td>
              <td align="right">{tx.amount.toFixed(2)}</td>
              <td>{tx.description}</td>
              <td align="center">
                <button
                    onClick={() => deleteTransaction(tx.id)}
                    style={{
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer"
                    }}
                >
                    Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
