import { useState, useEffect } from "react";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD", "AED"];
const CATEGORIES = ["Travel", "Meals & Entertainment", "Office Supplies", "Software", "Hardware", "Training", "Marketing", "Other"];
const PAYER_TYPES = ["Self", "Company Card", "Petty Cash", "Reimbursement"];
const STATUS_STEPS = ["Draft", "Waiting approval", "Approved"];

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 800);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}


const Avatar = ({ name, size = 30 }) => {
  const palette = { Anushka: "#6366f1", John: "#f59e0b", Andrew: "#10b981" };
  const bg = palette[name] || "#94a3b8";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${bg}bb,${bg})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      boxShadow: `0 1px 6px ${bg}55`,
    }}>{name[0]}</div>
  );
};

const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
    style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>
    <path d="M3 5l4 4 4-4" stroke="#b0b8c8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StatusPill = ({ status }) => {
  const cfg = {
    Approved: { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
    Pending:  { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
    Rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  }[status] || { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {status === "Approved"
        ? <svg width="11" height="11" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill={cfg.dot} /><path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        : <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      }
      {status}
    </span>
  );
};


const base = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", background: "#fff",
  fontSize: 14, color: "#1e293b", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
  transition: "border-color .15s, box-shadow .15s",
};

const FInput = ({ label, value, onChange, placeholder, type = "text", disabled }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", letterSpacing: .15 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...base, borderColor: f ? "#6366f1" : "#e2e8f0", boxShadow: f ? "0 0 0 3px #6366f115" : "none", opacity: disabled ? .55 : 1, cursor: disabled ? "not-allowed" : "auto" }} />
    </div>
  );
};

const FSelect = ({ label, value, onChange, options, placeholder, disabled }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", letterSpacing: .15 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <select value={value} onChange={onChange} disabled={disabled}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ ...base, appearance: "none", paddingRight: 32, cursor: disabled ? "not-allowed" : "pointer", color: value ? "#1e293b" : "#94a3b8", borderColor: f ? "#6366f1" : "#e2e8f0", boxShadow: f ? "0 0 0 3px #6366f115" : "none", opacity: disabled ? .55 : 1 }}>
          <option value="" disabled hidden>{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Chevron /></div>
      </div>
    </div>
  );
};


