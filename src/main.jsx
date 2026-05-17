import React from "react";
import ReactDOM from "react-dom/client";
import ShopSphere from "../ShopSphere.jsx";
import AdminDashboard from "../ShopSphere_Admin.jsx";

const ADMIN_PIN = "bannu2003"; // 🔐 change this to your own PIN

function AdminGate() {
  const [pin, setPin] = React.useState("");
  const [authed, setAuthed] = React.useState(false);

  if (authed) return <AdminDashboard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, fontFamily: "'Segoe UI', sans-serif", background: "#0D0D1A" }}>
      <div style={{ background: "#16213E", border: "1px solid #2A2A4A", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🛍</div>
        <h2 style={{ color: "#fff", margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>ShopSphere</h2>
        <p style={{ color: "#9090AA", fontSize: 13, margin: "0 0 28px" }}>Admin Panel — Restricted Access</p>

        <input
          type="password"
          placeholder="Enter admin PIN"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              pin === ADMIN_PIN ? setAuthed(true) : alert("❌ Wrong PIN. Try again.");
            }
          }}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #2A2A4A", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 12, letterSpacing: 4, textAlign: "center" }}
        />

        <button
          onClick={() => pin === ADMIN_PIN ? setAuthed(true) : alert("❌ Wrong PIN. Try again.")}
          style={{ width: "100%", padding: "12px", background: "#FF6B35", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          🔐 Enter Admin Panel
        </button>

        <p style={{ color: "#9090AA", fontSize: 12, marginTop: 20 }}>
          <a href="/" style={{ color: "#FF6B35", textDecoration: "none" }}>← Back to Store</a>
        </p>
      </div>
    </div>
  );
}

const isAdmin = window.location.pathname === "/admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <AdminGate /> : <ShopSphere />}
  </React.StrictMode>
);
