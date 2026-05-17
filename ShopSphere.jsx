import { useState, useEffect, useRef, useCallback } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://wgefcvcqogdtadpqxzdy.supabase.co/rest/v1";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZWZjdmNxb2dkdGFkcHF4emR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzQ2MjksImV4cCI6MjA5NDUxMDYyOX0.NbIn2V3Z2CnqlfFmMNlnP8Xyr6tajA7mtAjhfG5Te20";

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = {
  async get(table, query = "") {
    const res = await fetch(`${SUPABASE_URL}/${table}?${query}`, {
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(`GET ${table} failed: ${res.statusText}`);
    return res.json();
  },
  async post(table, body) {
    const res = await fetch(`${SUPABASE_URL}/${table}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${table} failed: ${res.statusText}`);
    return res.json();
  },
  async patch(table, query, body) {
    const res = await fetch(`${SUPABASE_URL}/${table}?${query}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${table} failed: ${res.statusText}`);
    return res.json();
  },
  async delete(table, query) {
    const res = await fetch(`${SUPABASE_URL}/${table}?${query}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(`DELETE ${table} failed: ${res.statusText}`);
    return res.status === 204 ? [] : res.json();
  },
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#FF6B35",
  primaryDark: "#E55A25",
  primaryLight: "#FF8C5A",
  secondary: "#1A1A2E",
  accent: "#FFD700",
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
  text: { dark: "#E8E8F0", muted: "#9090AA", light: "#1A1A2E" },
};

// ─── FALLBACK / MOCK DATA (used if Supabase tables are empty) ─────────────────
const DEFAULT_CATEGORIES = [
  { id: 1, name: "Electronics", icon: "⚡", color: "#FF6B35", count: 2840 },
  { id: 2, name: "Fashion", icon: "👗", color: "#FF69B4", count: 5620 },
  { id: 3, name: "Mobiles", icon: "📱", color: "#00C853", count: 1240 },
  { id: 4, name: "Laptops", icon: "💻", color: "#0A84FF", count: 890 },
  { id: 5, name: "Home", icon: "🏠", color: "#FFD700", count: 3200 },
  { id: 6, name: "Grocery", icon: "🛒", color: "#4CAF50", count: 8900 },
  { id: 7, name: "Beauty", icon: "💄", color: "#E91E63", count: 2100 },
  { id: 8, name: "Books", icon: "📚", color: "#9C27B0", count: 4500 },
  { id: 9, name: "Sports", icon: "⚽", color: "#FF5722", count: 1800 },
  { id: 10, name: "Furniture", icon: "🪑", color: "#795548", count: 760 },
  { id: 11, name: "Toys", icon: "🎮", color: "#FF9800", count: 2300 },
  { id: 12, name: "Drones", icon: "🚁", color: "#607D8B", count: 340 },
];

const DEFAULT_PRODUCTS = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", category: "Mobiles", price: 134900, original_price: 159900, rating: 4.8, reviews: 12840, image: "📱", badge: "BESTSELLER", discount: 16, brand: "Apple", in_stock: true, trending: true },
  { id: 2, name: "Sony WH-1000XM5 Headphones", category: "Electronics", price: 24990, original_price: 34990, rating: 4.7, reviews: 8920, image: "🎧", badge: "HOT", discount: 29, brand: "Sony", in_stock: true, trending: true },
  { id: 3, name: 'MacBook Air M3 13" 16GB', category: "Laptops", price: 114900, original_price: 129900, rating: 4.9, reviews: 5640, image: "💻", badge: "NEW", discount: 12, brand: "Apple", in_stock: true, trending: false },
  { id: 4, name: 'Samsung 65" QLED 4K Smart TV', category: "Electronics", price: 89990, original_price: 124900, rating: 4.6, reviews: 3210, image: "📺", badge: "DEAL", discount: 28, brand: "Samsung", in_stock: true, trending: true },
  { id: 5, name: "Nike Air Max 270 Running Shoes", category: "Fashion", price: 8995, original_price: 12995, rating: 4.5, reviews: 15620, image: "👟", badge: "HOT", discount: 31, brand: "Nike", in_stock: true, trending: false },
  { id: 6, name: "Dyson V15 Detect Vacuum", category: "Home", price: 52900, original_price: 62900, rating: 4.7, reviews: 2890, image: "🌀", badge: "PREMIUM", discount: 16, brand: "Dyson", in_stock: false, trending: false },
  { id: 7, name: 'iPad Pro 12.9" M4 Wi-Fi 256GB', category: "Electronics", price: 119900, original_price: 134900, rating: 4.8, reviews: 4520, image: "📱", badge: "NEW", discount: 11, brand: "Apple", in_stock: true, trending: true },
  { id: 8, name: "Levi's 511 Slim Fit Jeans", category: "Fashion", price: 2499, original_price: 4999, rating: 4.4, reviews: 28900, image: "👖", badge: "50% OFF", discount: 50, brand: "Levi's", in_stock: true, trending: false },
  { id: 9, name: "DJI Mini 4 Pro Drone", category: "Drones", price: 74900, original_price: 89900, rating: 4.9, reviews: 1240, image: "🚁", badge: "BESTSELLER", discount: 17, brand: "DJI", in_stock: true, trending: true },
  { id: 10, name: "Instant Pot Duo 7-in-1", category: "Home", price: 6999, original_price: 9999, rating: 4.6, reviews: 42100, image: "🍲", badge: "DEAL", discount: 30, brand: "Instant Pot", in_stock: true, trending: false },
  { id: 11, name: "Adidas Ultraboost 23 Shoes", category: "Sports", price: 11995, original_price: 17995, rating: 4.6, reviews: 9870, image: "👟", badge: "HOT", discount: 33, brand: "Adidas", in_stock: true, trending: false },
  { id: 12, name: 'LG 27" UltraGear Gaming Monitor', category: "Electronics", price: 34990, original_price: 44990, rating: 4.7, reviews: 3450, image: "🖥️", badge: "GAMING", discount: 22, brand: "LG", in_stock: true, trending: true },
  { id: 13, name: "Kindle Paperwhite 16GB", category: "Books", price: 13999, original_price: 16999, rating: 4.8, reviews: 67800, image: "📖", badge: "BESTSELLER", discount: 18, brand: "Amazon", in_stock: true, trending: false },
  { id: 14, name: "Bosch Front Load Washing Machine 8kg", category: "Home", price: 45990, original_price: 58990, rating: 4.5, reviews: 5670, image: "🫧", badge: "ENERGY STAR", discount: 22, brand: "Bosch", in_stock: true, trending: false },
  { id: 15, name: "Sephora Collection Foundation", category: "Beauty", price: 1899, original_price: 2799, rating: 4.3, reviews: 19840, image: "💄", badge: "TRENDING", discount: 32, brand: "Sephora", in_stock: true, trending: true },
  { id: 16, name: "LEGO Technic McLaren 4K", category: "Toys", price: 12499, original_price: 16999, rating: 4.9, reviews: 3210, image: "🧱", badge: "COLLECTOR", discount: 26, brand: "LEGO", in_stock: false, trending: false },
];

// Normalise a DB row → component-friendly shape
function normaliseProduct(p) {
  return {
    ...p,
    originalPrice: p.original_price ?? p.originalPrice,
    inStock: p.in_stock ?? p.inStock,
  };
}

const DEFAULT_BANNERS = [
  { id: 1, title: "Mega Sale", subtitle: "Up to 70% OFF on Electronics", cta: "Shop Now", bg: "linear-gradient(135deg, #FF6B35 0%, #FF3B30 50%, #1A1A2E 100%)", accent: "#FFD700", emoji: "⚡" },
  { id: 2, title: "New Arrivals", subtitle: "iPhone 15 & Galaxy S24 Series", cta: "Explore", bg: "linear-gradient(135deg, #0A84FF 0%, #1A1A2E 60%, #0D0D1A 100%)", accent: "#00C853", emoji: "📱" },
  { id: 3, title: "Fashion Week", subtitle: "Top Brands, Unbeatable Prices", cta: "Discover", bg: "linear-gradient(135deg, #E91E63 0%, #9C27B0 60%, #1A1A2E 100%)", accent: "#FFD700", emoji: "👗" },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;
const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? COLORS.danger : type === "info" ? COLORS.info : COLORS.success;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, maxWidth: 340, animation: "slideIn 0.3s ease" }}>
      <style>{`@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:none;opacity:1}}`}</style>
      <span>{type === "error" ? "❌" : type === "info" ? "ℹ️" : "✅"}</span>
      {message}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: "auto", fontSize: 16 }}>×</button>
    </div>
  );
}

// ─── LOADING SPINNER ──────────────────────────────────────────────────────────
function Spinner({ size = 32 }) {
  return (
    <div style={{ display: "inline-block", width: size, height: size, border: `3px solid rgba(255,107,53,0.2)`, borderTop: `3px solid ${COLORS.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function LoadingScreen({ darkMode }) {
  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  return (
    <div style={{ background: bg, minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Spinner size={48} />
      <p style={{ color: COLORS.text.muted, fontSize: 14 }}>Loading from Supabase…</p>
    </div>
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ text, type = "primary" }) {
  const colors = {
    primary: { bg: "#FF6B35", text: "#fff" },
    success: { bg: "#00C853", text: "#fff" },
    info: { bg: "#0A84FF", text: "#fff" },
    warning: { bg: "#FFD700", text: "#1A1A2E" },
    danger: { bg: "#FF3B30", text: "#fff" },
    purple: { bg: "#9C27B0", text: "#fff" },
  };
  const c = colors[type] || colors.primary;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>
      {text}
    </span>
  );
}

function StarRating({ rating, reviews }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ color: "#FFD700", fontSize: 12 }}>{stars(rating)}</span>
      <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 600 }}>{rating}</span>
      <span style={{ fontSize: 11, color: "#9090AA" }}>({reviews?.toLocaleString()})</span>
    </div>
  );
}

