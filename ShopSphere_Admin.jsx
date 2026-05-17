import { useState, useEffect, useCallback } from "react";

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

const db = {
  async get(table, query = "") {
    const res = await fetch(`${SUPABASE_URL}/${table}?${query}`, { headers: HEADERS });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async post(table, body) {
    const res = await fetch(`${SUPABASE_URL}/${table}`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async patch(table, query, body) {
    const res = await fetch(`${SUPABASE_URL}/${table}?${query}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async delete(table, query) {
    const res = await fetch(`${SUPABASE_URL}/${table}?${query}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? [] : res.json();
  },
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  primary: "#FF6B35", primaryDark: "#E55A25",
  success: "#00C853", danger: "#FF3B30",
  info: "#0A84FF", warning: "#FF9500",
  dark: "#0D0D1A", darkCard: "#16213E", darkBorder: "#2A2A4A",
  sidebar: "#111827",
  lightBg: "#F4F6FB", lightCard: "#FFFFFF", lightBorder: "#E2E8F0",
};

const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Number(n).toLocaleString("en-IN")}`;

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Badge({ text, type = "primary" }) {
  const map = { primary: [C.primary,"#fff"], success: [C.success,"#fff"], info: [C.info,"#fff"], warning: [C.warning,"#fff"], danger: [C.danger,"#fff"] };
  const [bg, color] = map[type] || map.primary;
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{text}</span>;
}

function Spinner({ size = 20 }) {
  return (
    <div style={{ display:"inline-block", width:size, height:size, border:`2px solid rgba(255,107,53,0.2)`, borderTop:`2px solid ${C.primary}`, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type==="error"?C.danger:t.type==="info"?C.info:C.success, color:"#fff", padding:"12px 18px", borderRadius:10, fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", minWidth:260 }}>
          <span>{t.type==="error"?"❌":t.type==="info"?"ℹ️":"✅"}</span>
          <span style={{flex:1}}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div style={{ background:"#1A2035", border:"1px solid #2A2A4A", borderRadius:16, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto", animation:"fadeUp 0.2s ease" }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid #2A2A4A" }}>
          <h3 style={{ color:"#fff", margin:0, fontSize:17, fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#aaa", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#9090AA", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      {children}
      {error && <p style={{ color:C.danger, fontSize:11, marginTop:3 }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #2A2A4A",
  background:"rgba(255,255,255,0.05)", color:"#E8E8F0", fontSize:13,
  boxSizing:"border-box", outline:"none",
};

function Input({ ...props }) { return <input style={inputStyle} {...props} />; }
function Select({ children, ...props }) { return <select style={{ ...inputStyle, cursor:"pointer" }} {...props}>{children}</select>; }
function Textarea({ ...props }) { return <textarea style={{ ...inputStyle, resize:"vertical", minHeight:80 }} {...props} />; }

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel} width={380}>
      <p style={{ color:"#ccc", fontSize:14, marginBottom:24 }}>{message}</p>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onCancel} style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid #2A2A4A", background:"transparent", color:"#aaa", cursor:"pointer", fontWeight:600 }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:C.danger, color:"#fff", cursor:"pointer", fontWeight:700 }}>Delete</button>
      </div>
    </Modal>
  );
}

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = { name:"", category:"Electronics", brand:"", price:"", original_price:"", discount:"", rating:"4.5", reviews:"0", image:"🛍", badge:"NEW", in_stock:true, trending:false, description:"" };
const CATEGORIES_LIST = ["Electronics","Fashion","Mobiles","Laptops","Home","Grocery","Beauty","Books","Sports","Furniture","Toys","Drones"];
const BADGE_LIST = ["NEW","HOT","DEAL","BESTSELLER","PREMIUM","TRENDING","GAMING","COLLECTOR","50% OFF","ENERGY STAR","FLASH"];
const EMOJI_LIST = ["📱","💻","🎧","📺","👟","🌀","👖","🚁","🍲","🖥️","📖","🫧","💄","🧱","⚡","🎮","🏠","🛍","📷","🎯","🔋","🖱️"];

function ProductsTab({ dark, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const cb = dark ? C.darkCard : C.lightCard;
  const bc = dark ? C.darkBorder : C.lightBorder;

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await db.get("products", "select=*&order=id.asc")); }
    catch { showToast("Failed to load products", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    const matchS = !s || p.name.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s);
    const matchC = catFilter === "All" || p.category === catFilter;
    const matchSt = stockFilter === "All" || (stockFilter === "In Stock" ? p.in_stock : !p.in_stock);
    return matchS && matchC && matchSt;
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.brand.trim()) e.brand = "Required";
    if (!form.price || isNaN(form.price)) e.price = "Valid number required";
    if (!form.original_price || isNaN(form.original_price)) e.original_price = "Valid number required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(EMPTY_PRODUCT); setFormErrors({}); setEditId(null); setModal("add"); };
  const openEdit = (p) => {
    setForm({ name:p.name, category:p.category, brand:p.brand||"", price:p.price, original_price:p.original_price, discount:p.discount, rating:p.rating, reviews:p.reviews, image:p.image, badge:p.badge||"", in_stock:p.in_stock, trending:p.trending||false, description:p.description||"" });
    setFormErrors({}); setEditId(p.id); setModal("edit");
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, price: Number(form.price), original_price: Number(form.original_price), discount: Number(form.discount)||0, rating: Number(form.rating)||4.5, reviews: Number(form.reviews)||0 };
    try {
      if (modal === "add") {
        const [created] = await db.post("products", payload);
        setProducts(prev => [...prev, created]);
        showToast("Product added successfully!", "success");
      } else {
        const [updated] = await db.patch("products", `id=eq.${editId}`, payload);
        setProducts(prev => prev.map(p => p.id === editId ? updated : p));
        showToast("Product updated!", "success");
      }
      setModal(null);
    } catch { showToast("Save failed. Check Supabase RLS.", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    try {
      await db.delete("products", `id=eq.${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast("Product deleted.", "info");
    } catch { showToast("Delete failed.", "error"); }
    setConfirm(null);
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {confirm && <ConfirmDialog message={`Delete "${confirm.name}"? This cannot be undone.`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "➕ Add New Product" : "✏️ Edit Product"} onClose={() => setModal(null)} width={620}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <div style={{ gridColumn:"1/-1" }}><Field label="Product Name *" error={formErrors.name}><Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. iPhone 15 Pro Max" /></Field></div>
            <Field label="Brand *" error={formErrors.brand}><Input value={form.brand} onChange={e => f("brand", e.target.value)} placeholder="Apple" /></Field>
            <Field label="Category"><Select value={form.category} onChange={e => f("category", e.target.value)}>{CATEGORIES_LIST.map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Price (₹) *" error={formErrors.price}><Input type="number" value={form.price} onChange={e => f("price", e.target.value)} placeholder="134900" /></Field>
            <Field label="Original Price (₹) *" error={formErrors.original_price}><Input type="number" value={form.original_price} onChange={e => f("original_price", e.target.value)} placeholder="159900" /></Field>
            <Field label="Discount %"><Input type="number" value={form.discount} onChange={e => f("discount", e.target.value)} placeholder="16" /></Field>
            <Field label="Rating (0-5)"><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => f("rating", e.target.value)} /></Field>
            <Field label="Review Count"><Input type="number" value={form.reviews} onChange={e => f("reviews", e.target.value)} /></Field>
            <Field label="Badge"><Select value={form.badge} onChange={e => f("badge", e.target.value)}><option value="">None</option>{BADGE_LIST.map(b => <option key={b}>{b}</option>)}</Select></Field>
            <Field label="Image Emoji">
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                {EMOJI_LIST.map(em => <button key={em} onClick={() => f("image", em)} style={{ fontSize:20, background:form.image===em?"rgba(255,107,53,0.25)":"rgba(255,255,255,0.05)", border:`1px solid ${form.image===em?C.primary:"#2A2A4A"}`, borderRadius:8, padding:"4px 8px", cursor:"pointer" }}>{em}</button>)}
              </div>
            </Field>
            <div style={{ gridColumn:"1/-1" }}><Field label="Description"><Textarea value={form.description} onChange={e => f("description", e.target.value)} placeholder="Short product description..." /></Field></div>
            <Field label="In Stock">
              <div style={{ display:"flex", gap:12, marginTop:4 }}>
                {[true,false].map(v => <label key={String(v)} style={{ display:"flex", alignItems:"center", gap:6, color:"#ccc", fontSize:13, cursor:"pointer" }}><input type="radio" checked={form.in_stock===v} onChange={() => f("in_stock",v)} style={{ accentColor:C.primary }} />{v?"In Stock":"Out of Stock"}</label>)}
              </div>
            </Field>
            <Field label="Trending">
              <div style={{ display:"flex", gap:12, marginTop:4 }}>
                {[true,false].map(v => <label key={String(v)} style={{ display:"flex", alignItems:"center", gap:6, color:"#ccc", fontSize:13, cursor:"pointer" }}><input type="radio" checked={form.trending===v} onChange={() => f("trending",v)} style={{ accentColor:C.primary }} />{v?"Yes":"No"}</label>)}
              </div>
            </Field>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:"11px", borderRadius:8, border:"1px solid #2A2A4A", background:"transparent", color:"#aaa", cursor:"pointer", fontWeight:600 }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.primary, color:"#fff", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={16} /> Saving…</> : (modal==="add" ? "Add Product" : "Save Changes")}
            </button>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h2 style={{ color:tc, fontWeight:800, margin:0, fontSize:22 }}>🛍 Product Management</h2><p style={{ color:mc, fontSize:13, margin:"3px 0 0" }}>{products.length} products total</p></div>
        <button onClick={openAdd} style={{ background:C.primary, color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>+ Add Product</button>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products…" style={{ flex:1, minWidth:180, padding:"9px 14px", borderRadius:8, border:`1px solid ${bc}`, background:dark?"rgba(255,255,255,0.05)":"#fff", color:tc, fontSize:13, outline:"none" }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${bc}`, background:dark?C.darkCard:"#fff", color:tc, fontSize:13, cursor:"pointer" }}>
          <option>All</option>{CATEGORIES_LIST.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${bc}`, background:dark?C.darkCard:"#fff", color:tc, fontSize:13, cursor:"pointer" }}>
          {["All","In Stock","Out of Stock"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background:cb, border:`1px solid ${bc}`, borderRadius:14, overflow:"hidden" }}>
        {loading ? <div style={{ padding:60, textAlign:"center" }}><Spinner size={36} /></div> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:dark?"rgba(255,255,255,0.03)":"#F8F9FF" }}>
              {["Product","Category","Price","Stock","Rating","Trending","Actions"].map(h => <th key={h} style={{ textAlign:"left", padding:"11px 14px", color:mc, fontSize:11, textTransform:"uppercase", fontWeight:600, letterSpacing:"0.5px" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderTop:`1px solid ${bc}` }}>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:38, height:38, background:dark?"rgba(255,255,255,0.05)":"#F0F2FF", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{p.image}</div>
                      <div><p style={{ color:tc, fontSize:12, fontWeight:600, margin:0, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p><p style={{ color:mc, fontSize:11, margin:"2px 0 0" }}>{p.brand}</p></div>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12 }}>{p.category}</td>
                  <td style={{ padding:"11px 14px", color:C.primary, fontSize:13, fontWeight:700 }}>{fmt(p.price)}</td>
                  <td style={{ padding:"11px 14px" }}><Badge text={p.in_stock?"In Stock":"Out of Stock"} type={p.in_stock?"success":"danger"} /></td>
                  <td style={{ padding:"11px 14px", color:"#FFD700", fontSize:13, fontWeight:600 }}>{p.rating} ★</td>
                  <td style={{ padding:"11px 14px" }}><Badge text={p.trending?"Yes":"No"} type={p.trending?"info":"primary"} /></td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(p)} style={{ background:"rgba(10,132,255,0.1)", border:"none", color:C.info, padding:"5px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>✏️ Edit</button>
                      <button onClick={() => setConfirm(p)} style={{ background:"rgba(255,59,48,0.1)", border:"none", color:C.danger, padding:"5px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:mc }}>No products found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
const ORDER_STATUSES = ["Processing","Confirmed","Shipped","Delivered","Cancelled"];

function OrdersTab({ dark, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewOrder, setViewOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const cb = dark ? C.darkCard : C.lightCard;
  const bc = dark ? C.darkBorder : C.lightBorder;

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await db.get("orders", "select=*&order=created_at.desc")); }
    catch { showToast("Failed to load orders", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const matchS = !s || o.order_id?.toLowerCase().includes(s) || o.user_email?.toLowerCase().includes(s);
    const matchSt = statusFilter === "All" || o.status === statusFilter;
    return matchS && matchSt;
  });

  const updateStatus = async (order, status) => {
    setUpdatingId(order.id);
    try {
      await db.patch("orders", `id=eq.${order.id}`, { status });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
      if (viewOrder?.id === order.id) setViewOrder(prev => ({ ...prev, status }));
      showToast(`Order status updated to ${status}`, "success");
    } catch { showToast("Update failed.", "error"); }
    setUpdatingId(null);
  };

  const del = async (id) => {
    try {
      await db.delete("orders", `id=eq.${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
      showToast("Order deleted.", "info");
    } catch { showToast("Delete failed.", "error"); }
    setConfirm(null);
  };

  const statusColor = s => ({ Delivered:"success", Shipped:"info", Processing:"warning", Confirmed:"primary", Cancelled:"danger" }[s] || "primary");

  const exportCSV = () => {
    const rows = [["Order ID","Email","Total","Status","Payment","Date"],...filtered.map(o => [o.order_id, o.user_email, o.total, o.status, o.payment_method, new Date(o.created_at).toLocaleDateString()])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = "orders.csv"; a.click();
  };

  return (
    <div>
      {confirm && <ConfirmDialog message={`Delete order ${confirm.order_id}? This cannot be undone.`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {viewOrder && (
        <Modal title={`📦 Order Details — ${viewOrder.order_id}`} onClose={() => setViewOrder(null)} width={580}>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:14 }}>
              <p style={{ color:"#9090AA", fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>Customer</p>
              <p style={{ color:"#E8E8F0", margin:0 }}>{viewOrder.user_email}</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:14 }}>
              <p style={{ color:"#9090AA", fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>Shipping Address</p>
              {viewOrder.shipping_address && Object.keys(viewOrder.shipping_address).length > 0 ? (
                <div style={{ color:"#E8E8F0", fontSize:13 }}>
                  <p style={{ margin:"2px 0" }}>{viewOrder.shipping_address.firstName} {viewOrder.shipping_address.lastName}</p>
                  <p style={{ margin:"2px 0" }}>{viewOrder.shipping_address.address}</p>
                  <p style={{ margin:"2px 0" }}>{viewOrder.shipping_address.city}, {viewOrder.shipping_address.state} — {viewOrder.shipping_address.pincode}</p>
                  <p style={{ margin:"2px 0" }}>📞 {viewOrder.shipping_address.phone}</p>
                </div>
              ) : <p style={{ color:"#9090AA", fontSize:13 }}>N/A</p>}
            </div>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:14 }}>
              <p style={{ color:"#9090AA", fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>Items</p>
              {(Array.isArray(viewOrder.items) ? viewOrder.items : []).map((item, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", color:"#E8E8F0", fontSize:13, marginBottom:4 }}>
                  <span>{item.name} × {item.qty}</span><span style={{ color:C.primary, fontWeight:600 }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <div style={{ borderTop:"1px solid #2A2A4A", marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"#E8E8F0", fontWeight:700 }}>Total</span><span style={{ color:C.primary, fontWeight:800, fontSize:15 }}>{fmt(viewOrder.total)}</span>
              </div>
            </div>
            <div>
              <p style={{ color:"#9090AA", fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>Update Status</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ORDER_STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(viewOrder, s)} disabled={updatingId===viewOrder.id}
                    style={{ padding:"7px 14px", borderRadius:8, border:`1.5px solid ${viewOrder.status===s?C.primary:"#2A2A4A"}`, background:viewOrder.status===s?"rgba(255,107,53,0.15)":"transparent", color:viewOrder.status===s?C.primary:"#aaa", fontWeight:600, cursor:"pointer", fontSize:12 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h2 style={{ color:tc, fontWeight:800, margin:0, fontSize:22 }}>📦 Order Management</h2><p style={{ color:mc, fontSize:13, margin:"3px 0 0" }}>{orders.length} total orders</p></div>
        <button onClick={exportCSV} style={{ background:"none", border:`1px solid ${bc}`, color:tc, padding:"9px 18px", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600 }}>⬇ Export CSV</button>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by order ID or email…" style={{ flex:1, minWidth:200, padding:"9px 14px", borderRadius:8, border:`1px solid ${bc}`, background:dark?"rgba(255,255,255,0.05)":"#fff", color:tc, fontSize:13, outline:"none" }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${bc}`, background:dark?C.darkCard:"#fff", color:tc, fontSize:13, cursor:"pointer" }}>
          <option>All</option>{ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background:cb, border:`1px solid ${bc}`, borderRadius:14, overflow:"hidden" }}>
        {loading ? <div style={{ padding:60, textAlign:"center" }}><Spinner size={36} /></div> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:dark?"rgba(255,255,255,0.03)":"#F8F9FF" }}>
              {["Order ID","Customer","Total","Payment","Status","Date","Actions"].map(h => <th key={h} style={{ textAlign:"left", padding:"11px 14px", color:mc, fontSize:11, textTransform:"uppercase", fontWeight:600, letterSpacing:"0.5px" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderTop:`1px solid ${bc}` }}>
                  <td style={{ padding:"11px 14px", color:C.primary, fontSize:12, fontWeight:700 }}>{o.order_id}</td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.user_email}</td>
                  <td style={{ padding:"11px 14px", color:tc, fontSize:13, fontWeight:600 }}>{fmt(o.total)}</td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12, textTransform:"uppercase" }}>{o.payment_method}</td>
                  <td style={{ padding:"11px 14px" }}><Badge text={o.status} type={statusColor(o.status)} /></td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12 }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => setViewOrder(o)} style={{ background:"rgba(10,132,255,0.1)", border:"none", color:C.info, padding:"5px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>👁 View</button>
                      <button onClick={() => setConfirm(o)} style={{ background:"rgba(255,59,48,0.1)", border:"none", color:C.danger, padding:"5px 10px", borderRadius:6, cursor:"pointer", fontSize:12 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:mc }}>No orders found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
const EMPTY_USER = { full_name:"", email:"", password:"", phone:"", role:"customer" };

function UsersTab({ dark, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const cb = dark ? C.darkCard : C.lightCard;
  const bc = dark ? C.darkBorder : C.lightBorder;

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await db.get("users", "select=*&order=created_at.desc")); }
    catch { showToast("Failed to load users", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return !s || u.email?.toLowerCase().includes(s) || u.full_name?.toLowerCase().includes(s);
  });

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (modal === "add" && !form.password.trim()) e.password = "Required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(EMPTY_USER); setFormErrors({}); setEditId(null); setModal("add"); };
  const openEdit = (u) => { setForm({ full_name:u.full_name||"", email:u.email, password:"", phone:u.phone||"", role:u.role||"customer" }); setFormErrors({}); setEditId(u.id); setModal("edit"); };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (modal === "edit" && !payload.password) delete payload.password;
      if (modal === "add") {
        const [created] = await db.post("users", payload);
        setUsers(prev => [created, ...prev]);
        showToast("User created!", "success");
      } else {
        const [updated] = await db.patch("users", `id=eq.${editId}`, payload);
        setUsers(prev => prev.map(u => u.id === editId ? updated : u));
        showToast("User updated!", "success");
      }
      setModal(null);
    } catch { showToast("Save failed.", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    try {
      await db.delete("users", `id=eq.${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("User deleted.", "info");
    } catch { showToast("Delete failed.", "error"); }
    setConfirm(null);
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {confirm && <ConfirmDialog message={`Delete user "${confirm.email}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "➕ Add User" : "✏️ Edit User"} onClose={() => setModal(null)} width={480}>
          <Field label="Full Name"><Input value={form.full_name} onChange={e => f("full_name", e.target.value)} placeholder="John Doe" /></Field>
          <Field label="Email *" error={formErrors.email}><Input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="john@example.com" /></Field>
          <Field label={modal==="add"?"Password *":"New Password (leave blank to keep)"} error={formErrors.password}><Input type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder="••••••••" /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="9876543210" /></Field>
          <Field label="Role"><Select value={form.role} onChange={e => f("role", e.target.value)}><option value="customer">Customer</option><option value="admin">Admin</option></Select></Field>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:"11px", borderRadius:8, border:"1px solid #2A2A4A", background:"transparent", color:"#aaa", cursor:"pointer", fontWeight:600 }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.primary, color:"#fff", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={16} /> Saving…</> : (modal==="add"?"Add User":"Save Changes")}
            </button>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h2 style={{ color:tc, fontWeight:800, margin:0, fontSize:22 }}>👥 User Management</h2><p style={{ color:mc, fontSize:13, margin:"3px 0 0" }}>{users.length} registered users</p></div>
        <button onClick={openAdd} style={{ background:C.primary, color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>+ Add User</button>
      </div>

      <div style={{ marginBottom:14 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email…" style={{ width:"100%", padding:"9px 14px", borderRadius:8, border:`1px solid ${bc}`, background:dark?"rgba(255,255,255,0.05)":"#fff", color:tc, fontSize:13, outline:"none", boxSizing:"border-box" }} />
      </div>

      <div style={{ background:cb, border:`1px solid ${bc}`, borderRadius:14, overflow:"hidden" }}>
        {loading ? <div style={{ padding:60, textAlign:"center" }}><Spinner size={36} /></div> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:dark?"rgba(255,255,255,0.03)":"#F8F9FF" }}>
              {["User","Email","Phone","Role","Joined","Actions"].map(h => <th key={h} style={{ textAlign:"left", padding:"11px 14px", color:mc, fontSize:11, textTransform:"uppercase", fontWeight:600, letterSpacing:"0.5px" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop:`1px solid ${bc}` }}>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.primary},${C.info})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0 }}>{(u.full_name||u.email||"?")[0].toUpperCase()}</div>
                      <span style={{ color:tc, fontSize:13, fontWeight:600 }}>{u.full_name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12 }}>{u.email}</td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12 }}>{u.phone || "—"}</td>
                  <td style={{ padding:"11px 14px" }}><Badge text={u.role||"customer"} type={u.role==="admin"?"danger":"info"} /></td>
                  <td style={{ padding:"11px 14px", color:mc, fontSize:12 }}>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(u)} style={{ background:"rgba(10,132,255,0.1)", border:"none", color:C.info, padding:"5px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>✏️ Edit</button>
                      <button onClick={() => setConfirm(u)} style={{ background:"rgba(255,59,48,0.1)", border:"none", color:C.danger, padding:"5px 10px", borderRadius:6, cursor:"pointer", fontSize:12 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:mc }}>No users found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── BANNERS TAB ──────────────────────────────────────────────────────────────
const EMPTY_BANNER = { title:"", subtitle:"", cta:"Shop Now", bg:"linear-gradient(135deg, #FF6B35 0%, #FF3B30 50%, #1A1A2E 100%)", accent:"#FFD700", emoji:"⚡", active:true, sort_order:0 };
const GRADIENT_PRESETS = [
  { label:"Fire", value:"linear-gradient(135deg, #FF6B35 0%, #FF3B30 50%, #1A1A2E 100%)" },
  { label:"Ocean", value:"linear-gradient(135deg, #0A84FF 0%, #1A1A2E 60%, #0D0D1A 100%)" },
  { label:"Rose", value:"linear-gradient(135deg, #E91E63 0%, #9C27B0 60%, #1A1A2E 100%)" },
  { label:"Forest", value:"linear-gradient(135deg, #00C853 0%, #1A2E1A 60%, #0D0D1A 100%)" },
  { label:"Gold", value:"linear-gradient(135deg, #FFD700 0%, #FF9500 50%, #1A1A2E 100%)" },
  { label:"Dark", value:"linear-gradient(135deg, #2A2A4A 0%, #0D0D1A 100%)" },
];

function BannersTab({ dark, showToast }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const bc = dark ? C.darkBorder : C.lightBorder;

  const load = useCallback(async () => {
    setLoading(true);
    try { setBanners(await db.get("banners", "select=*&order=sort_order.asc")); }
    catch { showToast("Failed to load banners", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_BANNER); setEditId(null); setModal("edit"); };
  const openEdit = (b) => { setForm({ title:b.title, subtitle:b.subtitle||"", cta:b.cta||"Shop Now", bg:b.bg, accent:b.accent||"#FFD700", emoji:b.emoji||"⚡", active:b.active!==false, sort_order:b.sort_order||0 }); setEditId(b.id); setModal("edit"); };

  const save = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      if (!editId) {
        const [created] = await db.post("banners", form);
        setBanners(prev => [...prev, created]);
        showToast("Banner created!", "success");
      } else {
        const [updated] = await db.patch("banners", `id=eq.${editId}`, form);
        setBanners(prev => prev.map(b => b.id === editId ? updated : b));
        showToast("Banner updated!", "success");
      }
      setModal(null);
    } catch { showToast("Save failed.", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    try {
      await db.delete("banners", `id=eq.${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
      showToast("Banner deleted.", "info");
    } catch { showToast("Delete failed.", "error"); }
    setConfirm(null);
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {confirm && <ConfirmDialog message={`Delete banner "${confirm.title}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {modal === "edit" && (
        <Modal title={editId ? "✏️ Edit Banner" : "➕ Create Banner"} onClose={() => setModal(null)} width={560}>
          {/* Live preview */}
          <div style={{ background:form.bg, borderRadius:12, padding:"20px 24px", marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ color:"#fff", fontWeight:800, fontSize:18, margin:"0 0 4px" }}>{form.title||"Banner Title"}</p>
              <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, margin:0 }}>{form.subtitle||"Subtitle text"}</p>
              <button style={{ marginTop:10, background:form.accent, color:"#1A1A2E", border:"none", padding:"6px 16px", borderRadius:6, fontWeight:700, fontSize:12, cursor:"default" }}>{form.cta}</button>
            </div>
            <span style={{ fontSize:48 }}>{form.emoji}</span>
          </div>

          <Field label="Title *"><Input value={form.title} onChange={e => f("title", e.target.value)} placeholder="Mega Sale" /></Field>
          <Field label="Subtitle"><Input value={form.subtitle} onChange={e => f("subtitle", e.target.value)} placeholder="Up to 70% OFF on Electronics" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="CTA Button Text"><Input value={form.cta} onChange={e => f("cta", e.target.value)} placeholder="Shop Now" /></Field>
            <Field label="Emoji"><Input value={form.emoji} onChange={e => f("emoji", e.target.value)} placeholder="⚡" /></Field>
            <Field label="Accent Color"><input type="color" value={form.accent} onChange={e => f("accent", e.target.value)} style={{ width:"100%", height:38, borderRadius:8, border:"1px solid #2A2A4A", background:"none", cursor:"pointer", padding:2 }} /></Field>
            <Field label="Sort Order"><Input type="number" value={form.sort_order} onChange={e => f("sort_order", Number(e.target.value))} /></Field>
          </div>
          <Field label="Background Gradient">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
              {GRADIENT_PRESETS.map(p => <button key={p.label} onClick={() => f("bg", p.value)} style={{ background:p.value, border:`2px solid ${form.bg===p.value?C.primary:"transparent"}`, borderRadius:8, padding:"4px 12px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>{p.label}</button>)}
            </div>
            <Input value={form.bg} onChange={e => f("bg", e.target.value)} placeholder="linear-gradient(...)" />
          </Field>
          <Field label="Active">
            <div style={{ display:"flex", gap:12, marginTop:4 }}>
              {[true,false].map(v => <label key={String(v)} style={{ display:"flex", alignItems:"center", gap:6, color:"#ccc", fontSize:13, cursor:"pointer" }}><input type="radio" checked={form.active===v} onChange={() => f("active",v)} style={{ accentColor:C.primary }} />{v?"Active":"Hidden"}</label>)}
            </div>
          </Field>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:"11px", borderRadius:8, border:"1px solid #2A2A4A", background:"transparent", color:"#aaa", cursor:"pointer", fontWeight:600 }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.primary, color:"#fff", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={16} /> Saving…</> : (editId?"Save Changes":"Create Banner")}
            </button>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h2 style={{ color:tc, fontWeight:800, margin:0, fontSize:22 }}>🖼 Banner Management</h2><p style={{ color:mc, fontSize:13, margin:"3px 0 0" }}>Manage homepage promotional banners</p></div>
        <button onClick={openAdd} style={{ background:C.primary, color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>+ Create Banner</button>
      </div>

      {loading ? <div style={{ padding:60, textAlign:"center" }}><Spinner size={36} /></div> : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {banners.map(b => (
            <div key={b.id} style={{ background:b.bg, borderRadius:16, padding:"22px 26px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", opacity:b.active===false?0.5:1 }}>
              <div>
                {b.active===false && <Badge text="Hidden" type="warning" />}
                <p style={{ color:"#fff", fontWeight:800, fontSize:18, margin:"4px 0 4px" }}>{b.title}</p>
                <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, margin:0 }}>{b.subtitle}</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:36 }}>{b.emoji}</span>
                <button onClick={() => openEdit(b)} style={{ background:"rgba(255,255,255,0.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:12 }}>✏️ Edit</button>
                <button onClick={() => setConfirm(b)} style={{ background:"rgba(255,59,48,0.3)", border:"1px solid rgba(255,59,48,0.4)", color:"#fff", padding:"7px 14px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:12 }}>🗑</button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <div style={{ padding:60, textAlign:"center", color:mc }}>No banners found. Create one!</div>}
        </div>
      )}
    </div>
  );
}

// ─── COUPONS TAB ──────────────────────────────────────────────────────────────
const EMPTY_COUPON = { code:"", discount:"", type:"percent", applies_to:"All Products", max_uses:"1000", valid_until:"", active:true };

function CouponsTab({ dark, showToast }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const cb = dark ? C.darkCard : C.lightCard;
  const bc = dark ? C.darkBorder : C.lightBorder;

  const load = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await db.get("coupons", "select=*&order=created_at.desc")); }
    catch { showToast("Failed to load coupons", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Required";
    if (!form.discount || isNaN(form.discount)) e.discount = "Valid number required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(EMPTY_COUPON); setFormErrors({}); setEditId(null); setModal("edit"); };
  const openEdit = (c) => { setForm({ code:c.code, discount:c.discount, type:c.type||"percent", applies_to:c.applies_to||"All Products", max_uses:c.max_uses||1000, valid_until:c.valid_until||"", active:c.active!==false }); setFormErrors({}); setEditId(c.id); setModal("edit"); };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, code:form.code.toUpperCase().trim(), discount:Number(form.discount), max_uses:Number(form.max_uses)||1000, valid_until:form.valid_until||null };
    try {
      if (!editId) {
        const [created] = await db.post("coupons", payload);
        setCoupons(prev => [created, ...prev]);
        showToast("Coupon created!", "success");
      } else {
        const [updated] = await db.patch("coupons", `id=eq.${editId}`, payload);
        setCoupons(prev => prev.map(c => c.id === editId ? updated : c));
        showToast("Coupon updated!", "success");
      }
      setModal(null);
    } catch { showToast("Save failed. Code may already exist.", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    try {
      await db.delete("coupons", `id=eq.${id}`);
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast("Coupon deleted.", "info");
    } catch { showToast("Delete failed.", "error"); }
    setConfirm(null);
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {confirm && <ConfirmDialog message={`Delete coupon "${confirm.code}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {modal === "edit" && (
        <Modal title={editId ? "✏️ Edit Coupon" : "➕ Create Coupon"} onClose={() => setModal(null)} width={480}>
          <Field label="Coupon Code *" error={formErrors.code}><Input value={form.code} onChange={e => f("code", e.target.value.toUpperCase())} placeholder="SPHERE20" style={{ ...inputStyle, letterSpacing:2, fontWeight:700 }} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Discount Value *" error={formErrors.discount}><Input type="number" value={form.discount} onChange={e => f("discount", e.target.value)} placeholder="20" /></Field>
            <Field label="Type"><Select value={form.type} onChange={e => f("type", e.target.value)}><option value="percent">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></Select></Field>
            <Field label="Max Uses"><Input type="number" value={form.max_uses} onChange={e => f("max_uses", e.target.value)} placeholder="1000" /></Field>
            <Field label="Valid Until"><Input type="date" value={form.valid_until} onChange={e => f("valid_until", e.target.value)} /></Field>
          </div>
          <Field label="Applies To"><Select value={form.applies_to} onChange={e => f("applies_to", e.target.value)}>
            {["All Products","First Order","Electronics","Fashion","Mobiles","Laptops","Home","Beauty","Books","Sports","Toys","Drones"].map(o => <option key={o}>{o}</option>)}
          </Select></Field>
          <Field label="Status">
            <div style={{ display:"flex", gap:12, marginTop:4 }}>
              {[true,false].map(v => <label key={String(v)} style={{ display:"flex", alignItems:"center", gap:6, color:"#ccc", fontSize:13, cursor:"pointer" }}><input type="radio" checked={form.active===v} onChange={() => f("active",v)} style={{ accentColor:C.primary }} />{v?"Active":"Inactive"}</label>)}
            </div>
          </Field>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:"11px", borderRadius:8, border:"1px solid #2A2A4A", background:"transparent", color:"#aaa", cursor:"pointer", fontWeight:600 }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.primary, color:"#fff", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={16} /> Saving…</> : (editId?"Save Changes":"Create Coupon")}
            </button>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h2 style={{ color:tc, fontWeight:800, margin:0, fontSize:22 }}>🎫 Coupon Management</h2><p style={{ color:mc, fontSize:13, margin:"3px 0 0" }}>{coupons.length} coupons total</p></div>
        <button onClick={openAdd} style={{ background:C.primary, color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>+ Create Coupon</button>
      </div>

      <div style={{ background:cb, border:`1px solid ${bc}`, borderRadius:14, overflow:"hidden" }}>
        {loading ? <div style={{ padding:60, textAlign:"center" }}><Spinner size={36} /></div> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:dark?"rgba(255,255,255,0.03)":"#F8F9FF" }}>
              {["Code","Discount","Type","Applies To","Usage","Valid Until","Status","Actions"].map(h => <th key={h} style={{ textAlign:"left", padding:"11px 14px", color:mc, fontSize:11, textTransform:"uppercase", fontWeight:600, letterSpacing:"0.5px" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderTop:`1px solid ${bc}` }}>
                  <td style={{ padding:"12px 14px" }}><code style={{ background:dark?"rgba(255,107,53,0.15)":"rgba(255,107,53,0.08)", color:C.primary, padding:"4px 10px", borderRadius:6, fontSize:13, fontWeight:700 }}>{c.code}</code></td>
                  <td style={{ padding:"12px 14px", color:C.success, fontSize:13, fontWeight:700 }}>{c.discount}{c.type==="percent"?"%":"₹"}</td>
                  <td style={{ padding:"12px 14px", color:mc, fontSize:12, textTransform:"capitalize" }}>{c.type}</td>
                  <td style={{ padding:"12px 14px", color:mc, fontSize:12 }}>{c.applies_to}</td>
                  <td style={{ padding:"12px 14px", color:tc, fontSize:12 }}>{(c.used_count||0).toLocaleString()} / {(c.max_uses||0).toLocaleString()}</td>
                  <td style={{ padding:"12px 14px", color:mc, fontSize:12 }}>{c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-IN") : "No expiry"}</td>
                  <td style={{ padding:"12px 14px" }}><Badge text={c.active?"Active":"Inactive"} type={c.active?"success":"danger"} /></td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(c)} style={{ background:"rgba(10,132,255,0.1)", border:"none", color:C.info, padding:"5px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>✏️ Edit</button>
                      <button onClick={() => setConfirm(c)} style={{ background:"rgba(255,59,48,0.1)", border:"none", color:C.danger, padding:"5px 10px", borderRadius:6, cursor:"pointer", fontSize:12 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:mc }}>No coupons yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
const EMPTY_CAT = { name:"", icon:"🛒", color:"#FF6B35", count:0 };

function CategoriesTab({ dark, showToast }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const bc = dark ? C.darkBorder : C.lightBorder;

  const load = useCallback(async () => {
    setLoading(true);
    try { setCats(await db.get("categories", "select=*&order=id.asc")); }
    catch { showToast("Failed to load categories", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_CAT); setEditId(null); setModal("edit"); };
  const openEdit = (c) => { setForm({ name:c.name, icon:c.icon, color:c.color, count:c.count||0 }); setEditId(c.id); setModal("edit"); };

  const save = async () => {
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    setSaving(true);
    try {
      if (!editId) {
        const [created] = await db.post("categories", { ...form, count:Number(form.count)||0 });
        setCats(prev => [...prev, created]);
        showToast("Category created!", "success");
      } else {
        const [updated] = await db.patch("categories", `id=eq.${editId}`, { ...form, count:Number(form.count)||0 });
        setCats(prev => prev.map(c => c.id === editId ? updated : c));
        showToast("Category updated!", "success");
      }
      setModal(null);
    } catch { showToast("Save failed.", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    try {
      await db.delete("categories", `id=eq.${id}`);
      setCats(prev => prev.filter(c => c.id !== id));
      showToast("Category deleted.", "info");
    } catch { showToast("Delete failed.", "error"); }
    setConfirm(null);
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {confirm && <ConfirmDialog message={`Delete category "${confirm.name}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {modal === "edit" && (
        <Modal title={editId ? "✏️ Edit Category" : "➕ Add Category"} onClose={() => setModal(null)} width={420}>
          <Field label="Category Name *"><Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="Electronics" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
            <Field label="Icon Emoji"><Input value={form.icon} onChange={e => f("icon", e.target.value)} placeholder="⚡" /></Field>
            <Field label="Color"><input type="color" value={form.color} onChange={e => f("color", e.target.value)} style={{ width:"100%", height:38, borderRadius:8, border:"1px solid #2A2A4A", background:"none", cursor:"pointer", padding:2 }} /></Field>
            <Field label="Count"><Input type="number" value={form.count} onChange={e => f("count", e.target.value)} /></Field>
          </div>
          {/* Preview */}
          <div style={{ background:form.color+"22", border:`1px solid ${form.color}44`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <span style={{ fontSize:28 }}>{form.icon}</span>
            <div><p style={{ color:"#E8E8F0", fontWeight:700, margin:0 }}>{form.name||"Category Name"}</p><p style={{ color:"#9090AA", fontSize:12, margin:0 }}>{form.count||0} products</p></div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:"11px", borderRadius:8, border:"1px solid #2A2A4A", background:"transparent", color:"#aaa", cursor:"pointer", fontWeight:600 }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:C.primary, color:"#fff", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={16} /> Saving…</> : (editId?"Save Changes":"Add Category")}
            </button>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h2 style={{ color:tc, fontWeight:800, margin:0, fontSize:22 }}>🗂 Category Management</h2><p style={{ color:mc, fontSize:13, margin:"3px 0 0" }}>{cats.length} categories</p></div>
        <button onClick={openAdd} style={{ background:C.primary, color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>+ Add Category</button>
      </div>

      {loading ? <div style={{ padding:60, textAlign:"center" }}><Spinner size={36} /></div> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:14 }}>
          {cats.map(c => (
            <div key={c.id} style={{ background:dark?C.darkCard:C.lightCard, border:`1px solid ${bc}`, borderRadius:14, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ width:48, height:48, borderRadius:12, background:c.color+"22", border:`1px solid ${c.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{c.icon}</div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => openEdit(c)} style={{ background:"rgba(10,132,255,0.1)", border:"none", color:C.info, padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:600 }}>Edit</button>
                  <button onClick={() => setConfirm(c)} style={{ background:"rgba(255,59,48,0.1)", border:"none", color:C.danger, padding:"4px 8px", borderRadius:6, cursor:"pointer", fontSize:11 }}>🗑</button>
                </div>
              </div>
              <div>
                <p style={{ color:tc, fontWeight:700, margin:"0 0 2px", fontSize:14 }}>{c.name}</p>
                <p style={{ color:mc, fontSize:12, margin:0 }}>{(c.count||0).toLocaleString()} products</p>
              </div>
              <div style={{ height:3, background:c.color, borderRadius:2, opacity:0.6 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ dark, showToast }) {
  const [stats, setStats] = useState({ orders:0, revenue:0, users:0, products:0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const tc = dark ? "#E8E8F0" : "#1A1A2E";
  const mc = dark ? "#9090AA" : "#666";
  const cb = dark ? C.darkCard : C.lightCard;
  const bc = dark ? C.darkBorder : C.lightBorder;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [orders, users, products] = await Promise.all([
          db.get("orders","select=total,status,created_at,order_id,user_email&order=created_at.desc"),
          db.get("users","select=id"),
          db.get("products","select=id"),
        ]);
        const revenue = orders.reduce((s,o) => s + Number(o.total||0), 0);
        setStats({ orders:orders.length, revenue, users:users.length, products:products.length });
        setRecentOrders(orders.slice(0,8));
      } catch { showToast("Failed to load stats","error"); }
      setLoading(false);
    })();
  }, [showToast]);

  const statusColor = s => ({ Delivered:"success", Shipped:"info", Processing:"warning", Confirmed:"primary", Cancelled:"danger" }[s]||"primary");

  const statCards = [
    { label:"Total Revenue", value:fmt(stats.revenue), icon:"💰", color:C.primary },
    { label:"Total Orders",  value:stats.orders.toLocaleString(), icon:"📦", color:C.info },
    { label:"Registered Users", value:stats.users.toLocaleString(), icon:"👥", color:C.success },
    { label:"Products Listed", value:stats.products.toLocaleString(), icon:"🛍", color:C.warning },
  ];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ color:tc, fontWeight:800, margin:"0 0 4px", fontSize:22 }}>📊 Dashboard Overview</h2>
        <p style={{ color:mc, fontSize:13, margin:0 }}>Live data from Supabase</p>
      </div>

      {loading ? <div style={{ padding:80, textAlign:"center" }}><Spinner size={40} /></div> : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background:cb, border:`1px solid ${bc}`, borderRadius:14, padding:18, boxShadow:dark?"none":"0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <p style={{ color:mc, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", margin:0 }}>{s.label}</p>
                  <span style={{ fontSize:22 }}>{s.icon}</span>
                </div>
                <p style={{ color:s.color, fontSize:26, fontWeight:800, margin:0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background:cb, border:`1px solid ${bc}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${bc}` }}>
              <h3 style={{ color:tc, margin:0, fontWeight:700, fontSize:16 }}>Recent Orders</h3>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr style={{ background:dark?"rgba(255,255,255,0.03)":"#F8F9FF" }}>
                {["Order ID","Customer","Amount","Status","Date"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 16px", color:mc, fontSize:11, textTransform:"uppercase", fontWeight:600, letterSpacing:"0.5px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.order_id} style={{ borderTop:`1px solid ${bc}` }}>
                    <td style={{ padding:"11px 16px", color:C.primary, fontSize:12, fontWeight:700 }}>{o.order_id}</td>
                    <td style={{ padding:"11px 16px", color:mc, fontSize:12 }}>{o.user_email}</td>
                    <td style={{ padding:"11px 16px", color:tc, fontWeight:600, fontSize:13 }}>{fmt(o.total)}</td>
                    <td style={{ padding:"11px 16px" }}><Badge text={o.status} type={statusColor(o.status)} /></td>
                    <td style={{ padding:"11px 16px", color:mc, fontSize:12 }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
                {recentOrders.length===0 && <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:mc }}>No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [dark, setDark] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type="success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const bg = dark ? C.dark : C.lightBg;

  const tabs = [
    ["overview",   "📊", "Overview"],
    ["products",   "🛍", "Products"],
    ["orders",     "📦", "Orders"],
    ["users",      "👥", "Users"],
    ["banners",    "🖼", "Banners"],
    ["coupons",    "🎫", "Coupons"],
    ["categories", "🗂", "Categories"],
  ];

  const tabProps = { dark, showToast };

  return (
    <div style={{ fontFamily:"'Segoe UI',-apple-system,sans-serif", background:bg, minHeight:"100vh", display:"grid", gridTemplateColumns:"220px 1fr" }}>
      <Toast toasts={toasts} remove={removeToast} />

      {/* ── Sidebar ── */}
      <div style={{ background:C.sidebar, padding:"20px 14px", minHeight:"100vh", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize:22 }}>🛍</span>
          <div><p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:0 }}>ShopSphere</p><p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, margin:0 }}>Admin Panel</p></div>
        </div>

        <div style={{ flex:1 }}>
          {tabs.map(([key, icon, label]) => (
            <div key={key} onClick={() => setTab(key)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", marginBottom:3, background:tab===key?"rgba(255,107,53,0.18)":"transparent", color:tab===key?C.primary:"rgba(255,255,255,0.55)", fontWeight:tab===key?700:400, fontSize:13, transition:"all 0.15s", borderLeft:tab===key?`3px solid ${C.primary}`:"3px solid transparent" }}>
              <span style={{ fontSize:15 }}>{icon}</span> {label}
            </div>
          ))}
        </div>

        <div style={{ paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:2 }}>
          <div onClick={() => setDark(!dark)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:13 }}>
            <span>{dark?"☀️":"🌙"}</span> {dark?"Light Mode":"Dark Mode"}
          </div>
          <a href="/" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:13, textDecoration:"none" }}>
            <span>🏠</span> Back to Store
          </a>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding:"28px 30px", overflowY:"auto", minHeight:"100vh" }}>
        {tab === "overview"   && <OverviewTab    {...tabProps} />}
        {tab === "products"   && <ProductsTab    {...tabProps} />}
        {tab === "orders"     && <OrdersTab      {...tabProps} />}
        {tab === "users"      && <UsersTab       {...tabProps} />}
        {tab === "banners"    && <BannersTab     {...tabProps} />}
        {tab === "coupons"    && <CouponsTab     {...tabProps} />}
        {tab === "categories" && <CategoriesTab  {...tabProps} />}
      </div>
    </div>
  );
}