export default function ExpenseForm() {
  const w = useWindowWidth();
  const isMobile = w < 540;

  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({
    desc1: "", date: "", category: "", paidBy: "",
    amount: "567", currency: "", remarks: "", desc2: "",
  });
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const approvers = [
    { name: "Anushka",  role: "Manager",  status: "Approved", time: "12:44 PM, 4th Oct, 2025" },
    { name: "John",   role: "Finance",  status: "Pending",  time: "" },
    { name: "Andrew", role: "Director", status: "Pending",  time: "" },
  ];

  const col2 = isMobile ? "1fr" : "1fr 1fr";
  const px = isMobile ? 16 : 24;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f0f4f8 0%,#e6ecf4 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: isMobile ? "12px 8px 40px" : "36px 16px 56px",
      fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        input::placeholder,textarea::placeholder{color:#c2cad8}
        select option{color:#1e293b}
        .row-hover:hover{background:#f8fafc!important}
        .sub-btn:hover{background:#374151!important;transform:translateY(-1px);box-shadow:0 6px 20px #1e293b30!important}
        .sub-btn:active{transform:none!important}
        .att-btn:hover{background:#f8fafc!important;border-color:#c8d0dc!important}
        @keyframes fade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{
        width: "100%", maxWidth: 700, background: "#fff",
        borderRadius: isMobile ? 14 : 18,
        boxShadow: "0 2px 4px #0000000a,0 16px 48px #0000001a,0 0 0 1px #e2e8f0",
        overflow: "hidden", animation: "up .32s ease",
      }}>


        <div style={{
          padding: `15px ${px}px`,
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: 10,
        }}>

          <button className="att-btn" style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 13px", borderRadius: 8,
            border: "1.5px solid #dde3ec", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#475569",
            cursor: "pointer", transition: "all .15s", fontFamily: "inherit",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M14 8.5l-6.5 6.5A4.5 4.5 0 011.5 8.5L8 2a3 3 0 014.5 4L6 12.5A1.5 1.5 0 013.5 10.5l6-6"
                stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Attach Receipt
          </button>


          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 5 : 7, flexShrink: 0 }}>
            {STATUS_STEPS.map((step, i) => {
              const last = i === STATUS_STEPS.length - 1;
              return (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 6 }}>
                  <span style={{
                    fontSize: isMobile ? 11 : 12.5,
                    fontWeight: last ? 700 : 400,
                    color: last && submitted ? "#16a34a" : last ? "#1e293b" : "#94a3b8",
                    transition: "color .25s",
                  }}>{step}</span>
                  {last && submitted && (
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <circle cx="7" cy="7" r="7" fill="#22c55e" />
                      <path d="M4 7l2.2 2.2L10 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {!last && <span style={{ color: "#d1d5db", fontSize: 12 }}>›</span>}
                </div>
              );
            })}
          </div>
        </div>


        <div style={{ padding: `${isMobile ? 16 : 22}px ${px}px 0` }}>


          <div style={{ display: "grid", gridTemplateColumns: col2, gap: isMobile ? 12 : 18, marginBottom: isMobile ? 12 : 16 }}>
            <FInput label="Title" placeholder="Enter Expense Title" value={form.desc1} onChange={s("desc1")} disabled={submitted} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5, opacity: submitted ? .55 : 1 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", letterSpacing: .15 }}>Expense Date</label>
              <div style={{ position: "relative" }}>
                <input type="date" value={form.date} onChange={s("date")} disabled={submitted}
                  style={{ ...base, paddingRight: 32, color: form.date ? "#1e293b" : "#94a3b8", cursor: submitted ? "not-allowed" : "pointer" }} />
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Chevron /></div>
              </div>
            </div>
          </div>


          <div style={{ display: "grid", gridTemplateColumns: col2, gap: isMobile ? 12 : 18, marginBottom: isMobile ? 12 : 16 }}>
            <FSelect label="Category" value={form.category} onChange={s("category")} options={CATEGORIES} placeholder="Select category" disabled={submitted} />
            <FSelect label="Paid by" value={form.paidBy} onChange={s("paidBy")} options={PAYER_TYPES} placeholder="Select payer type" disabled={submitted} />
          </div>


          <div style={{ display: "grid", gridTemplateColumns: col2, gap: isMobile ? 12 : 18, marginBottom: isMobile ? 12 : 16 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, opacity: submitted ? .55 : 1, pointerEvents: submitted ? "none" : "auto" }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", letterSpacing: .15 }}>Total Amount in</label>
              <div style={{ display: "flex", gap: 7 }}>
                <input type="number" value={form.amount} onChange={s("amount")}
                  style={{ ...base, flex: 1, minWidth: 0 }} />
                <div style={{ position: "relative", width: isMobile ? 95 : 120, flexShrink: 0 }}>
                  <select value={form.currency} onChange={s("currency")}
                    style={{ ...base, appearance: "none", paddingLeft: 9, paddingRight: 26, cursor: "pointer", color: form.currency ? "#1e293b" : "#94a3b8" }}>
                    <option value="" disabled hidden>{isMobile ? "CCY" : "Select currency"}</option>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Chevron /></div>
                </div>
              </div>
            </div>


            <div style={{ display: "flex", flexDirection: "column", gap: 5, opacity: submitted ? .55 : 1, pointerEvents: submitted ? "none" : "auto" }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", letterSpacing: .15 }}>Remarks</label>
              <input type="text" value={form.remarks} onChange={s("remarks")} placeholder="Add a remark…" style={{ ...base }} />
            </div>
          </div>


          <div style={{ marginBottom: isMobile ? 14 : 18, opacity: submitted ? .55 : 1, pointerEvents: submitted ? "none" : "auto" }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", letterSpacing: .15, display: "block", marginBottom: 5 }}>Description</label>
            <textarea value={form.desc2} onChange={s("desc2")} placeholder="Additional details…" rows={3}
              style={{ ...base, resize: "vertical", lineHeight: 1.6, minHeight: 68 }} />
          </div>


          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "11px 14px", borderRadius: 10,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            marginBottom: isMobile ? 18 : 22,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#3b82f6", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 4.2v3.3M5 2.8v.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: isMobile ? 11.5 : 12.5, color: "#1d4ed8", lineHeight: 1.65 }}>
              You can submit expenses in any currency. The amount will be auto-converted to the company's base currency during approval.
            </p>
          </div>


          <div style={{ marginBottom: 0 }}>

            <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Approval History</p>


            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr auto 32px" : "1fr 110px 1fr 32px",
              padding: "0 8px 8px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: 2,
              gap: 8,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .6 }}>Approver</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .6 }}>Status</span>
              {!isMobile && <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .6 }}>Time</span>}
              <span />
            </div>


            {approvers.map((a, i) => (
              <div key={a.name}>
                <div
                  className="row-hover"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr auto 32px" : "1fr 110px 1fr 32px",
                    alignItems: "center",
                    padding: "9px 8px",
                    borderRadius: 9,
                    cursor: "pointer",
                    transition: "background .12s",
                    background: expanded === i ? "#f8fafc" : "transparent",
                    gap: 8,
                  }}
                >

                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <Avatar name={a.name} size={isMobile ? 26 : 30} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{a.name}</span>
                        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{a.role}</span>
                      </div>

                      {isMobile && a.time && (
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{a.time}</div>
                      )}
                    </div>
                  </div>


                  <div><StatusPill status={a.status} /></div>


                  {!isMobile && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>{a.time || "—"}</span>
                  )}


                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Chevron open={expanded === i} />
                  </div>
                </div>


                {expanded === i && (
                  <div style={{
                    margin: "0 8px 6px", padding: "10px 14px",
                    background: "#f8fafc", borderRadius: 8, border: "1px solid #e8eaed",
                    fontSize: 12.5, color: "#64748b", lineHeight: 1.65,
                    animation: "fade .15s ease",
                  }}>
                    {a.status === "Approved"
                      ? `${a.name} (${a.role}) approved this expense on ${a.time}.`
                      : `Awaiting review from ${a.name} (${a.role}).`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


        <div style={{
          padding: `${isMobile ? 16 : 20}px ${px}px ${isMobile ? 20 : 26}px`,
          display: "flex",
          justifyContent: isMobile ? "center" : "center",
          alignItems: "center",
          borderTop: "1px solid #f1f5f9",
          marginTop: isMobile ? 16 : 20,
        }}>
          {!submitted ? (
            <button className="sub-btn" onClick={() => setSubmitted(true)} style={{
              padding: "11px 0",
              width: isMobile ? "100%" : 220,
              borderRadius: 50, border: "none",
              background: "#1e293b", color: "#fff",
              fontSize: 15, fontWeight: 600, letterSpacing: .4,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all .18s", boxShadow: "0 4px 14px #1e293b1a",
            }}>
              Submit
            </button>
          ) : (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "10px 22px", borderRadius: 50,
              background: "#f0fdf4", border: "1.5px solid #bbf7d0",
              color: "#15803d", fontSize: 13.5, fontWeight: 600,
              animation: "fade .25s ease",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="#22c55e" />
                <path d="M4.5 8l2.3 2.3 4-4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Submitted — Pending Approval
            </div>
          )}
        </div>
      </div>
    </div>
  );
}