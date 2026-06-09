import { useState, useEffect, createContext, useContext } from "react";

// ── CONFIG ────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8080/api";

// ── AUTH CONTEXT ──────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ── API HELPERS ───────────────────────────────────────────────────
const api = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── ICONS (SVG inline) ─────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const paths = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    income: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z",
    expense: "M20 6H16V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    add: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    wallet: "M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z",
    trend_up: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
    trend_down: "M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z",
    calendar: "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
    user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={paths[name] || paths.check} />
    </svg>
  );
};

// ── TOAST ──────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div style={{
    position:"fixed", bottom:24, right:24, zIndex:9999,
    background: type==="error" ? "#EF4444" : "#10B981",
    color:"#fff", padding:"12px 20px", borderRadius:10,
    boxShadow:"0 8px 24px rgba(0,0,0,0.2)", fontSize:14,
    display:"flex", alignItems:"center", gap:10, minWidth:260,
    animation:"slideIn .25s ease"
  }}>
    <Icon name={type==="error"?"close":"check"} size={18} />
    <span style={{flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#fff",padding:0}}>
      <Icon name="close" size={16} />
    </button>
  </div>
);

// ── AUTH PAGES ─────────────────────────────────────────────────────
const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const res = await api(path, { method:"POST", body: JSON.stringify(body) });
      onAuth(res.data);
    } catch(err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#0F172A 0%,#1E3A5F 60%,#0F172A 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input{outline:none}
        @keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        .btn-primary{transition:all .2s;cursor:pointer}
        .btn-primary:hover{opacity:.9;transform:translateY(-1px)}
        .input-field:focus{border-color:#3B82F6!important;box-shadow:0 0 0 3px rgba(59,130,246,.15)!important}
      `}</style>

      <div style={{width:"100%", maxWidth:440, padding:24}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:36}}>
          <div style={{width:60,height:60,background:"linear-gradient(135deg,#3B82F6,#6366F1)",borderRadius:16,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:"0 8px 24px rgba(99,102,241,.4)"}}>
            <Icon name="wallet" size={30} color="#fff" />
          </div>
          <h1 style={{color:"#fff",fontSize:28,fontWeight:700,letterSpacing:-.5}}>ExpenseTracker</h1>
          <p style={{color:"#94A3B8",marginTop:6,fontSize:14}}>Smart personal finance management</p>
        </div>

        <div style={{background:"rgba(255,255,255,.05)",backdropFilter:"blur(20px)",borderRadius:20,padding:36,border:"1px solid rgba(255,255,255,.1)",animation:"fadeUp .4s ease"}}>
          {/* Tabs */}
          <div style={{display:"flex",background:"rgba(255,255,255,.08)",borderRadius:10,padding:4,marginBottom:28}}>
            {["login","register"].map(m => (
              <button key={m} onClick={()=>{setMode(m);setError("");}}
                style={{flex:1,padding:"10px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"Inter,sans-serif",transition:"all .2s",
                  background:mode===m?"#3B82F6":"transparent",color:mode===m?"#fff":"#94A3B8"}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#FCA5A5",fontSize:13}}>
              {error}
            </div>
          )}

          <form onSubmit={handle}>
            {mode==="register" && (
              <div style={{marginBottom:16}}>
                <label style={{color:"#94A3B8",fontSize:12,fontWeight:500,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Full Name</label>
                <input className="input-field" placeholder="John Doe" value={form.name}
                  onChange={e=>setForm({...form,name:e.target.value})} required
                  style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,color:"#fff",fontSize:14,fontFamily:"Inter,sans-serif",transition:"all .2s"}} />
              </div>
            )}
            <div style={{marginBottom:16}}>
              <label style={{color:"#94A3B8",fontSize:12,fontWeight:500,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Email</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} required
                style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,color:"#fff",fontSize:14,fontFamily:"Inter,sans-serif",transition:"all .2s"}} />
            </div>
            <div style={{marginBottom:24}}>
              <label style={{color:"#94A3B8",fontSize:12,fontWeight:500,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Password</label>
              <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}
                style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,color:"#fff",fontSize:14,fontFamily:"Inter,sans-serif",transition:"all .2s"}} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#3B82F6,#6366F1)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,fontFamily:"Inter,sans-serif",boxShadow:"0 4px 15px rgba(99,102,241,.4)"}}>
              {loading ? "Please wait…" : mode==="login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── STAT CARD ──────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, gradient, trend }) => (
  <div style={{background:"#1E293B",borderRadius:16,padding:24,border:"1px solid #334155",flex:1,minWidth:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <span style={{color:"#94A3B8",fontSize:13,fontWeight:500}}>{label}</span>
      <div style={{width:40,height:40,borderRadius:10,background:gradient,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon name={icon} size={20} color="#fff" />
      </div>
    </div>
    <div style={{fontSize:26,fontWeight:700,color:"#F1F5F9",marginBottom:6}}>
      ₹{Number(value||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
    </div>
    {trend !== undefined && (
      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:trend>=0?"#10B981":"#EF4444"}}>
        <Icon name={trend>=0?"trend_up":"trend_down"} size={14} color={trend>=0?"#10B981":"#EF4444"} />
        This month
      </div>
    )}
  </div>
);

// ── TRANSACTION ROW ────────────────────────────────────────────────
const TxRow = ({ item, type, onEdit, onDelete }) => (
  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #1E293B"}}>
    <div style={{width:38,height:38,borderRadius:10,background:type==="income"?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Icon name={type==="income"?"trend_up":"trend_down"} size={18} color={type==="income"?"#10B981":"#EF4444"} />
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{color:"#F1F5F9",fontWeight:500,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
        {type==="income" ? item.source : item.category}
      </div>
      <div style={{color:"#64748B",fontSize:12,marginTop:2}}>
        {item.description || "—"} · {item.date}
      </div>
    </div>
    <div style={{textAlign:"right",flexShrink:0}}>
      <div style={{color:type==="income"?"#10B981":"#EF4444",fontWeight:600,fontSize:15}}>
        {type==="income"?"+":"-"}₹{Number(item.amount).toLocaleString("en-IN",{minimumFractionDigits:2})}
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:4}}>
        <button onClick={()=>onEdit(item)} style={{background:"rgba(59,130,246,.15)",border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#3B82F6",display:"flex",alignItems:"center",gap:3,fontSize:12}}>
          <Icon name="edit" size={12} color="#3B82F6" /> Edit
        </button>
        <button onClick={()=>onDelete(item.id)} style={{background:"rgba(239,68,68,.15)",border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#EF4444",display:"flex",alignItems:"center",gap:3,fontSize:12}}>
          <Icon name="trash" size={12} color="#EF4444" /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ── FORM MODAL ─────────────────────────────────────────────────────
const FormModal = ({ type, editing, onSave, onClose, token }) => {
  const isIncome = type === "income";
  const [form, setForm] = useState(
    editing
      ? { amount: editing.amount, source: editing.source||"", category: editing.category||"", date: editing.date, description: editing.description||"" }
      : { amount:"", source:"", category:"", date: new Date().toISOString().split("T")[0], description:"" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CATEGORIES = ["Food","Travel","Shopping","Entertainment","Bills","Education","Health","Other"];
  const SOURCES = ["Salary","Freelancing","Business","Scholarship","Investment","Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const body = isIncome
        ? { amount: parseFloat(form.amount), source: form.source, date: form.date, description: form.description }
        : { amount: parseFloat(form.amount), category: form.category, date: form.date, description: form.description };
      const path = isIncome ? "/incomes" : "/expenses";
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${path}/${editing.id}` : path;
      const res = await api(url, { method, body: JSON.stringify(body) }, token);
      onSave(res.data);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#1E293B",borderRadius:20,padding:32,width:"100%",maxWidth:440,border:"1px solid #334155",animation:"fadeUp .3s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{color:"#F1F5F9",fontSize:18,fontWeight:700}}>
            {editing?"Edit":"Add"} {isIncome?"Income":"Expense"}
          </h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:8,cursor:"pointer",color:"#94A3B8",display:"flex"}}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {error && <div style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#FCA5A5",fontSize:13}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{display:"grid",gap:16}}>
            <label style={{display:"block"}}>
              <span style={{color:"#94A3B8",fontSize:12,fontWeight:500,textTransform:"uppercase",letterSpacing:.5}}>Amount (₹)</span>
              <input type="number" step="0.01" min="0.01" required value={form.amount}
                onChange={e=>setForm({...form,amount:e.target.value})}
                placeholder="0.00"
                style={{width:"100%",padding:"11px 14px",marginTop:6,background:"rgba(255,255,255,.06)",border:"1px solid #334155",borderRadius:10,color:"#F1F5F9",fontSize:15,fontFamily:"Inter,sans-serif",outline:"none"}} />
            </label>

            {isIncome ? (
              <label style={{display:"block"}}>
                <span style={{color:"#94A3B8",fontSize:12,fontWeight:500,textTransform:"uppercase",letterSpacing:.5}}>Source</span>
                <select value={form.source} onChange={e=>setForm({...form,source:e.target.value})} required
                  style={{width:"100%",padding:"11px 14px",marginTop:6,background:"#0F172A",border:"1px solid #334155",borderRadius:10,color:"#F1F5F9",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none"}}>
                  <option value="">Select source</option>
                  {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            ) : (
              <label style={{display:"block"}}>
                <span style={{color:"#94A3B8",fontSize:12,fontWeight:500,textTransform:"uppercase",letterSpacing:.5}}>Category</span>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required
                  style={{width:"100%",padding:"11px 14px",marginTop:6,background:"#0F172A",border:"1px solid #334155",borderRadius:10,color:"#F1F5F9",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none"}}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            )}

            <label style={{display:"block"}}>
              <span style={{color:"#94A3B8",fontSize:12,fontWeight:500,textTransform:"uppercase",letterSpacing:.5}}>Date</span>
              <input type="date" required value={form.date}
                onChange={e=>setForm({...form,date:e.target.value})}
                style={{width:"100%",padding:"11px 14px",marginTop:6,background:"rgba(255,255,255,.06)",border:"1px solid #334155",borderRadius:10,color:"#F1F5F9",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none",colorScheme:"dark"}} />
            </label>

            <label style={{display:"block"}}>
              <span style={{color:"#94A3B8",fontSize:12,fontWeight:500,textTransform:"uppercase",letterSpacing:.5}}>Description (optional)</span>
              <input type="text" value={form.description}
                onChange={e=>setForm({...form,description:e.target.value})}
                placeholder="Add a note…"
                style={{width:"100%",padding:"11px 14px",marginTop:6,background:"rgba(255,255,255,.06)",border:"1px solid #334155",borderRadius:10,color:"#F1F5F9",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none"}} />
            </label>

            <button type="submit" disabled={loading}
              style={{padding:"13px",background:isIncome?"linear-gradient(135deg,#10B981,#059669)":"linear-gradient(135deg,#EF4444,#DC2626)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,fontFamily:"Inter,sans-serif",cursor:"pointer",marginTop:4,boxShadow:isIncome?"0 4px 15px rgba(16,185,129,.3)":"0 4px 15px rgba(239,68,68,.3)"}}>
              {loading ? "Saving…" : `${editing?"Update":"Add"} ${isIncome?"Income":"Expense"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── DASHBOARD PAGE ─────────────────────────────────────────────────
const Dashboard = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/dashboard", {}, token).then(r => { setData(r.data); setLoading(false); });
  }, [token]);

  if (loading) return <div style={{color:"#94A3B8",padding:40,textAlign:"center"}}>Loading dashboard…</div>;
  if (!data) return null;

  const recent = [
    ...((data.recentIncomes||[]).map(i => ({...i, _type:"income"}))),
    ...((data.recentExpenses||[]).map(e => ({...e, _type:"expense"}))),
  ].sort((a,b) => b.date > a.date ? 1 : -1).slice(0,8);

  return (
    <div>
      <h1 style={{color:"#F1F5F9",fontSize:24,fontWeight:700,marginBottom:8}}>Dashboard</h1>
      <p style={{color:"#64748B",marginBottom:28,fontSize:14}}>Your financial overview at a glance</p>

      {/* Stats */}
      <div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap"}}>
        <StatCard label="Total Income" value={data.totalIncome} icon="trend_up" gradient="linear-gradient(135deg,#10B981,#059669)" trend={data.monthlyIncome} />
        <StatCard label="Total Expense" value={data.totalExpense} icon="trend_down" gradient="linear-gradient(135deg,#EF4444,#DC2626)" />
        <StatCard label="Balance" value={data.balance} icon="wallet" gradient={data.balance>=0?"linear-gradient(135deg,#3B82F6,#6366F1)":"linear-gradient(135deg,#F59E0B,#D97706)"} />
      </div>

      {/* Monthly summary */}
      <div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,background:"#1E293B",borderRadius:16,padding:20,border:"1px solid #334155"}}>
          <div style={{color:"#94A3B8",fontSize:13,marginBottom:8}}>This Month — Income</div>
          <div style={{color:"#10B981",fontSize:22,fontWeight:700}}>
            ₹{Number(data.monthlyIncome||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
          </div>
        </div>
        <div style={{flex:1,minWidth:200,background:"#1E293B",borderRadius:16,padding:20,border:"1px solid #334155"}}>
          <div style={{color:"#94A3B8",fontSize:13,marginBottom:8}}>This Month — Expense</div>
          <div style={{color:"#EF4444",fontSize:22,fontWeight:700}}>
            ₹{Number(data.monthlyExpense||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{background:"#1E293B",borderRadius:16,padding:24,border:"1px solid #334155"}}>
        <h3 style={{color:"#F1F5F9",fontSize:16,fontWeight:600,marginBottom:16}}>Recent Transactions</h3>
        {recent.length === 0 ? (
          <p style={{color:"#64748B",fontSize:14,textAlign:"center",padding:"20px 0"}}>No transactions yet. Add your first income or expense!</p>
        ) : recent.map(t => (
          <div key={`${t._type}-${t.id}`} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #0F172A"}}>
            <div style={{width:36,height:36,borderRadius:8,background:t._type==="income"?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name={t._type==="income"?"trend_up":"trend_down"} size={16} color={t._type==="income"?"#10B981":"#EF4444"} />
            </div>
            <div style={{flex:1}}>
              <div style={{color:"#F1F5F9",fontSize:14,fontWeight:500}}>{t._type==="income"?t.source:t.category}</div>
              <div style={{color:"#64748B",fontSize:12}}>{t.date}</div>
            </div>
            <div style={{color:t._type==="income"?"#10B981":"#EF4444",fontWeight:600,fontSize:14}}>
              {t._type==="income"?"+":"-"}₹{Number(t.amount).toLocaleString("en-IN",{minimumFractionDigits:2})}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── INCOME/EXPENSE LIST PAGE ───────────────────────────────────────
const TransactionPage = ({ type, token, toast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | item(for edit)

  const isIncome = type === "income";
  const path = isIncome ? "/incomes" : "/expenses";

  const load = () => {
    setLoading(true);
    api(path, {}, token).then(r => { setItems(r.data||[]); setLoading(false); });
  };

  useEffect(load, [type]);

  const handleSave = (saved) => {
    load();
    setModal(null);
    toast(modal && modal !== "add" ? "Updated successfully!" : "Added successfully!", "success");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api(`${path}/${id}`, { method:"DELETE" }, token);
      setItems(prev => prev.filter(i => i.id !== id));
      toast("Deleted successfully", "success");
    } catch(e) { toast(e.message, "error"); }
  };

  const total = items.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{color:"#F1F5F9",fontSize:24,fontWeight:700,marginBottom:4}}>
            {isIncome ? "Income" : "Expenses"}
          </h1>
          <p style={{color:"#64748B",fontSize:14}}>
            {items.length} record{items.length!==1?"s":""} · Total: <span style={{color:isIncome?"#10B981":"#EF4444",fontWeight:600}}>
              ₹{total.toLocaleString("en-IN",{minimumFractionDigits:2})}
            </span>
          </p>
        </div>
        <button onClick={()=>setModal("add")}
          style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",background:isIncome?"linear-gradient(135deg,#10B981,#059669)":"linear-gradient(135deg,#EF4444,#DC2626)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:600,fontFamily:"Inter,sans-serif",cursor:"pointer",boxShadow:isIncome?"0 4px 12px rgba(16,185,129,.3)":"0 4px 12px rgba(239,68,68,.3)"}}>
          <Icon name="add" size={18} color="#fff" />
          Add {isIncome?"Income":"Expense"}
        </button>
      </div>

      {loading ? (
        <div style={{color:"#94A3B8",textAlign:"center",padding:40}}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{background:"#1E293B",borderRadius:16,padding:60,border:"1px solid #334155",textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:14,background:isIncome?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
            <Icon name={isIncome?"trend_up":"expense"} size={28} color={isIncome?"#10B981":"#EF4444"} />
          </div>
          <p style={{color:"#94A3B8",fontSize:16,marginBottom:4}}>No {isIncome?"income":"expenses"} yet</p>
          <p style={{color:"#475569",fontSize:13}}>Click "Add {isIncome?"Income":"Expense"}" to get started</p>
        </div>
      ) : (
        <div style={{background:"#1E293B",borderRadius:16,padding:24,border:"1px solid #334155"}}>
          {items.map(item => (
            <TxRow key={item.id} item={item} type={type}
              onEdit={item => setModal(item)}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal && (
        <FormModal type={type} editing={modal==="add"?null:modal}
          onSave={handleSave} onClose={()=>setModal(null)} token={token} />
      )}
    </div>
  );
};

// ── SIDEBAR ────────────────────────────────────────────────────────
const Sidebar = ({ page, setPage, user, onLogout, collapsed }) => {
  const nav = [
    { id:"dashboard", label:"Dashboard", icon:"dashboard" },
    { id:"income",    label:"Income",    icon:"trend_up" },
    { id:"expenses",  label:"Expenses",  icon:"expense" },
  ];
  return (
    <aside style={{width:collapsed?72:240,background:"#0F172A",borderRight:"1px solid #1E293B",display:"flex",flexDirection:"column",flexShrink:0,transition:"width .2s"}}>
      {/* Brand */}
      <div style={{padding:collapsed?"16px 0":"20px 20px",borderBottom:"1px solid #1E293B",display:"flex",alignItems:"center",gap:12,justifyContent:collapsed?"center":"flex-start",minHeight:72}}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#3B82F6,#6366F1)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icon name="wallet" size={20} color="#fff" />
        </div>
        {!collapsed && <span style={{color:"#F1F5F9",fontWeight:700,fontSize:16,whiteSpace:"nowrap"}}>ExpenseTracker</span>}
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"16px 8px"}}>
        {nav.map(item => (
          <button key={item.id} onClick={()=>setPage(item.id)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:collapsed?"12px 0":"12px 14px",justifyContent:collapsed?"center":"flex-start",border:"none",borderRadius:10,cursor:"pointer",marginBottom:4,fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:500,transition:"all .15s",
              background:page===item.id?"rgba(59,130,246,.15)":"transparent",
              color:page===item.id?"#3B82F6":"#64748B"}}>
            <Icon name={item.icon} size={20} color={page===item.id?"#3B82F6":"#64748B"} />
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{padding:"16px 8px",borderTop:"1px solid #1E293B"}}>
        {!collapsed && (
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="user" size={16} color="#fff" />
            </div>
            <div style={{minWidth:0}}>
              <div style={{color:"#F1F5F9",fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{color:"#475569",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:collapsed?"12px 0":"12px 14px",justifyContent:collapsed?"center":"flex-start",border:"none",borderRadius:10,cursor:"pointer",background:"transparent",color:"#64748B",fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:500,transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,.1)";e.currentTarget.style.color="#EF4444"}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#64748B"}}>
          <Icon name="logout" size={20} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
};

// ── MAIN APP ───────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem("et_auth") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAuth = (data) => {
    localStorage.setItem("et_auth", JSON.stringify(data));
    setAuth(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("et_auth");
    setAuth(null);
    setPage("dashboard");
  };

  if (!auth) return <AuthPage onAuth={handleAuth} />;

  return (
    <div style={{display:"flex",height:"100vh",background:"#0F172A",fontFamily:"'Inter',sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0F172A}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        @keyframes fadeUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slideIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        button:focus{outline:none}
        select option{background:#1E293B;color:#F1F5F9}
      `}</style>

      <Sidebar page={page} setPage={setPage} user={auth} onLogout={handleLogout} collapsed={sidebarCollapsed} />

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Top bar */}
        <header style={{height:56,background:"#0F172A",borderBottom:"1px solid #1E293B",display:"flex",alignItems:"center",padding:"0 24px",gap:16,flexShrink:0}}>
          <button onClick={()=>setSidebarCollapsed(c=>!c)}
            style={{background:"rgba(255,255,255,.06)",border:"none",borderRadius:8,padding:8,cursor:"pointer",color:"#94A3B8",display:"flex"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#94A3B8">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <span style={{color:"#475569",fontSize:13}}>
            {page === "dashboard" ? "Dashboard" : page === "income" ? "Income Management" : "Expense Management"}
          </span>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",borderRadius:8,padding:"6px 12px"}}>
            <Icon name="user" size={14} color="#64748B" />
            <span style={{color:"#94A3B8",fontSize:13}}>Hi, {auth.name?.split(" ")[0]}</span>
          </div>
        </header>

        {/* Content */}
        <main style={{flex:1,overflow:"auto",padding:28}}>
          <div style={{maxWidth:960,margin:"0 auto",animation:"fadeUp .35s ease"}}>
            {page === "dashboard" && <Dashboard token={auth.token} />}
            {page === "income" && <TransactionPage type="income" token={auth.token} toast={showToast} />}
            {page === "expenses" && <TransactionPage type="expense" token={auth.token} toast={showToast} />}
          </div>
        </main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
}
