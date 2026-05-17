import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#FF6B35",
  primaryDark: "#E55A25",
  secondary: "#1A1A2E",
  success: "#00C853",
  danger: "#FF3B30",
  info: "#0A84FF",
  warning: "#FF9500",
  dark: "#0D0D1A",
  darkCard: "#16213E",
  darkBorder: "#2A2A4A",
  lightBg: "#F8F9FF",
  lightCard: "#FFFFFF",
  lightBorder: "#E8EAFF",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1,  name: "iPhone 15 Pro Max 256GB",          category: "Mobiles",     price: 134900, rating: 4.8, reviews: 12840, image: "📱", brand: "Apple",       inStock: true  },
  { id: 2,  name: "Sony WH-1000XM5 Headphones",       category: "Electronics", price: 24990,  rating: 4.7, reviews: 8920,  image: "🎧", brand: "Sony",        inStock: true  },
  { id: 3,  name: "MacBook Air M3 13\" 16GB",          category: "Laptops",     price: 114900, rating: 4.9, reviews: 5640,  image: "💻", brand: "Apple",       inStock: true  },
  { id: 4,  name: "Samsung 65\" QLED 4K Smart TV",     category: "Electronics", price: 89990,  rating: 4.6, reviews: 3210,  image: "📺", brand: "Samsung",     inStock: true  },
  { id: 5,  name: "Nike Air Max 270 Running Shoes",    category: "Fashion",     price: 8995,   rating: 4.5, reviews: 15620, image: "👟", brand: "Nike",        inStock: true  },
  { id: 6,  name: "Dyson V15 Detect Vacuum",           category: "Home",        price: 52900,  rating: 4.7, reviews: 2890,  image: "🌀", brand: "Dyson",       inStock: false },
  { id: 7,  name: "iPad Pro 12.9\" M4 Wi-Fi 256GB",    category: "Electronics", price: 119900, rating: 4.8, reviews: 4520,  image: "📱", brand: "Apple",       inStock: true  },
  { id: 8,  name: "Levi's 511 Slim Fit Jeans",         category: "Fashion",     price: 2499,   rating: 4.4, reviews: 28900, image: "👖", brand: "Levi's",      inStock: true  },
  { id: 9,  name: "DJI Mini 4 Pro Drone",              category: "Drones",      price: 74900,  rating: 4.9, reviews: 1240,  image: "🚁", brand: "DJI",         inStock: true  },
  { id: 10, name: "Instant Pot Duo 7-in-1",            category: "Home",        price: 6999,   rating: 4.6, reviews: 42100, image: "🍲", brand: "Instant Pot", inStock: true  },
];

const ORDERS = [
  { id: "#ORD-2024-001", date: "12 Jan 2024", status: "Delivered",  items: 3, total: 45990, product: "Bosch Washing Machine" },
  { id: "#ORD-2024-002", date: "28 Jan 2024", status: "Shipped",    items: 1, total: 24990, product: "Sony Headphones"       },
  { id: "#ORD-2024-003", date: "5 Feb 2024",  status: "Processing", items: 2, total: 12498, product: "Nike + Adidas Shoes"   },
];

const BANNERS = [
  { id: 1, title: "Mega Sale",     subtitle: "Up to 70% OFF on Electronics",      bg: "linear-gradient(135deg, #FF6B35 0%, #FF3B30 50%, #1A1A2E 100%)" },
  { id: 2, title: "New Arrivals",  subtitle: "iPhone 15 & Galaxy S24 Series",      bg: "linear-gradient(135deg, #0A84FF 0%, #1A1A2E 60%, #0D0D1A 100%)" },
  { id: 3, title: "Fashion Week",  subtitle: "Top Brands, Unbeatable Prices",      bg: "linear-gradient(135deg, #E91E63 0%, #9C27B0 60%, #1A1A2E 100%)" },
];

