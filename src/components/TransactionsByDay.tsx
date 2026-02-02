import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import type { Transaction, Account } from "../types"

export default function TransactionsByDay() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accountMap, setAccountMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Fetch accounts
    const { data: accountsData, error: accountsError } = await supabase
      .from("accounts")
      .select("*")

    if (!accountsError && accountsData) {
      const map: Record<string, string> = {}
      accountsData.forEach((account: Account) => {
        map[account.id] = account.name
      })
      setAccountMap(map)
    }

    // Fetch transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })

    if (!transactionsError && transactionsData) {
      setTransactions(transactionsData)
    }
    setLoading(false)
  }

  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, tx) => {
    const date = tx.transaction_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(tx)
    return acc
  }, {} as Record<string, Transaction[]>)

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedByDate).sort().reverse()

  if (loading) {
    return <div>Loading transactions...</div>
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Transactions by Day</h2>
      
      {sortedDates.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <div>
          {sortedDates.map(date => {
            const dayTransactions = groupedByDate[date]
            const dayTotal = dayTransactions.reduce((sum, tx) => {
              return sum + (tx.type === "debit" ? tx.amount : -tx.amount)
            }, 0)

            return (
              <div
                key={date}
                style={{
                  marginBottom: "20px",
                  border: "1px solid #444",
                  borderRadius: "6px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    background: "#f2f2f2d0",
                    padding: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h3 style={{ margin: "0" }}>
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </h3>
                  <span
                    style={{
                      color: dayTotal >= 0 ? "#4caf50" : "#ff4d4f",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}
                  >
                    {dayTotal.toFixed(2)}
                  </span>
                </div>

                <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#2a2a2a" }}>
                      <th align="left" style={{ padding: "8px 12px" }}>
                        Account
                      </th>
                      <th align="left" style={{ padding: "8px 12px" }}>
                        Type
                      </th>
                      <th align="right" style={{ padding: "8px 12px" }}>
                        Amount
                      </th>
                      <th align="left" style={{ padding: "8px 12px" }}>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid #444" }}>
                        <td style={{ padding: "8px 12px" }}>{accountMap[tx.account_id] || tx.account_id}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background:
                                tx.type === "debit" ? "#4caf50" : "#ff9800",
                              color: "#fff",
                              fontSize: "12px"
                            }}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td align="right" style={{ padding: "8px 12px" }}>
                          {tx.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: "8px 12px" }}>{tx.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
