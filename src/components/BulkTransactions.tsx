import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import type { AccountBalance } from "../types"

type MultiTx = {
  account_id: string
  transaction_date: string
  type: "debit" | "credit"
  amount: number | ""
  description: string
}

type Props = {
  onTransactionAdded: () => void
}

export default function BulkTransactions({ onTransactionAdded }: Props) {
  const [accountsList, setAccountsList] = useState<AccountBalance[]>([])
  const today = new Date().toISOString().slice(0, 10)

  const emptyTx: MultiTx = {
    account_id: "",
    transaction_date: today,
    type: "debit",
    amount: "",
    description: ""
  }

  const [multiTxs, setMultiTxs] = useState<MultiTx[]>([emptyTx])

  useEffect(() => {
  async function fetchAccounts() {
    const { data, error } = await supabase.from("account_balances").select("*")
    if (!error && data) {
      setAccountsList(data)

      // ✅ Initialize the first transaction row with a valid account_id
      setMultiTxs([{ 
        account_id: data[0]?.id || "",   // <-- first account from the list
        transaction_date: today,
        type: "debit",
        amount: "",
        description: ""
      }])
    }
  }

  fetchAccounts()
}, [])


  function updateTx<K extends keyof MultiTx>(index: number, key: K, value: MultiTx[K]) {
    const copy = [...multiTxs]
    copy[index][key] = value
    setMultiTxs(copy)
  }

  function addRow() {
    setMultiTxs([...multiTxs, { ...emptyTx, account_id: accountsList[0]?.id || "" }])
  }

  function removeRow(index: number) {
    setMultiTxs(multiTxs.filter((_, i) => i !== index))
  }

  async function saveMultiTransactions() {
    const payload = multiTxs
      .filter(tx => tx.amount !== "" && tx.account_id)
      .map(tx => ({
        account_id: tx.account_id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        transaction_date: tx.transaction_date
      }))

    if (payload.length === 0) return

    const { error } = await supabase.from("transactions").insert(payload)
    if (error) {
      console.error("Bulk insert failed:", error)
      return
    }

    setMultiTxs([{ ...emptyTx, account_id: accountsList[0]?.id || "" }])
    onTransactionAdded()
  }

  return (
    <div>
      <h2>Bulk Transaction Entry</h2>

      {multiTxs.map((tx, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
          <select value={tx.account_id} onChange={e => updateTx(i, "account_id", e.target.value)} required>
            {accountsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <input type="date" value={tx.transaction_date} onChange={e => updateTx(i, "transaction_date", e.target.value)} required />

          <select value={tx.type} onChange={e => updateTx(i, "type", e.target.value as "debit" | "credit")}>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>

          <input type="number" placeholder="Amount" value={tx.amount} onChange={e => updateTx(i, "amount", Number(e.target.value))} required />

          <input placeholder="Description" value={tx.description} onChange={e => updateTx(i, "description", e.target.value)} />

          <button onClick={() => removeRow(i)} style={{ background: "#ff4d4f", color: "#fff", border: "none", cursor: "pointer" }}>❌</button>
        </div>
      ))}

      <div style={{ marginTop: "8px" }}>
        <button onClick={addRow}>➕ Add Row</button>
        <button onClick={saveMultiTransactions} style={{ marginLeft: "8px" }}>💾 Save All</button>
      </div>
    </div>
  )
}
