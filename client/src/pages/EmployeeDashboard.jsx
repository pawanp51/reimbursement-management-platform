import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

const EXPENSES = [
  { id: 1, employee: "Anushka", gender: "female", desc: "Restaurant bill", date: "4th Oct, 2025", category: "Food",   paidBy: "Anushka", remarks: "—", amount: "₹5,000", status: "Draft" },
  { id: 2, employee: "Anushka", gender: "female", desc: "Restaurant bill", date: "4th Oct, 2025", category: "Food",   paidBy: "Anushka", remarks: "—", amount: "₹5,467", status: "Submitted" },
  { id: 3, employee: "Anushka", gender: "male",   desc: "Taxi fare",       date: "2nd Oct, 2025", category: "Travel", paidBy: "Anushka", remarks: "—", amount: "₹500",   status: "Approved" },
];

const SUMMARY = [
  { amount: "₹567",    label: "To Submit",        bg: "#ffffff",   border: "#e8eaed", accent: null },
  { amount: "₹33,674", label: "Waiting approval", bg: "#fff8f2",   border: "#fde8cc", accent: "#f97316" },
  { amount: "₹500",    label: "Approved",         bg: "#f3fdf5",   border: "#c6f0d4", accent: "#22c55e" },
];


const Av = ({ name, gender, size = 32 }) => {

  const seed = gender === "female" ? "Anushka-female" : "Anushka-male";

  const femaleUrl = "https://i.pravatar.cc/60?img=47";
  const maleUrl   = "https://i.pravatar.cc/60?img=68";
  const url = gender === "female" ? femaleUrl : maleUrl;

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      style={{
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        display: "block",
      }}
    />
  );
};