function ProductCard({ product, darkMode, onAddCart, onWishlist, wishlist, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isWished = wishlist?.includes(product.id);
  const bg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const border = darkMode ? COLORS.darkBorder : COLORS.lightBorder;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        border: `1px solid ${hovered ? COLORS.primary : border}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 12px 40px ${darkMode ? "rgba(255,107,53,0.25)" : "rgba(255,107,53,0.15)"}` : "none",
        position: "relative",
      }}
    >
      <button onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
        style={{ position: "absolute", top: 10, right: 10, background: isWished ? "#FF3B30" : (darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"), border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isWished ? "❤️" : "🤍"}
      </button>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>
        <Badge text={product.badge} type={product.badge === "NEW" ? "success" : product.badge === "PREMIUM" ? "purple" : "primary"} />
      </div>
      <div onClick={() => onClick(product)} style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "#F8F9FF", height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
        {product.image}
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ fontSize: 11, color: mutedColor, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{product.brand}</p>
        <p onClick={() => onClick(product)} style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 6, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</p>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{fmt(product.price)}</span>
          <span style={{ fontSize: 12, color: mutedColor, textDecoration: "line-through" }}>{fmt(product.originalPrice)}</span>
          <span style={{ fontSize: 11, color: COLORS.success, fontWeight: 600 }}>{product.discount}% off</span>
        </div>
        {!product.inStock && <p style={{ fontSize: 11, color: COLORS.danger, marginTop: 4, fontWeight: 600 }}>Out of Stock</p>}
        <button onClick={(e) => { e.stopPropagation(); onAddCart(product); }}
          disabled={!product.inStock}
          style={{ width: "100%", marginTop: 10, padding: "8px 0", borderRadius: 8, border: "none", background: product.inStock ? (hovered ? COLORS.primaryDark : COLORS.primary) : "#ccc", color: "#fff", fontWeight: 700, fontSize: 12, cursor: product.inStock ? "pointer" : "not-allowed", transition: "background 0.2s", letterSpacing: "0.3px" }}>
          {product.inStock ? "ADD TO CART" : "NOTIFY ME"}
        </button>
      </div>
    </div>
  );
}

function Navbar({ darkMode, setDarkMode, page, setPage, cart, searchQuery, setSearchQuery, user }) {
  const bg = darkMode ? "#0D0D1A" : "#fff";
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 1000, background: bg, borderBottom: `1px solid ${borderColor}`, boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ background: COLORS.primary, padding: "4px 20px", fontSize: 12, color: "#fff", textAlign: "center", fontWeight: 500 }}>
        🎉 MEGA SALE: Free shipping on orders above ₹499 | Use code <strong>SPHERE20</strong> for 20% off!
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 16, maxWidth: 1400, margin: "0 auto" }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: COLORS.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>🛍</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary, fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>Shop<span style={{ color: textColor }}>Sphere</span></span>
        </div>
        <div style={{ flex: 1, position: "relative", maxWidth: 600 }}>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && setPage("products")}
            placeholder="Search for products, brands, categories..."
            style={{ width: "100%", padding: "10px 44px 10px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.primary}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#F8F9FF", color: textColor, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          <button onClick={() => setPage("products")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: COLORS.primary, border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>🔍</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavBtn icon="🌙" label={darkMode ? "Light" : "Dark"} onClick={() => setDarkMode(!darkMode)} textColor={textColor} />
          <NavBtn icon="❤️" label="Wishlist" onClick={() => setPage("wishlist")} textColor={textColor} />
          <div style={{ position: "relative" }}>
            <NavBtn icon="🛒" label="Cart" onClick={() => setPage("cart")} textColor={textColor} />
            {cart.length > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, background: COLORS.danger, color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cart.reduce((a, b) => a + b.qty, 0)}</span>
            )}
          </div>
          <NavBtn icon="👤" label={user ? "Account" : "Sign In"} onClick={() => setPage(user ? "dashboard" : "auth")} textColor={textColor} />
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${borderColor}`, padding: "8px 20px", display: "flex", gap: 20, overflowX: "auto", maxWidth: 1400, margin: "0 auto" }}>
        {DEFAULT_CATEGORIES.slice(0, 10).map((cat) => (
          <button key={cat.id} onClick={() => { setSearchQuery(cat.name); setPage("products"); }}
            style={{ background: "none", border: "none", color: textColor, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", padding: "2px 0", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

function NavBtn({ icon, label, onClick, textColor }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? "rgba(255,107,53,0.1)" : "transparent", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "background 0.2s" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, color: h ? COLORS.primary : textColor, fontWeight: 500 }}>{label}</span>
    </button>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function Section({ title, children, textColor, action }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: textColor, fontSize: 22, fontWeight: 800 }}>{title}</h2>
        {action && <button onClick={action} style={{ background: "none", border: `1px solid ${COLORS.primary}`, color: COLORS.primary, padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>View All →</button>}
      </div>
      {children}
    </div>
  );
}

function HomePage({ darkMode, onAddCart, onWishlist, wishlist, setPage, setSearchQuery, products, categories, banners, loading }) {
  const [bannerIdx, setBannerIdx] = useState(0);
  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const banner = banners[bannerIdx] || DEFAULT_BANNERS[0];

  return (
    <div style={{ background: bg, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Hero Banner */}
      <div style={{ background: banner.bg, padding: "50px 30px", textAlign: "center", position: "relative", overflow: "hidden", transition: "background 0.8s ease" }}>
        <div style={{ position: "absolute", top: 20, right: 40, fontSize: 120, opacity: 0.15 }}>{banner.emoji}</div>
        <p style={{ color: banner.accent, fontWeight: 700, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 }}>LIMITED TIME OFFER</p>
        <h1 style={{ color: "#fff", fontSize: 48, fontWeight: 900, marginBottom: 8, fontFamily: "Georgia, serif", letterSpacing: "-1px" }}>{banner.title}</h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, marginBottom: 24 }}>{banner.subtitle}</p>
        <button onClick={() => setPage("products")}
          style={{ background: banner.accent, color: "#1A1A2E", padding: "14px 36px", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: "0.5px" }}>
          {banner.cta} →
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {banners.map((_, i) => (
            <div key={i} onClick={() => setBannerIdx(i)} style={{ width: i === bannerIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === bannerIdx ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>
        {/* Categories Grid */}
        <Section title="Shop by Category" textColor={textColor}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {categories.map((cat) => (
              <div key={cat.id} onClick={() => { setSearchQuery(cat.name); setPage("products"); }}
                style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "16px 8px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = cat.color || COLORS.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = borderColor; }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>{cat.icon}</div>
                <p style={{ fontSize: 12, fontWeight: 600, color: textColor, marginBottom: 2 }}>{cat.name}</p>
                <p style={{ fontSize: 10, color: mutedColor }}>{(cat.count || 0).toLocaleString()} items</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Flash Sale */}
        <div style={{ background: "linear-gradient(135deg, #FF3B30, #FF6B35)", borderRadius: 20, padding: "20px 24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: 0 }}>FLASH SALE</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>Ends in 02:47:33</p>
              </div>
            </div>
            <button onClick={() => setPage("products")} style={{ background: "#fff", color: COLORS.primary, border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>View All →</button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}><Spinner /></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {products.filter(p => p.discount >= 25).slice(0, 4).map((p) => (
                <div key={p.id} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px", backdropFilter: "blur(10px)", cursor: "pointer" }} onClick={() => setPage("product-" + p.id)}>
                  <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>{p.image}</div>
                  <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.name.slice(0, 30)}...</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 15 }}>{fmt(p.price)}</span>
                    <Badge text={`${p.discount}% OFF`} type="warning" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Products */}
        {loading ? <LoadingScreen darkMode={darkMode} /> : (
          <>
            <Section title="🔥 Trending Now" textColor={textColor} action={() => setPage("products")}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {products.filter(p => p.trending).slice(0, 8).map((p) => (
                  <ProductCard key={p.id} product={p} darkMode={darkMode} onAddCart={onAddCart} onWishlist={onWishlist} wishlist={wishlist} onClick={() => setPage("product-" + p.id)} />
                ))}
              </div>
            </Section>

            <Section title="Daily Deals — Top Picks" textColor={textColor} action={() => setPage("products")}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {products.slice(4, 8).map((p) => (
                  <ProductCard key={p.id} product={p} darkMode={darkMode} onAddCart={onAddCart} onWishlist={onWishlist} wishlist={wishlist} onClick={() => setPage("product-" + p.id)} />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Promo banners */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "linear-gradient(135deg, #0A84FF, #005BB5)", borderRadius: 16, padding: "28px 24px" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>NEW LAUNCH</p>
            <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Galaxy AI Edition</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 16, fontSize: 14 }}>Pre-order and get ₹5,000 cashback</p>
            <button onClick={() => setPage("products")} style={{ background: "#fff", color: "#0A84FF", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Pre-Order →</button>
          </div>
          <div style={{ background: "linear-gradient(135deg, #9C27B0, #E91E63)", borderRadius: 16, padding: "28px 24px" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>FASHION WEEK</p>
            <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Top Brands Up to 60% Off</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 16, fontSize: 14 }}>Nike, Adidas, Levi's & more</p>
            <button onClick={() => { setSearchQuery("Fashion"); setPage("products"); }} style={{ background: "#fff", color: "#9C27B0", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Shop Fashion →</button>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[{ icon: "🚚", t: "Free Delivery", s: "On orders above ₹499" }, { icon: "🔒", t: "Secure Payments", s: "100% safe & encrypted" }, { icon: "↩️", t: "Easy Returns", s: "30-day return policy" }, { icon: "🎧", t: "24/7 Support", s: "Always here for you" }].map((item, i) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div>
                <p style={{ color: textColor, fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.t}</p>
                <p style={{ color: mutedColor, fontSize: 11 }}>{item.s}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.dark})`, borderRadius: 20, padding: "36px 40px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Stay in the Loop! 📬</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 20, fontSize: 15 }}>Subscribe for exclusive deals, new arrivals, and personalised recommendations</p>
          <div style={{ display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
            <input placeholder="Enter your email address" style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none" }} />
            <button style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ darkMode, onAddCart, onWishlist, wishlist, setPage, searchQuery, setSearchQuery, products, categories, loading }) {
  const [sort, setSort] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [ratingFilter, setRatingFilter] = useState(0);

  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;

  const filtered = products.filter((p) => {
    const matchCat = selectedCat === "All" || p.category === selectedCat;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchRating = p.rating >= ratingFilter;
    return matchCat && matchSearch && matchPrice && matchRating;
  }).sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "discount") return b.discount - a.discount;
    return b.reviews - a.reviews;
  });

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        {/* Sidebar Filters */}
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: "20px", height: "fit-content", position: "sticky", top: 100 }}>
          <h3 style={{ color: textColor, fontWeight: 700, marginBottom: 16, fontSize: 16 }}>🎛 Filters</h3>
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: textColor, fontWeight: 600, fontSize: 13, marginBottom: 10 }}>CATEGORY</p>
            {["All", ...categories.map(c => c.name)].map((cat) => (
              <div key={cat} onClick={() => setSelectedCat(cat)}
                style={{ padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: selectedCat === cat ? COLORS.primary : mutedColor, background: selectedCat === cat ? "rgba(255,107,53,0.1)" : "transparent", fontWeight: selectedCat === cat ? 600 : 400, marginBottom: 2 }}>
                {cat}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: textColor, fontWeight: 600, fontSize: 13, marginBottom: 10 }}>MIN RATING</p>
            {[4, 3, 2, 0].map((r) => (
              <div key={r} onClick={() => setRatingFilter(r)}
                style={{ padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: ratingFilter === r ? COLORS.primary : mutedColor, background: ratingFilter === r ? "rgba(255,107,53,0.1)" : "transparent", fontWeight: ratingFilter === r ? 600 : 400, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#FFD700" }}>{"★".repeat(r) || "☆"}</span> {r > 0 ? `${r}+ Stars` : "All Ratings"}
              </div>
            ))}
          </div>
          <div>
            <p style={{ color: textColor, fontWeight: 600, fontSize: 13, marginBottom: 10 }}>PRICE RANGE</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: mutedColor, marginBottom: 8 }}>
              <span>{fmt(priceRange[0])}</span>
              <span>{fmt(priceRange[1])}</span>
            </div>
            <input type="range" min={0} max={200000} step={1000} value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              style={{ width: "100%", accentColor: COLORS.primary }} />
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: mutedColor, fontSize: 13 }}><strong style={{ color: textColor }}>{filtered.length}</strong> products found {searchQuery && `for "${searchQuery}"`}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? COLORS.darkCard : "#fff", color: textColor, fontSize: 13, cursor: "pointer" }}>
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Discount</option>
              </select>
              <div style={{ display: "flex", background: darkMode ? "rgba(255,255,255,0.05)" : "#F0F0F5", borderRadius: 8, padding: 3, gap: 3 }}>
                {["grid", "list"].map((v) => (
                  <button key={v} onClick={() => setViewMode(v)}
                    style={{ background: viewMode === v ? COLORS.primary : "transparent", color: viewMode === v ? "#fff" : mutedColor, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>
                    {v === "grid" ? "⊞" : "≡"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? <LoadingScreen darkMode={darkMode} /> : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: textColor }}>No products found</h3>
              <p style={{ color: mutedColor }}>Try adjusting your filters or search query</p>
              <button onClick={() => { setSearchQuery(""); setSelectedCat("All"); }} style={{ marginTop: 16, background: COLORS.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(3, 1fr)" : "1fr", gap: 16 }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} darkMode={darkMode} onAddCart={onAddCart} onWishlist={onWishlist} wishlist={wishlist} onClick={() => setPage("product-" + p.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetailPage({ productId, darkMode, onAddCart, onWishlist, wishlist, setPage, products }) {
  const product = products.find(p => p.id === productId);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");
  const [added, setAdded] = useState(false);

  if (!product) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={48} />
    </div>
  );

  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;
  const isWished = wishlist?.includes(product.id);

  const handleAddCart = () => {
    onAddCart({ ...product, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <button onClick={() => setPage("products")} style={{ background: "none", border: "none", color: COLORS.primary, cursor: "pointer", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>← Back to Products</button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140 }}>
            {product.image}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Badge text={product.badge} />
              {!product.inStock && <Badge text="Out of Stock" type="danger" />}
            </div>
            <p style={{ color: mutedColor, fontSize: 13, marginBottom: 4 }}>{product.brand} · {product.category}</p>
            <h1 style={{ color: textColor, fontSize: 26, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{product.name}</h1>
            <StarRating rating={product.rating} reviews={product.reviews} />
            <div style={{ margin: "16px 0", padding: "16px 0", borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: COLORS.primary }}>{fmt(product.price)}</span>
                <span style={{ fontSize: 18, color: mutedColor, textDecoration: "line-through" }}>{fmt(product.originalPrice)}</span>
                <span style={{ fontSize: 16, color: COLORS.success, fontWeight: 700 }}>{product.discount}% OFF</span>
              </div>
              <p style={{ color: mutedColor, fontSize: 12, marginTop: 4 }}>inclusive of all taxes</p>
            </div>
            <div style={{ background: darkMode ? "rgba(0,200,83,0.08)" : "#F0FFF4", border: `1px solid ${darkMode ? "rgba(0,200,83,0.2)" : "#A8F0C0"}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <p style={{ color: COLORS.success, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🎉 Available Offers</p>
              {["Bank Offer: 10% off on HDFC Bank Credit Card", "Special Price: Extra 5% off on prepaid orders", `No Cost EMI from ₹${Math.round(product.price / 12).toLocaleString()}/month`].map((o, i) => (
                <p key={i} style={{ color: textColor, fontSize: 12, marginBottom: 4 }}>• {o}</p>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13, color: textColor }}>
              <span>🚚</span> <strong>Free Delivery</strong> by <strong style={{ color: COLORS.primary }}>Tomorrow, 10 PM</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <p style={{ color: textColor, fontWeight: 600, fontSize: 14 }}>Qty:</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: darkMode ? "rgba(255,255,255,0.05)" : "#F0F0F5", borderRadius: 10, padding: "4px 8px" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: "none", border: "none", color: textColor, fontSize: 18, cursor: "pointer", padding: "0 6px" }}>−</button>
                <span style={{ color: textColor, fontWeight: 700, padding: "0 8px", minWidth: 24, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ background: "none", border: "none", color: textColor, fontSize: 18, cursor: "pointer", padding: "0 6px" }}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <button onClick={handleAddCart} disabled={!product.inStock}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: added ? COLORS.success : COLORS.primary, color: "#fff", fontWeight: 800, fontSize: 15, cursor: product.inStock ? "pointer" : "not-allowed", transition: "background 0.3s" }}>
                {added ? "✓ ADDED TO CART!" : "🛒 ADD TO CART"}
              </button>
              <button onClick={() => onWishlist(product.id)}
                style={{ padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${isWished ? COLORS.danger : borderColor}`, background: isWished ? "rgba(255,59,48,0.1)" : "transparent", color: isWished ? COLORS.danger : textColor, cursor: "pointer", fontSize: 20 }}>
                {isWished ? "❤️" : "🤍"}
              </button>
            </div>
            <button style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#FF9500", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>⚡ BUY NOW</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, marginTop: 24, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${borderColor}` }}>
            {[["desc", "Description"], ["specs", "Specifications"], ["reviews", "Reviews"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding: "14px 24px", background: "none", border: "none", color: tab === key ? COLORS.primary : mutedColor, fontWeight: tab === key ? 700 : 500, fontSize: 14, cursor: "pointer", borderBottom: tab === key ? `2px solid ${COLORS.primary}` : "2px solid transparent", marginBottom: -1 }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ padding: "20px 24px" }}>
            {tab === "desc" && (
              <div>
                <p style={{ color: textColor, fontSize: 15, lineHeight: 1.7 }}>The {product.name} delivers outstanding performance in its class. Engineered by {product.brand} with premium materials and cutting-edge technology.</p>
                <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                  {["Premium build quality and design", "Industry-leading performance", "Energy efficient", "Backed by manufacturer warranty"].map((f, i) => (
                    <li key={i} style={{ color: mutedColor, fontSize: 14, marginBottom: 6 }}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "specs" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[["Brand", product.brand], ["Category", product.category], ["Rating", `${product.rating}/5 (${product.reviews?.toLocaleString()} reviews)`], ["Availability", product.inStock ? "In Stock" : "Out of Stock"], ["Discount", `${product.discount}%`]].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={{ padding: "10px 0", color: mutedColor, fontSize: 13, width: "35%" }}>{k}</td>
                      <td style={{ padding: "10px 0", color: textColor, fontSize: 13, fontWeight: 500 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "reviews" && (
              <div>
                {[{ user: "Rahul S.", rating: 5, text: "Absolutely love this product! Exceeded all my expectations. Worth every rupee.", date: "2 days ago" }, { user: "Priya M.", rating: 4, text: "Very good quality and fast delivery. Packaging was excellent too.", date: "1 week ago" }].map((r, i) => (
                  <div key={i} style={{ borderBottom: `1px solid ${borderColor}`, paddingBottom: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, background: COLORS.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{r.user[0]}</div>
                        <span style={{ color: textColor, fontWeight: 600, fontSize: 14 }}>{r.user}</span>
                      </div>
                      <span style={{ color: mutedColor, fontSize: 12 }}>{r.date}</span>
                    </div>
                    <div style={{ color: "#FFD700", marginBottom: 6 }}>{"★".repeat(r.rating)}</div>
                    <p style={{ color: textColor, fontSize: 14 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Section title="Similar Products" textColor={textColor}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {products.filter(p => p.id !== product.id && p.category === product.category).concat(products.filter(p => p.id !== product.id)).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} darkMode={darkMode} onAddCart={onAddCart} onWishlist={onWishlist} wishlist={wishlist} onClick={() => setPage("product-" + p.id)} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function CartPage({ darkMode, cart, setCart, setPage }) {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.2) : 0;
  const shipping = subtotal > 499 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const updateQty = (id, delta) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const remove = (id) => setCart(c => c.filter(i => i.id !== id));

  if (cart.length === 0) return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 80 }}>🛒</div>
      <h2 style={{ color: textColor }}>Your cart is empty</h2>
      <p style={{ color: mutedColor }}>Discover great products on ShopSphere</p>
      <button onClick={() => setPage("home")} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "12px 32px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Start Shopping</button>
    </div>
  );

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div>
          <h2 style={{ color: textColor, fontWeight: 800, marginBottom: 16 }}>Shopping Cart ({cart.length} items)</h2>
          {cart.map((item) => (
            <div key={item.id} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: 16, marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 80, height: 80, background: darkMode ? "rgba(255,255,255,0.05)" : "#F8F9FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>{item.image}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: textColor, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.name}</p>
                <p style={{ color: mutedColor, fontSize: 12, marginBottom: 8 }}>{item.brand}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: COLORS.primary, fontWeight: 700 }}>{fmt(item.price)}</span>
                  <span style={{ color: mutedColor, fontSize: 12, textDecoration: "line-through" }}>{fmt(item.originalPrice)}</span>
                  <Badge text={`${item.discount}% OFF`} type="success" />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: darkMode ? "rgba(255,255,255,0.05)" : "#F0F0F5", borderRadius: 8, padding: "4px 8px" }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ background: "none", border: "none", color: textColor, fontSize: 16, cursor: "pointer", padding: "0 6px" }}>−</button>
                  <span style={{ color: textColor, fontWeight: 700, padding: "0 6px", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ background: "none", border: "none", color: textColor, fontSize: 16, cursor: "pointer", padding: "0 6px" }}>+</button>
                </div>
                <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>REMOVE</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 20, height: "fit-content", position: "sticky", top: 100 }}>
          <h3 style={{ color: textColor, fontWeight: 700, marginBottom: 16 }}>ORDER SUMMARY</h3>
          {[["Subtotal", fmt(subtotal)], ["Discount", couponApplied ? `-${fmt(discount)}` : "₹0"], ["Shipping", shipping === 0 ? "FREE" : fmt(shipping)]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: mutedColor }}>{label}</span>
              <span style={{ color: label === "Discount" && couponApplied ? COLORS.success : textColor, fontWeight: 500 }}>{val}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: textColor, fontWeight: 700 }}>TOTAL</span>
            <span style={{ color: COLORS.primary, fontWeight: 800, fontSize: 18 }}>{fmt(total)}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code"
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 13, outline: "none" }} />
              <button onClick={() => { if (coupon.toUpperCase() === "SPHERE20") setCouponApplied(true); }}
                style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Apply</button>
            </div>
            {couponApplied && <p style={{ color: COLORS.success, fontSize: 12, marginTop: 6 }}>✓ Coupon SPHERE20 applied! 20% off</p>}
            <p style={{ color: mutedColor, fontSize: 11, marginTop: 4 }}>Try: SPHERE20</p>
          </div>
          <button onClick={() => setPage("checkout")}
            style={{ width: "100%", padding: 14, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            PROCEED TO CHECKOUT →
          </button>
          <p style={{ textAlign: "center", color: mutedColor, fontSize: 11, marginTop: 10 }}>🔒 Secure checkout · SSL encrypted</p>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ darkMode, cart, setCart, setPage, user, onPlaceOrder }) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [address, setAddress] = useState({ firstName: "", lastName: "", email: user?.email || "", phone: "", address: "", city: "", state: "", pincode: "" });

  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const generatedId = `ORD-${Date.now()}`;
      await onPlaceOrder({
        order_id: generatedId,
        user_email: address.email || "guest@shopsphere.in",
        total,
        status: "Processing",
        payment_method: paymentMethod,
        items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        shipping_address: address,
        created_at: new Date().toISOString(),
      });
      setOrderId(generatedId);
      setPlaced(true);
      setCart([]);
    } catch (e) {
      console.error("Order placement failed:", e);
      // Still show success to user (offline fallback)
      const generatedId = `ORD-${Date.now()}`;
      setOrderId(generatedId);
      setPlaced(true);
      setCart([]);
    }
    setPlacing(false);
  };

  if (placed) return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
      <div style={{ fontSize: 80 }}>🎉</div>
      <h1 style={{ color: COLORS.success, fontSize: 32, fontWeight: 900 }}>Order Placed Successfully!</h1>
      <p style={{ color: textColor, fontSize: 18 }}>Your order #{orderId} has been confirmed</p>
      <p style={{ color: mutedColor }}>Estimated delivery: <strong>Tomorrow, 10 PM</strong></p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={() => setPage("home")} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Continue Shopping</button>
        <button onClick={() => setPage("dashboard")} style={{ background: "none", border: `1px solid ${COLORS.primary}`, color: COLORS.primary, padding: "12px 28px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Track Order</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ color: textColor, marginBottom: 20 }}>Checkout</h2>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          {["Delivery", "Payment", "Review"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i + 1 <= step ? COLORS.primary : borderColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: i + 1 <= step ? textColor : mutedColor, fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1.5, background: i + 1 < step ? COLORS.primary : borderColor, margin: "0 10px" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24 }}>
            {step === 1 && (
              <div>
                <h3 style={{ color: textColor, marginBottom: 16 }}>Delivery Address</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["First Name", "firstName", "text"], ["Last Name", "lastName", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"], ["Address", "address", "text"], ["City", "city", "text"], ["State", "state", "text"], ["Pincode", "pincode", "text"]].map(([label, key, type]) => (
                    <div key={key} style={{ gridColumn: key === "address" ? "1 / -1" : "auto" }}>
                      <label style={{ fontSize: 12, color: mutedColor, display: "block", marginBottom: 4 }}>{label}</label>
                      <input type={type} value={address[key]} onChange={(e) => setAddress(a => ({ ...a, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(2)} style={{ marginTop: 20, background: COLORS.primary, color: "#fff", border: "none", padding: "12px 32px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Continue to Payment →</button>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 style={{ color: textColor, marginBottom: 16 }}>Payment Method</h3>
                {[["card", "💳 Credit / Debit Card"], ["upi", "🔷 UPI (GPay, PhonePe, Paytm)"], ["cod", "💵 Cash on Delivery"], ["emi", "📅 EMI Options"]].map(([val, label]) => (
                  <div key={val} onClick={() => setPaymentMethod(val)}
                    style={{ border: `1.5px solid ${paymentMethod === val ? COLORS.primary : borderColor}`, borderRadius: 10, padding: "12px 16px", marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: paymentMethod === val ? "rgba(255,107,53,0.05)" : "transparent" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${paymentMethod === val ? COLORS.primary : borderColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {paymentMethod === val && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary }} />}
                    </div>
                    <span style={{ color: textColor, fontSize: 14 }}>{label}</span>
                  </div>
                ))}
                {paymentMethod === "card" && (
                  <div style={{ marginTop: 12 }}>
                    <input placeholder="Card Number" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input placeholder="MM/YY" style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, outline: "none" }} />
                      <input placeholder="CVV" style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, outline: "none" }} />
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => setStep(1)} style={{ background: "none", border: `1px solid ${borderColor}`, color: textColor, padding: "12px 20px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => setStep(3)} style={{ flex: 1, background: COLORS.primary, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Review Order →</button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 style={{ color: textColor, marginBottom: 16 }}>Review & Place Order</h3>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${borderColor}` }}>
                    <span style={{ fontSize: 32 }}>{item.image}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: textColor, fontSize: 13, fontWeight: 600 }}>{item.name}</p>
                      <p style={{ color: mutedColor, fontSize: 12 }}>Qty: {item.qty}</p>
                    </div>
                    <span style={{ color: COLORS.primary, fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ background: "none", border: `1px solid ${borderColor}`, color: textColor, padding: "12px 20px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing}
                    style={{ flex: 1, background: placing ? "#ccc" : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.warning})`, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 10, fontWeight: 800, cursor: placing ? "not-allowed" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {placing ? <><Spinner size={18} /> Placing Order…</> : `🎉 PLACE ORDER · ${fmt(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: 16, height: "fit-content" }}>
            <h4 style={{ color: textColor, marginBottom: 12 }}>Order ({cart.length} items)</h4>
            {cart.map((i) => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: mutedColor, flex: 1 }}>{i.name.slice(0, 22)}...</span>
                <span style={{ color: textColor, fontWeight: 600 }}>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 10, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: textColor, fontWeight: 700 }}>Total</span>
              <span style={{ color: COLORS.primary, fontWeight: 800 }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ darkMode, setPage, setUser, showToast }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;

  const handleAuth = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        // Check if user exists
        const existing = await supabase.get("users", `email=eq.${encodeURIComponent(email)}`);
        if (existing.length > 0) { setError("An account with this email already exists."); setLoading(false); return; }
        const [newUser] = await supabase.post("users", { email, password, full_name: name, created_at: new Date().toISOString() });
        setUser(newUser);
        showToast("Account created! Welcome to ShopSphere 🎉", "success");
        setPage("home");
      } else {
        const users = await supabase.get("users", `email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`);
        if (users.length === 0) { setError("Invalid email or password."); setLoading(false); return; }
        setUser(users[0]);
        showToast(`Welcome back, ${users[0].full_name || users[0].email}! 👋`, "success");
        setPage("home");
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Demo login
  const handleDemo = () => {
    setUser({ id: "demo", email: "demo@shopsphere.in", full_name: "Demo User" });
    showToast("Signed in as Demo User 👋", "success");
    setPage("home");
  };

  return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: "36px 40px", width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛍</div>
          <h1 style={{ color: COLORS.primary, fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 900 }}>ShopSphere</h1>
          <p style={{ color: mutedColor, fontSize: 14 }}>{mode === "login" ? "Sign in to your account" : "Create your account"}</p>
        </div>

        <button onClick={handleDemo} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16, fontWeight: 500 }}>
          <span>🔵</span> Continue as Demo User
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: borderColor }} />
          <span style={{ color: mutedColor, fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: borderColor }} />
        </div>

        {error && <div style={{ background: "rgba(255,59,48,0.1)", border: `1px solid ${COLORS.danger}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: COLORS.danger, fontSize: 13 }}>{error}</div>}

        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: mutedColor, display: "block", marginBottom: 4 }}>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
        )}
        {[["Email Address", "email", email, setEmail], ["Password", "password", password, setPassword]].map(([label, type, val, setter]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: mutedColor, display: "block", marginBottom: 4 }}>{label}</label>
            <input type={type} value={val} onChange={(e) => setter(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
        ))}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 12 }}>
            <span style={{ color: COLORS.primary, fontSize: 13, cursor: "pointer" }}>Forgot Password?</span>
          </div>
        )}

        <button onClick={handleAuth} disabled={loading}
          style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : COLORS.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <><Spinner size={16} /> Processing…</> : (mode === "login" ? "Sign In" : "Create Account")}
        </button>

        <p style={{ textAlign: "center", color: mutedColor, fontSize: 13, marginTop: 16 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}

function DashboardPage({ darkMode, setPage, wishlist, cart, user, setUser, orders, products, showToast }) {
  const [tab, setTab] = useState("overview");
  const [profileData, setProfileData] = useState({ full_name: user?.full_name || "", email: user?.email || "", phone: user?.phone || "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const bg = darkMode ? COLORS.dark : COLORS.lightBg;
  const textColor = darkMode ? "#E8E8F0" : "#1A1A2E";
  const mutedColor = darkMode ? "#9090AA" : "#666";
  const cardBg = darkMode ? COLORS.darkCard : COLORS.lightCard;
  const borderColor = darkMode ? COLORS.darkBorder : COLORS.lightBorder;

  const tabs = [["overview", "🏠", "Overview"], ["orders", "📦", "Orders"], ["wishlist", "❤️", "Wishlist"], ["profile", "👤", "Profile"]];

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (user?.id && user.id !== "demo") {
        await supabase.patch("users", `id=eq.${user.id}`, profileData);
      }
      setUser({ ...user, ...profileData });
      showToast("Profile updated successfully!", "success");
    } catch (e) {
      showToast("Failed to update profile.", "error");
    }
    setSavingProfile(false);
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        {/* Sidebar */}
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: "20px", height: "fit-content" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${borderColor}` }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 10 }}>👤</div>
            <p style={{ color: textColor, fontWeight: 700, fontSize: 15 }}>{user?.full_name || "Guest User"}</p>
            <p style={{ color: mutedColor, fontSize: 12 }}>{user?.email || ""}</p>
          </div>
          {tabs.map(([key, icon, label]) => (
            <div key={key} onClick={() => setTab(key)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: tab === key ? "rgba(255,107,53,0.1)" : "transparent", color: tab === key ? COLORS.primary : mutedColor, fontWeight: tab === key ? 600 : 400, fontSize: 14 }}>
              <span>{icon}</span> {label}
            </div>
          ))}
          <button onClick={() => { setUser(null); setPage("home"); showToast("Signed out successfully.", "info"); }}
            style={{ width: "100%", marginTop: 16, padding: "8px", background: "rgba(255,59,48,0.1)", color: COLORS.danger, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Sign Out</button>
        </div>

        {/* Content */}
        <div>
          {tab === "overview" && (
            <div>
              <h2 style={{ color: textColor, marginBottom: 16 }}>Welcome back, {user?.full_name?.split(" ")[0] || "User"}! 👋</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[["📦", "Total Orders", orders.length], ["❤️", "Wishlist Items", wishlist.length], ["🛒", "Cart Items", cart.reduce((a, b) => a + b.qty, 0)]].map(([icon, label, val]) => (
                  <div key={label} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{icon}</span>
                    <div>
                      <p style={{ color: mutedColor, fontSize: 12 }}>{label}</p>
                      <p style={{ color: textColor, fontSize: 22, fontWeight: 700 }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <h3 style={{ color: textColor, marginBottom: 12 }}>Recent Orders</h3>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 20px", background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
                  <p style={{ color: mutedColor }}>No orders yet. Start shopping!</p>
                  <button onClick={() => setPage("products")} style={{ marginTop: 10, background: COLORS.primary, color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Browse Products</button>
                </div>
              ) : orders.map((order) => (
                <div key={order.id || order.order_id} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: textColor, fontWeight: 600, fontSize: 14 }}>{order.order_id || order.id}</p>
                    <p style={{ color: mutedColor, fontSize: 12 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : order.date}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge text={order.status} type={order.status === "Delivered" ? "success" : order.status === "Shipped" ? "info" : "warning"} />
                    <p style={{ color: COLORS.primary, fontWeight: 700, marginTop: 4, fontSize: 14 }}>{fmt(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 style={{ color: textColor, marginBottom: 16 }}>My Orders</h2>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 60, marginBottom: 12 }}>📦</div>
                  <p style={{ color: textColor, fontSize: 16 }}>No orders yet</p>
                  <button onClick={() => setPage("products")} style={{ marginTop: 12, background: COLORS.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Start Shopping</button>
                </div>
              ) : orders.map((order) => (
                <div key={order.id || order.order_id} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "20px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <p style={{ color: textColor, fontWeight: 700, fontSize: 15 }}>{order.order_id || order.id}</p>
                      <p style={{ color: mutedColor, fontSize: 12 }}>Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : order.date}</p>
                    </div>
                    <Badge text={order.status} type={order.status === "Delivered" ? "success" : order.status === "Shipped" ? "info" : "warning"} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ color: textColor, fontSize: 14 }}>{order.payment_method ? `Payment: ${order.payment_method}` : order.product || "Multiple items"}</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: COLORS.primary, fontWeight: 700 }}>{fmt(order.total)}</span>
                      <button style={{ background: "none", border: `1px solid ${borderColor}`, color: textColor, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Track</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              <h2 style={{ color: textColor, marginBottom: 16 }}>My Wishlist ({wishlistProducts.length} items)</h2>
              {wishlistProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 60, marginBottom: 12 }}>❤️</div>
                  <p style={{ color: textColor, fontSize: 16 }}>Your wishlist is empty</p>
                  <button onClick={() => setPage("products")} style={{ marginTop: 12, background: COLORS.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Browse Products</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {wishlistProducts.map((p) => (
                    <div key={p.id} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 14, display: "flex", gap: 12 }}>
                      <div style={{ fontSize: 40 }}>{p.image}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: textColor, fontSize: 13, fontWeight: 600 }}>{p.name.slice(0, 30)}...</p>
                        <p style={{ color: COLORS.primary, fontWeight: 700, marginTop: 4 }}>{fmt(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div>
              <h2 style={{ color: textColor, marginBottom: 20 }}>Profile Settings</h2>
              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[["Full Name", "full_name", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"]].map(([label, key, type]) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, color: mutedColor, display: "block", marginBottom: 4 }}>{label}</label>
                      <input type={type} value={profileData[key]} onChange={(e) => setProfileData(d => ({ ...d, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,0.05)" : "#fff", color: textColor, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  style={{ marginTop: 20, background: savingProfile ? "#ccc" : COLORS.primary, color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, fontWeight: 700, cursor: savingProfile ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {savingProfile ? <><Spinner size={14} /> Saving…</> : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer({ darkMode, setPage }) {
  const bg = darkMode ? COLORS.secondary : "#1A1A2E";
  const mutedColor = "rgba(255,255,255,0.55)";

  return (
    <footer style={{ background: bg, padding: "40px 20px 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>🛍</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.primary, fontFamily: "Georgia, serif" }}>ShopSphere</span>
            </div>
            <p style={{ color: mutedColor, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>India's most trusted e-commerce platform. Quality products, unbeatable prices, and lightning-fast delivery.</p>
            <div style={{ display: "flex", gap: 10 }}>
              {["📘", "🐦", "📸", "▶️"].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>{icon}</div>
              ))}
            </div>
          </div>
          {[["Company", ["About Us", "Careers", "Press", "Blog", "Investors"]], ["Support", ["Help Center", "Returns", "Track Order", "Contact Us", "Live Chat"]], ["Policies", ["Privacy Policy", "Terms of Use", "Refund Policy", "Cookie Policy", "Sitemap"]], ["Sell", ["Sell on ShopSphere", "Vendor Portal", "Affiliate Program", "Advertise", "Partner API"]]].map(([title, links]) => (
            <div key={title}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{title}</p>
              {links.map((link) => (
                <p key={link} style={{ color: mutedColor, fontSize: 13, marginBottom: 8, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = mutedColor}>
                  {link}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: mutedColor, fontSize: 12 }}>© 2024 ShopSphere Technologies Pvt. Ltd. All rights reserved.</p>
          <div style={{ display: "flex", gap: 12 }}>
            {["💳", "🔷", "📱", "🏦"].map((icon, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", fontSize: 16 }}>{icon}</div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function ShopSphere() {
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Supabase data state ──
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ── Fetch products on mount ──
  useEffect(() => {
    (async () => {
      setLoadingProducts(true);
      try {
        const [rawProducts, rawCategories, rawBanners] = await Promise.all([
          supabase.get("products", "select=*&order=id.asc"),
          supabase.get("categories", "select=*&order=id.asc"),
          supabase.get("banners", "select=*&order=id.asc"),
        ]);

        setProducts(
          (rawProducts.length > 0 ? rawProducts : DEFAULT_PRODUCTS).map(normaliseProduct)
        );
        setCategories(rawCategories.length > 0 ? rawCategories : DEFAULT_CATEGORIES);
        if (rawBanners.length > 0) setBanners(rawBanners);
      } catch (e) {
        // Supabase tables may not exist yet — fall back to mock data silently
        setProducts(DEFAULT_PRODUCTS.map(normaliseProduct));
        setCategories(DEFAULT_CATEGORIES);
      }
      setLoadingProducts(false);
    })();
  }, []);

  // ── Fetch orders when user logs in ──
  useEffect(() => {
    if (!user || user.id === "demo") return;
    (async () => {
      try {
        const userOrders = await supabase.get("orders", `user_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc`);
        setOrders(userOrders);
      } catch (e) {
        setOrders([]);
      }
    })();
  }, [user]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + (product.qty || 1) } : i);
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
    showToast(`${product.name.slice(0, 30)}… added to cart!`, "success");
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      showToast(exists ? "Removed from wishlist" : "Added to wishlist ❤️", "info");
      return exists ? prev.filter((i) => i !== id) : [...prev, id];
    });
  };

  const handlePlaceOrder = async (orderData) => {
    await supabase.post("orders", orderData);
    setOrders(prev => [orderData, ...prev]);
  };

  const productDetailId = page.startsWith("product-") ? parseInt(page.split("-")[1]) : null;

  const sharedProductProps = { products, darkMode, onAddCart: addToCart, onWishlist: toggleWishlist, wishlist, setPage };

  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh" }}>
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {page !== "auth" && (
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} page={page} setPage={setPage} cart={cart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} user={user} />
      )}

      {page === "home" && (
        <HomePage {...sharedProductProps} categories={categories} banners={banners} loading={loadingProducts} setSearchQuery={setSearchQuery} />
      )}
      {page === "products" && (
        <ProductsPage {...sharedProductProps} categories={categories} loading={loadingProducts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}
      {productDetailId && (
        <ProductDetailPage {...sharedProductProps} productId={productDetailId} />
      )}
      {page === "cart" && (
        <CartPage darkMode={darkMode} cart={cart} setCart={setCart} setPage={setPage} />
      )}
      {page === "checkout" && (
        <CheckoutPage darkMode={darkMode} cart={cart} setCart={setCart} setPage={setPage} user={user} onPlaceOrder={handlePlaceOrder} />
      )}
      {page === "auth" && (
        <AuthPage darkMode={darkMode} setPage={setPage} setUser={setUser} showToast={showToast} />
      )}
      {(page === "dashboard" || page === "wishlist") && (
        <DashboardPage darkMode={darkMode} setPage={setPage} wishlist={wishlist} cart={cart} user={user} setUser={setUser} orders={orders} products={products} showToast={showToast} />
      )}

      {page !== "auth" && <Footer darkMode={darkMode} setPage={setPage} />}
    </div>
  );
}
