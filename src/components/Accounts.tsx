import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import type { AccountBalance } from "../types"
import Transactions from "./Transactions"
import BulkTransactions from "./BulkTransactions.tsx"

export default function Accounts() {
    const [accounts, setAccounts] = useState<AccountBalance[]>([])
    const [selectedAccount, setSelectedAccount] = useState<AccountBalance | null>(null)

    const [showAddAccount, setShowAddAccount] = useState(false)
    const [newAccountName, setNewAccountName] = useState("")
    const [newAccountNumber, setNewAccountNumber] = useState("")


    useEffect(() => {
        fetchAccounts()
    }, [])

    async function fetchAccounts() {
        const { data, error } = await supabase
            .from("account_balances")
            .select("*")

        if (error) {
            console.error("Accounts error:", error)
            return
        }

        setAccounts(data ?? [])
    }

    async function addAccount(e: React.FormEvent) {
        e.preventDefault()

        if (!newAccountName || !newAccountNumber) return

        const { error } = await supabase.from("accounts").insert({
            name: newAccountName,
            account_number: newAccountNumber
        })

        if (error) {
            console.error("Add account failed:", error)
            return
        }

        setNewAccountName("")
        setNewAccountNumber("")
        setShowAddAccount(false)

        fetchAccounts() // refresh list
    }


    async function refreshBalances() {
        const { data, error } = await supabase
            .from("account_balances")
            .select("*")

        if (!error && data) {
            setAccounts(data)

            // keep selected account in sync
            if (selectedAccount) {
                const updated = data.find(a => a.id === selectedAccount.id)
                if (updated) setSelectedAccount(updated)
            }
        }
    }


    return (
        <div style={{ display: "flex", gap: "20px" }}>
            {/* Accounts List */}
            <div style={{ width: "260px" }}>
                <h3>Accounts</h3>

                <div style={{ marginBottom: "10px" }}>
                <button onClick={() => setShowAddAccount(!showAddAccount)}>
                    ➕ Add Account
                </button>
                </div>

                {showAddAccount && (
                <form onSubmit={addAccount} style={{ marginBottom: "15px" }}>
                    <input
                    placeholder="Account Name"
                    value={newAccountName}
                    onChange={e => setNewAccountName(e.target.value)}
                    required
                    />

                    <input
                    placeholder="Account Number"
                    value={newAccountNumber}
                    onChange={e => setNewAccountNumber(e.target.value)}
                    required
                    />

                    <div style={{ marginTop: "6px" }}>
                    <button type="submit">Save</button>
                    <button
                        type="button"
                        onClick={() => setShowAddAccount(false)}
                        style={{ marginLeft: "8px" }}
                    >
                        Cancel
                    </button>
                    </div>
                </form>
                )}

                {accounts.map(account => (
                    <div
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        style={{
                            padding: "10px",
                            marginBottom: "8px",
                            cursor: "pointer",
                            background:
                                selectedAccount?.id === account.id ? "#f2f2f2d0" : "#242424",
                            borderRadius: "4px"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{account.name}</strong>
                            <span
                                style={{
                                    color: account.balance < 0 ? "#ff4d4f" : "#4caf50",
                                    fontWeight: "bold"
                                }}
                            >
                                {Number(account.balance).toFixed(2)}
                            </span>
                        </div>

                        {account.description && (
                            <div style={{ fontSize: "12px", color: "#aaa" }}>
                                {account.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ flex: 1 }}>
                <h2>Account Transactions</h2>
                {selectedAccount ? (
                    <Transactions
                        account={selectedAccount}
                        onTransactionAdded={refreshBalances}
                    />
                ) : (
                    <p>Select an account to view transactions</p>
                )}

                <hr style={{ margin: "20px 0" }} />

                <BulkTransactions onTransactionAdded={refreshBalances} />
            </div>
        </div>
    )
}