const StatusPill = ({ status }) => {
  const cfg = {
    Draft:     { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    Submitted: { bg: "#e0e7ff", color: "#3730a3", border: "#c7d2fe" },
    Approved:  { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", check: true },
  }[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 13px",
      borderRadius: 20,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {cfg.check && (
        <span style={{
          width: 16, height: 16, borderRadius: "50%", background: "#22c55e",
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      {status}
    </span>
  );
};


const SortIcon = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: active ? 0.9 : 0.45, flexShrink: 0 }}>
    <path d="M4.5 5.5L7 3l2.5 2.5" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 8.5L7 11l2.5-2.5" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const DropIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
    <path d="M3 4.5l3.5 3.5 3.5-3.5" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const ColHead = ({ label, sortable, hasDropdown, sorted, onSort, width }) => (
  <th
    onClick={sortable ? onSort : undefined}
    style={{
      padding: "13px 16px", textAlign: "left",
      fontSize: 13.5, fontWeight: 600, color: "#111827",
      borderBottom: "1px solid #e5e7eb",
      whiteSpace: "nowrap",
      cursor: sortable ? "pointer" : "default",
      userSelect: "none",
      background: "#fff",
      width,
    }}
  >
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {label}
      {sortable && <SortIcon active={sorted} />}
      {hasDropdown && !sortable && <DropIcon />}
    </span>
  </th>
);

export default function ExpenseDashboard() {
  const w = useWindowWidth();
  const navigate = useNavigate();
  const isMobile = w < 540;
  const isTablet = w >= 540 && w < 820;

  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const total = EXPENSES.length;

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const visibleCols = isMobile
    ? ["employee", "amount", "status"]
    : isTablet
      ? ["employee", "desc", "date", "amount", "status"]
      : ["employee", "desc", "date", "category", "paidBy", "remarks", "amount", "status"];

  const px = isMobile ? 16 : 24;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#eef0f4",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: isMobile ? "20px 8px 40px" : "48px 20px 64px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .exp-row:hover td { background: #f9fafb !important; }
        .btn-upload:hover { background: #f9fafb !important; }
        .btn-new:hover { background: #111827 !important; }
        .nav-btn:hover:not(:disabled) { background: #f3f4f6 !important; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scroll-x { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .scroll-x::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 1080,
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.10)",
        overflow: "hidden",
        animation: "fadeUp .35s ease",
      }}>


        <div style={{
          padding: `16px ${px}px`,
          borderBottom: "1px solid #f0f2f5",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-upload" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 18px",
              borderRadius: 10,
              border: "1.5px solid #d1d5db",
              background: "#fff",
              fontSize: 14, fontWeight: 500, color: "#374151",
              cursor: "pointer", transition: "background .15s",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 11V3M4.5 6.5L8 3l3.5 3.5" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 13h12" stroke="#374151" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              {isMobile ? "Upload" : "Upload Receipt"}
            </button>

            <button 
              className="btn-new" 
              onClick={() => navigate('/new-expense')}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 20px",
                borderRadius: 10,
                border: "none",
                background: "#1f2937",
                fontSize: 14, fontWeight: 600, color: "#fff",
                cursor: "pointer", transition: "background .15s",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/>
              </svg>
              New Expense
            </button>
          </div>


          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            padding: "7px 10px 7px 14px",
            borderRadius: 12,
            border: "1.5px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", letterSpacing: "-0.01em" }}>
              {isMobile ? "Legal" : "Prasad Mahankal"}
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <img
              src="https://i.pravatar.cc/60?img=68"
              alt="Prasad Mahankal"
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>


        <div style={{
          padding: `20px ${px}px`,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: 16,
          borderBottom: "1px solid #f0f2f5",
        }}>
          {SUMMARY.map((card, i) => (
            <div key={i} style={{
              padding: "22px 24px",
              borderRadius: 14,
              background: card.bg,
              border: `1.5px solid ${card.border}`,
              position: "relative", overflow: "hidden",
            }}>
              {card.accent && (
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  width: 4, height: "100%",
                  background: card.accent,
                  borderRadius: "2px 0 0 2px",
                }}/>
              )}
              <div style={{
                fontSize: isMobile ? 24 : 28,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                marginBottom: 6,
                fontFamily: "inherit",
              }}>{card.amount}</div>
              <div style={{ fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>


        <div style={{ padding: `0 ${px}px`, marginTop: 4 }}>
          <div className="scroll-x" style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
            marginTop: 16,
          }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              minWidth: isMobile ? 320 : isTablet ? 500 : 720,
            }}>
              <thead>
                <tr style={{ background: "#fff" }}>
                  {visibleCols.includes("employee")  && <ColHead label="Employee"    sortable hasDropdown sorted={sortCol==="employee"}  onSort={() => handleSort("employee")} />}
                  {visibleCols.includes("desc")      && <ColHead label="Description" />}
                  {visibleCols.includes("date")      && <ColHead label="Date"        sortable hasDropdown sorted={sortCol==="date"}       onSort={() => handleSort("date")} />}
                  {visibleCols.includes("category")  && <ColHead label="Category"    sortable hasDropdown sorted={sortCol==="category"}   onSort={() => handleSort("category")} />}
                  {visibleCols.includes("paidBy")    && <ColHead label="Paid By"     sortable hasDropdown sorted={sortCol==="paidBy"}     onSort={() => handleSort("paidBy")} />}
                  {visibleCols.includes("remarks")   && <ColHead label="Remarks" />}
                  {visibleCols.includes("amount")    && <ColHead label="Amount"      sortable hasDropdown sorted={sortCol==="amount"}     onSort={() => handleSort("amount")} />}
                  {visibleCols.includes("status")    && <ColHead label="Status" />}
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map((row, i) => {
                  const isLast = i === EXPENSES.length - 1;
                  const tdStyle = {
                    padding: "15px 16px",
                    borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                    background: "#fff",
                    transition: "background .1s",
                  };
                  return (
                    <tr key={row.id} className="exp-row" style={{ cursor: "pointer" }}>
                      {visibleCols.includes("employee") && (
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Av name={row.employee} gender={row.gender} size={isMobile ? 28 : 34} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>{row.employee}</span>
                          </div>
                        </td>
                      )}
                      {visibleCols.includes("desc") && (
                        <td style={{ ...tdStyle, fontSize: 14, color: "#374151" }}>{row.desc}</td>
                      )}
                      {visibleCols.includes("date") && (
                        <td style={{ ...tdStyle, fontSize: 13.5, color: "#6b7280", whiteSpace: "nowrap" }}>{row.date}</td>
                      )}
                      {visibleCols.includes("category") && (
                        <td style={{ ...tdStyle, fontSize: 14, color: "#374151" }}>{row.category}</td>
                      )}
                      {visibleCols.includes("paidBy") && (
                        <td style={{ ...tdStyle, fontSize: 14, color: "#374151" }}>{row.paidBy}</td>
                      )}
                      {visibleCols.includes("remarks") && (
                        <td style={{ ...tdStyle, fontSize: 14, color: "#9ca3af" }}>{row.remarks}</td>
                      )}
                      {visibleCols.includes("amount") && (
                        <td style={{ ...tdStyle, fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{row.amount}</td>
                      )}
                      {visibleCols.includes("status") && (
                        <td style={tdStyle}><StatusPill status={row.status} /></td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>


        <div style={{
          margin: `16px ${px}px 0`,
          padding: "12px 16px",
          borderRadius: 10,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: 1,
          }}>
            <svg width="3" height="9" viewBox="0 0 3 9" fill="none">
              <path d="M1.5 3.5v4.5M1.5 1.5v.3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ margin: 0, fontSize: isMobile ? 12.5 : 13.5, color: "#1d4ed8", lineHeight: 1.6 }}>
            Pending expenses are still in draft status and haven't been submitted by employee yet.
          </p>
        </div>


        <div style={{
          padding: `14px ${px}px 20px`,
          display: "flex", alignItems: "center",
          justifyContent: "flex-end", gap: 8,
          borderTop: "1px solid #f3f4f6",
          marginTop: 16,
        }}>
          <span style={{ fontSize: 13.5, color: "#6b7280", marginRight: 4, fontWeight: 500 }}>
            1 – {total} of {total}
          </span>
          <button
            className="nav-btn"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: "1.5px solid #e5e7eb", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
              transition: "all .15s",
            }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3.5L5 7l3.5 3.5" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="nav-btn"
            disabled={page * 10 >= total}
            onClick={() => setPage(p => p + 1)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: "1.5px solid #e5e7eb", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: page * 10 >= total ? "not-allowed" : "pointer",
              opacity: page * 10 >= total ? 0.4 : 1,
              transition: "all .15s",
            }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}