const ADMIN_STATS = [
  { label: "Total Revenue", value: "₹84.2L", change: "+12.5%", up: true,  icon: "💰" },
  { label: "Orders Today",  value: "2,847",  change: "+8.3%",  up: true,  icon: "📦" },
  { label: "Active Users",  value: "148K",   change: "+22.1%", up: true,  icon: "👥" },
  { label: "Return Rate",   value: "3.2%",   change: "-0.8%",  up: false, icon: "↩️" },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ text, type = "primary" }) {
  const colors = {
    primary: { bg: "#FF6B35", text: "#fff" },
    success:  { bg: "#00C853", text: "#fff" },
    info:     { bg: "#0A84FF", text: "#fff" },
    warning:  { bg: "#FF9500", text: "#fff" },
    danger:   { bg: "#FF3B30", text: "#fff" },
  };
  const c = colors[type] || colors.primary;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Courier New', monospace", whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab]           = useState("overview");
  const [darkMode, setDarkMode] = useState(false);

  // Theme tokens
  const bg          = darkMode ? COLORS.dark      : COLORS.lightBg;
  const textColor   = darkMode ? "#E8E8F0"        : "#1A1A2E";
  const mutedColor  = darkMode ? "#9090AA"        : "#666";
  const cardBg      = darkMode ? COLORS.darkCard  : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder: COLORS.lightBorder;

  const tabs = [
    ["overview",  "📊", "Overview"],
    ["products",  "🛍", "Products"],
    ["orders",    "📦", "Orders"],
    ["users",     "👥", "Users"],
    ["analytics", "📈", "Analytics"],
    ["banners",   "🖼", "Banners"],
    ["coupons",   "🎫", "Coupons"],
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: bg, minHeight: "100vh", display: "grid", gridTemplateColumns: "220px 1fr" }}>

      {/* ── Sidebar ── */}
      <div style={{ background: COLORS.secondary, padding: "24px 16px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 22 }}>🛍</span>
          <div>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0 }}>ShopSphere</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: 0 }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1 }}>
          {tabs.map(([key, icon, label]) => (
            <div key={key} onClick={() => setTab(key)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: tab === key ? "rgba(255,107,53,0.2)" : "transparent", color: tab === key ? COLORS.primary : "rgba(255,255,255,0.6)", fontWeight: tab === key ? 700 : 400, fontSize: 14, transition: "all 0.15s" }}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div onClick={() => setDarkMode(!darkMode)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 4 }}>
            <span>{darkMode ? "☀️" : "🌙"}</span> {darkMode ? "Light Mode" : "Dark Mode"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            <span>🏠</span> Back to Store
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding: "28px 28px", overflowY: "auto" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ color: textColor, fontWeight: 800, margin: 0, fontSize: 24 }}>Dashboard Overview</h2>
                <p style={{ color: mutedColor, fontSize: 13, margin: "4px 0 0" }}>Welcome back! Here's what's happening today.</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Today", "7 Days", "30 Days"].map((t, i) => (
                  <button key={t} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${borderColor}`, background: i === 1 ? COLORS.primary : "transparent", color: i === 1 ? "#fff" : mutedColor, cursor: "pointer", fontSize: 13, fontWeight: i === 1 ? 600 : 400 }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {ADMIN_STATS.map((stat) => (
                <div key={stat.label} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 20, boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <p style={{ color: mutedColor, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{stat.label}</p>
                    <span style={{ fontSize: 24 }}>{stat.icon}</span>
                  </div>
                  <p style={{ color: textColor, fontSize: 28, fontWeight: 800, margin: "0 0 6px" }}>{stat.value}</p>
                  <span style={{ fontSize: 12, color: stat.up ? COLORS.success : COLORS.danger, fontWeight: 600 }}>
                    {stat.up ? "▲" : "▼"} {stat.change} vs last period
                  </span>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ color: textColor, margin: 0, fontWeight: 700 }}>Revenue Overview</h3>
                <span style={{ color: COLORS.success, fontSize: 13, fontWeight: 600 }}>▲ ₹84.2L this year</span>
              </div>
              <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 4px" }}>
                {[65, 80, 55, 90, 72, 95, 85, 110, 78, 120, 88, 130].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", background: i === 11 ? COLORS.primary : (darkMode ? "rgba(255,107,53,0.35)" : "rgba(255,107,53,0.2)"), borderRadius: "4px 4px 0 0", height: `${(h / 130) * 100}%`, transition: "height 0.5s", cursor: "pointer", border: i === 11 ? "none" : `1px solid rgba(255,107,53,0.3)` }} />
                    <span style={{ fontSize: 10, color: mutedColor }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24, boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: textColor, margin: 0, fontWeight: 700 }}>Recent Orders</h3>
                <button style={{ background: "none", border: `1px solid ${borderColor}`, color: COLORS.primary, padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>View All</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "#F8F9FF" }}>
                    {["Order ID", "Product", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: mutedColor, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((order) => (
                    <tr key={order.id} style={{ borderTop: `1px solid ${borderColor}` }}>
                      <td style={{ padding: "12px 14px", color: COLORS.primary, fontSize: 13, fontWeight: 600 }}>{order.id}</td>
                      <td style={{ padding: "12px 14px", color: textColor, fontSize: 13 }}>{order.product}</td>
                      <td style={{ padding: "12px 14px", color: textColor, fontSize: 13, fontWeight: 600 }}>{fmt(order.total)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge text={order.status} type={order.status === "Delivered" ? "success" : order.status === "Shipped" ? "info" : "warning"} />
                      </td>
                      <td style={{ padding: "12px 14px", color: mutedColor, fontSize: 12 }}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ color: textColor, fontWeight: 800, margin: 0, fontSize: 24 }}>Product Management</h2>
                <p style={{ color: mutedColor, fontSize: 13, margin: "4px 0 0" }}>{PRODUCTS.length} products total</p>
              </div>
              <button style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Add Product</button>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <input placeholder="Search products..." style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#F8F9FF", color: textColor, fontSize: 13, outline: "none" }} />
              <select style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? COLORS.darkCard : "#fff", color: textColor, fontSize: 13, cursor: "pointer" }}>
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
              </select>
              <select style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? COLORS.darkCard : "#fff", color: textColor, fontSize: 13, cursor: "pointer" }}>
                <option>All Stock</option>
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, overflow: "hidden", boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "#F8F9FF" }}>
                    {["Product", "Category", "Price", "Stock", "Rating", "Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: mutedColor, fontSize: 11, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p) => (
                    <tr key={p.id} style={{ borderTop: `1px solid ${borderColor}`, transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.02)" : "#FAFBFF"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 40, height: 40, background: darkMode ? "rgba(255,255,255,0.05)" : "#F0F2FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{p.image}</div>
                          <div>
                            <p style={{ color: textColor, fontSize: 13, fontWeight: 600, margin: 0 }}>{p.name.length > 32 ? p.name.slice(0, 32) + "…" : p.name}</p>
                            <p style={{ color: mutedColor, fontSize: 11, margin: "2px 0 0" }}>{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: mutedColor, fontSize: 13 }}>{p.category}</td>
                      <td style={{ padding: "12px 16px", color: COLORS.primary, fontSize: 13, fontWeight: 700 }}>{fmt(p.price)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge text={p.inStock ? "In Stock" : "Out of Stock"} type={p.inStock ? "success" : "danger"} />
                      </td>
                      <td style={{ padding: "12px 16px", color: "#FFD700", fontSize: 13, fontWeight: 600 }}>{p.rating} ★</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ background: "rgba(10,132,255,0.1)", border: "none", color: COLORS.info, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                          <button style={{ background: "rgba(255,59,48,0.1)", border: "none", color: COLORS.danger, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div>
            <h2 style={{ color: textColor, fontWeight: 800, marginBottom: 24, fontSize: 24 }}>Analytics & Reports</h2>

            {/* Top row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              {[["Total Sales", "₹84.2L", "+12.5%", true, "💹"], ["Conversion", "3.8%", "+0.4%", true, "🎯"], ["Avg. Order", "₹4,820", "+6.2%", true, "🧾"], ["Refund Rate", "3.2%", "-0.8%", false, "↩️"]].map(([label, val, chg, up, icon]) => (
                <div key={label} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: 18, boxShadow: darkMode ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <p style={{ color: mutedColor, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{label}</p>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                  </div>
                  <p style={{ color: textColor, fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>{val}</p>
                  <span style={{ fontSize: 12, color: up ? COLORS.success : COLORS.danger, fontWeight: 600 }}>{up ? "▲" : "▼"} {chg}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Top Categories */}
              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24, boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: textColor, marginBottom: 20, margin: "0 0 20px", fontWeight: 700 }}>Top Categories by Revenue</h3>
                {[["Electronics", 34, COLORS.primary], ["Fashion", 22, "#FF69B4"], ["Mobiles", 18, COLORS.success], ["Laptops", 14, COLORS.info], ["Home", 12, "#FFD700"]].map(([cat, pct, color]) => (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: textColor, fontSize: 13 }}>{cat}</span>
                      <span style={{ color, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: darkMode ? "rgba(255,255,255,0.05)" : "#F0F0F5", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Best Selling Products */}
              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24, boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: textColor, margin: "0 0 20px", fontWeight: 700 }}>Best Selling Products</h3>
                {[...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 5).map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ color: i < 3 ? COLORS.primary : mutedColor, fontWeight: 700, width: 20, fontSize: 14, flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{ fontSize: 24 }}>{p.image}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: textColor, fontSize: 12, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <p style={{ color: mutedColor, fontSize: 11, margin: "2px 0 0" }}>{p.reviews.toLocaleString()} reviews</p>
                    </div>
                    <span style={{ color: COLORS.primary, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{fmt(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BANNERS ── */}
        {tab === "banners" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ color: textColor, fontWeight: 800, margin: 0, fontSize: 24 }}>Banner Management</h2>
                <p style={{ color: mutedColor, fontSize: 13, margin: "4px 0 0" }}>Manage homepage and promotional banners</p>
              </div>
              <button style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Create Banner</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {BANNERS.map((b) => (
                <div key={b.id} style={{ background: b.bg, borderRadius: 16, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>{b.title}</p>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0 }}>{b.subtitle}</p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>✏️ Edit</button>
                    <button style={{ background: "rgba(255,59,48,0.3)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,59,48,0.4)", color: "#fff", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COUPONS ── */}
        {tab === "coupons" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ color: textColor, fontWeight: 800, margin: 0, fontSize: 24 }}>Coupon Management</h2>
                <p style={{ color: mutedColor, fontSize: 13, margin: "4px 0 0" }}>Create and manage discount coupons</p>
              </div>
              <button style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Create Coupon</button>
            </div>
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, overflow: "hidden", boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "#F8F9FF" }}>
                    {["Code", "Discount", "Type", "Usage", "Valid Until", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: mutedColor, fontSize: 11, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: "SPHERE20", disc: "20%", type: "All Products", usage: "1,248 / 5,000", valid: "31 Mar 2024", active: true  },
                    { code: "FIRST50",  disc: "50%", type: "First Order",  usage: "842 / 1,000",  valid: "28 Feb 2024", active: true  },
                    { code: "FLASH30",  disc: "30%", type: "Electronics",  usage: "2,100 / 2,000", valid: "15 Jan 2024", active: false },
                  ].map((c) => (
                    <tr key={c.code} style={{ borderTop: `1px solid ${borderColor}` }}>
                      <td style={{ padding: "14px 16px" }}>
                        <code style={{ background: darkMode ? "rgba(255,107,53,0.15)" : "rgba(255,107,53,0.08)", color: COLORS.primary, padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{c.code}</code>
                      </td>
                      <td style={{ padding: "14px 16px", color: COLORS.success, fontSize: 13, fontWeight: 700 }}>{c.disc}</td>
                      <td style={{ padding: "14px 16px", color: mutedColor, fontSize: 13 }}>{c.type}</td>
                      <td style={{ padding: "14px 16px", color: textColor, fontSize: 13 }}>{c.usage}</td>
                      <td style={{ padding: "14px 16px", color: mutedColor, fontSize: 13 }}>{c.valid}</td>
                      <td style={{ padding: "14px 16px" }}><Badge text={c.active ? "Active" : "Expired"} type={c.active ? "success" : "danger"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ color: textColor, fontWeight: 800, margin: 0, fontSize: 24 }}>Order Management</h2>
                <p style={{ color: mutedColor, fontSize: 13, margin: "4px 0 0" }}>Track and manage all customer orders</p>
              </div>
              <button style={{ background: "none", border: `1px solid ${borderColor}`, color: textColor, padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>⬇ Export CSV</button>
            </div>
            <div style={{ textAlign: "center", padding: "80px 20px", background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
              <h3 style={{ color: textColor, margin: "0 0 8px" }}>Order Management</h3>
              <p style={{ color: mutedColor, margin: 0, fontSize: 14 }}>Full CRUD interface with filtering, sorting, and export capabilities</p>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ color: textColor, fontWeight: 800, margin: 0, fontSize: 24 }}>User Management</h2>
                <p style={{ color: mutedColor, fontSize: 13, margin: "4px 0 0" }}>148K registered users</p>
              </div>
              <button style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Add User</button>
            </div>
            <div style={{ textAlign: "center", padding: "80px 20px", background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👥</div>
              <h3 style={{ color: textColor, margin: "0 0 8px" }}>User Management</h3>
              <p style={{ color: mutedColor, margin: 0, fontSize: 14 }}>Full CRUD interface with filtering, sorting, and export capabilities</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
