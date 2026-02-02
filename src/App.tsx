import { useState } from "react"
import Accounts from "./components/Accounts"
import TransactionsByDay from "./components/TransactionsByDay"

export default function App() {
  const [currentPage, setCurrentPage] = useState<"accounts" | "transactions-by-day">("accounts")

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        fontFamily: "Arial",
        paddingTop: 0,
        paddingBottom: 0,
        margin: "0 auto"
      }}
    >
      <h1 style={{ margin: "50px 0 20px 0" }}>MVAA Co-op Accounting</h1>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setCurrentPage("accounts")}
          style={{
            padding: "8px 16px",
            background: currentPage === "accounts" ? "#4caf50" : "#424242",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Accounts
        </button>
        <button
          onClick={() => setCurrentPage("transactions-by-day")}
          style={{
            padding: "8px 16px",
            background: currentPage === "transactions-by-day" ? "#4caf50" : "#424242",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          All Transactions
        </button>
      </div>

      {/* THIS fills remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {currentPage === "accounts" ? <Accounts /> : <TransactionsByDay />}
      </div>
    </div>
  )
}
