import Accounts from "./components/Accounts"

export default function App() {
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

      {/* THIS fills remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Accounts />
      </div>
    </div>
  )
}
