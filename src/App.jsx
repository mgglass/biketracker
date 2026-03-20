import { useState, useEffect } from "react";

const BIKE_COLORS = [
  { primary: "#E8FF3A", dark: "#b8cc00" },
  { primary: "#FF5C3A", dark: "#cc3a1f" },
  { primary: "#3ADFFF", dark: "#00b8d9" },
  { primary: "#B47FFF", dark: "#8a4fd9" },
  { primary: "#FF9F3A", dark: "#d97a00" },
];

const defaultBikes = [
  { id: 1, name: "Road Bike",     rides: [], repairs: [], components: [], partsArchive: [] },
  { id: 2, name: "Mountain Bike", rides: [], repairs: [], components: [], partsArchive: [] },
  { id: 3, name: "Commuter",      rides: [], repairs: [], components: [], partsArchive: [] },
];

function loadData() {
  try {
    const r = localStorage.getItem("biketracker3");
    if (!r) return defaultBikes;
    const parsed = JSON.parse(r);
    // Migrate older data that doesn't have partsArchive
    return parsed.map(b => ({ partsArchive: [], ...b }));
  } catch { return defaultBikes; }
}
function saveData(b) { try { localStorage.setItem("biketracker3", JSON.stringify(b)); } catch {} }

const sumMiles   = (rides) => rides.reduce((s, r) => s + (r.miles || 0), 0);
const milesSince = (rides, date) => rides.filter(r => r.date >= date).reduce((s, r) => s + (r.miles || 0), 0);
const fmtDate    = (d) => { if (!d) return ""; const o = new Date(d + "T00:00:00"); return o.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); };
const today      = () => new Date().toISOString().split("T")[0];

const Ico = {
  back:    (c="#fff",s=20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10l6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus:    (c="#fff",s=20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></svg>,
  bike:    (c="#fff",s=26) => (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke={c} strokeWidth="2" fill="none"/>
      <circle cx="14" cy="14" r="3" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="14" y1="3" x2="14" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="14" y1="17" x2="14" y2="25" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="3" y1="14" x2="11" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="17" y1="14" x2="25" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5.8" y1="5.8" x2="11.9" y2="11.9" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="16.1" y1="16.1" x2="22.2" y2="22.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22.2" y1="5.8" x2="16.1" y2="11.9" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="11.9" y1="16.1" x2="5.8" y2="22.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  wrench:  (c="#fff",s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M10.5 2.5C11.5 1.5 13.5 1.5 14 3c.5 1.5-1 2.5-2 2L6 11c.5 1-1 2.5-2 3S1.5 12.5 2.5 11.5 5 11 5 11l6-6c0 0-1.5-1.5-.5-2.5z" stroke={c} strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg>,
  cog:     (c="#fff",s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke={c} strokeWidth="1.3" fill="none"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  trash:   (c="#ff5c5c",s=15) => <svg width={s} height={s} viewBox="0 0 15 15" fill="none"><path d="M3 4h9M6 4V3h3v1M5 4v7h5V4H5z" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chev:    (c="#555",s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  reset:   (c="#888",s=14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 105-5H4M4 2L2 4l2 2" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cal:     (c="#fff",s=20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2.5" stroke={c} strokeWidth="1.6" fill="none"/><path d="M3 8h14M7 2v4M13 2v4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  archive: (c="#888",s=15) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="4" width="13" height="10" rx="1.5" stroke={c} strokeWidth="1.3" fill="none"/>
      <path d="M1.5 4l1.2-2.5h10.6L14.5 4" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 8h5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  chevDown:(c="#555",s=14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const Label = ({ children }) => (
  <p style={{ color:"#555", fontSize:11, letterSpacing:1.8, textTransform:"uppercase", margin:"0 0 8px", fontFamily:"'DM Mono',monospace" }}>{children}</p>
);
const FieldInput = ({ value, onChange, placeholder, type="text", style={} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", background:"#1c1c1c", border:`2px solid ${value ? "#444" : "#252525"}`, borderRadius:14, padding:"15px 18px", color:"#fff", fontSize:16, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", colorScheme:"dark", ...style }} />
);
const Btn = ({ onClick, disabled, children, color="#E8FF3A", textColor="#0d0d0d", style={} }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background: disabled ? "#222" : color, border:"none", borderRadius:16, padding:"17px", cursor: disabled ? "not-allowed" : "pointer", fontWeight:800, fontSize:16, fontFamily:"'DM Sans',sans-serif", color: disabled ? "#444" : textColor, width:"100%", transition:"all .15s", ...style }}>
    {children}
  </button>
);
const GhostBtn = ({ onClick, children, style={} }) => (
  <button onClick={onClick}
    style={{ background:"#1c1c1c", border:"1.5px solid #2a2a2a", borderRadius:14, padding:"13px", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:6, ...style }}>
    {children}
  </button>
);
function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ width:"100%", background:"#111", borderRadius:"28px 28px 0 0", padding:"24px 24px 40px" }}>
      <div style={{ width:36, height:4, background:"#2a2a2a", borderRadius:2, margin:"0 auto 20px" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h3 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"#1c1c1c", border:"none", borderRadius:10, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#888", fontSize:18 }}>×</button>
      </div>
      {children}
    </div>
  );
}
function Empty({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 0" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#444", maxWidth:240, margin:"0 auto", lineHeight:1.5 }}>{text}</p>
    </div>
  );
}

// ── CALENDAR COMPONENT ──
function CalendarView({ bikes, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month:"long", year:"numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const rideMap = {};
  bikes.forEach((bike, i) => {
    bike.rides.forEach(ride => {
      if (!rideMap[ride.date]) rideMap[ride.date] = [];
      rideMap[ride.date].push({ bike, ride, colorIndex: i });
    });
  });

  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = today();
  const selectedKey = selectedDay ? dateKey(selectedDay) : null;
  const selectedRides = selectedKey ? (rideMap[selectedKey] || []) : [];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"50px 24px 16px", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <button onClick={onBack} style={{ background:"#1c1c1c", border:"none", borderRadius:11, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            {Ico.back()}
          </button>
          <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Ride Calendar</h2>
          <div style={{ width:38 }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <button onClick={prevMonth} style={{ background:"#1c1c1c", border:"none", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            {Ico.back()}
          </button>
          <p style={{ color:"#fff", fontWeight:800, fontSize:18, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{monthName}</p>
          <button onClick={nextMonth} style={{ background:"#1c1c1c", border:"none", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transform:"scaleX(-1)" }}>
            {Ico.back()}
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:6 }}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} style={{ textAlign:"center", color:"#444", fontSize:10, letterSpacing:1.5, fontFamily:"'DM Mono',monospace", padding:"4px 0" }}>{d}</div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 24px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`}/>;
            const key = dateKey(day);
            const dayRides = rideMap[key] || [];
            const isToday = key === todayStr;
            const isSelected = selectedDay === day;
            return (
              <button key={key} onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{ background: isSelected ? "#1e1e1e" : isToday ? "#1a1a1a" : "transparent", border: isToday ? "1.5px solid #333" : isSelected ? "1.5px solid #444" : "1.5px solid transparent", borderRadius:12, padding:"6px 2px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, minHeight:52 }}>
                <span style={{ color: isToday ? "#E8FF3A" : "#888", fontSize:13, fontWeight: isToday ? 800 : 500, fontFamily:"'DM Sans',sans-serif" }}>{day}</span>
                {dayRides.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:2, justifyContent:"center", maxWidth:36 }}>
                    {dayRides.slice(0, 3).map((r, i) => (
                      <div key={i} style={{ width: dayRides.length === 1 ? 8 : 6, height: dayRides.length === 1 ? 8 : 6, borderRadius:"50%", background: BIKE_COLORS[r.colorIndex % BIKE_COLORS.length].primary, flexShrink:0 }}/>
                    ))}
                    {dayRides.length > 3 && <span style={{ color:"#555", fontSize:8, fontFamily:"'DM Mono',monospace" }}>+{dayRides.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop:20, background:"#141414", borderRadius:16, padding:"14px 16px" }}>
          <p style={{ color:"#444", fontSize:10, letterSpacing:2, textTransform:"uppercase", margin:"0 0 10px", fontFamily:"'DM Mono',monospace" }}>Bikes</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {bikes.map((bike, i) => (
              <div key={bike.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background: BIKE_COLORS[i % BIKE_COLORS.length].primary, flexShrink:0 }}/>
                <span style={{ color:"#aaa", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{bike.name}</span>
                <span style={{ color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", marginLeft:"auto" }}>{sumMiles(bike.rides).toFixed(2)} mi total</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDay && (
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.80)", display:"flex", alignItems:"flex-end", zIndex:100 }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedDay(null); }}>
          <div style={{ width:"100%", background:"#111", borderRadius:"28px 28px 0 0", padding:"24px 24px 44px", maxHeight:"75%", overflowY:"auto" }}>
            <div style={{ width:36, height:4, background:"#2a2a2a", borderRadius:2, margin:"0 auto 20px" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                {new Date(dateKey(selectedDay) + "T00:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
              </h3>
              <button onClick={() => setSelectedDay(null)} style={{ background:"#1c1c1c", border:"none", borderRadius:10, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#888", fontSize:18 }}>×</button>
            </div>
            {selectedRides.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🚲</div>
                <p style={{ color:"#444", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>No rides on this day</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {selectedRides.map(({ bike, ride, colorIndex }, idx) => {
                  const col = BIKE_COLORS[colorIndex % BIKE_COLORS.length];
                  const totalMi = sumMiles(bike.rides);
                  const comps = bike.components || [];
                  return (
                    <div key={idx} style={{ background:"#1a1a1a", borderRadius:16, overflow:"hidden" }}>
                      <div style={{ borderLeft:`3px solid ${col.primary}`, padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:10, height:10, borderRadius:"50%", background:col.primary }}/>
                            <span style={{ color:"#fff", fontWeight:700, fontSize:16, fontFamily:"'DM Sans',sans-serif" }}>{bike.name}</span>
                          </div>
                          <span style={{ color:col.primary, fontWeight:800, fontSize:20, fontFamily:"'DM Sans',sans-serif" }}>
                            {ride.miles.toFixed(2)} <span style={{ color:"#555", fontSize:12, fontWeight:600 }}>mi</span>
                          </span>
                        </div>
                        {ride.note && <p style={{ color:"#666", fontSize:12, margin:"0 0 10px", fontFamily:"'DM Mono',monospace", fontStyle:"italic" }}>"{ride.note}"</p>}
                        <div style={{ display:"flex", gap:8 }}>
                          <div style={{ flex:1, background:"#0d0d0d", borderRadius:10, padding:"10px 12px" }}>
                            <p style={{ color:"#444", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 3px", fontFamily:"'DM Mono',monospace" }}>Bike Total</p>
                            <p style={{ color:"#fff", fontSize:18, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{totalMi.toFixed(2)}</p>
                            <p style={{ color:"#333", fontSize:9, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>mi lifetime</p>
                          </div>
                        </div>
                        {comps.length > 0 && (
                          <div style={{ marginTop:10 }}>
                            <p style={{ color:"#333", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 6px", fontFamily:"'DM Mono',monospace" }}>Part mileage (from install/reset)</p>
                            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                              {comps.map(c => {
                                const lr = c.resets.slice().sort((a,z) => z.date > a.date ? 1 : -1)[0];
                                const miOnComp = milesSince(bike.rides, lr.date);
                                return (
                                  <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                      {Ico.cog(col.primary, 11)}
                                      <span style={{ color:"#888", fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>{c.name}</span>
                                    </div>
                                    <span style={{ color:col.primary, fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{miOnComp.toFixed(2)} mi</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── RETIRE COMPONENT MODAL ──
function RetireModal({ component, bike, color, onRetire, onClose }) {
  const [retireDate, setRetireDate] = useState(today());

  const totalMi = milesSince(bike.rides, component.installedDate);
  const lastReset = component.resets.slice().sort((a,z) => z.date > a.date ? 1 : -1)[0];
  const sinceReset = milesSince(bike.rides, lastReset.date);

  function handleRetire() {
    onRetire({
      id: component.id,
      name: component.name,
      installedDate: component.installedDate,
      retiredDate: retireDate,
      totalMiles: totalMi,
      resets: component.resets,
      archivedAt: Date.now(),
    });
    onClose();
  }

  return (
    <ModalShell title="Retire Part" onClose={onClose}>
      <div style={{ background:"#1a1a1a", borderRadius:14, padding:"14px 16px", marginBottom:20, borderLeft:`3px solid ${color.primary}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          {Ico.cog(color.primary, 14)}
          <span style={{ color:"#fff", fontWeight:700, fontSize:16, fontFamily:"'DM Sans',sans-serif" }}>{component.name}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, background:"#0d0d0d", borderRadius:10, padding:"10px 12px" }}>
            <p style={{ color:"#444", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 2px", fontFamily:"'DM Mono',monospace" }}>Installed</p>
            <p style={{ color:"#aaa", fontSize:13, fontWeight:700, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{fmtDate(component.installedDate)}</p>
          </div>
          <div style={{ flex:1, background:"#0d0d0d", borderRadius:10, padding:"10px 12px" }}>
            <p style={{ color:"#444", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 2px", fontFamily:"'DM Mono',monospace" }}>Total Miles</p>
            <p style={{ color:color.primary, fontSize:18, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{totalMi.toFixed(2)}</p>
          </div>
        </div>
        {component.resets.length > 1 && (
          <p style={{ color:"#444", fontSize:11, margin:"10px 0 0", fontFamily:"'DM Mono',monospace" }}>
            {component.resets.length - 1} reset{component.resets.length > 2 ? "s" : ""} · {sinceReset.toFixed(2)} mi since last reset
          </p>
        )}
      </div>

      <div style={{ background:"#1c1c1c", borderRadius:12, padding:"12px 14px", marginBottom:18, display:"flex", gap:10 }}>
        <span>📦</span>
        <p style={{ color:"#666", fontSize:13, margin:0, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>
          Retiring moves this part to your permanent archive with its full history. It won't be deleted.
        </p>
      </div>

      <Label>Retirement Date</Label>
      <FieldInput type="date" value={retireDate} onChange={e => setRetireDate(e.target.value)} style={{ marginBottom:20 }}/>
      <Btn onClick={handleRetire} color={color.primary}>Move to Archive</Btn>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#555", fontSize:13, fontFamily:"'DM Mono',monospace", width:"100%", padding:"14px 0 0", textDecoration:"underline" }}>
        Cancel
      </button>
    </ModalShell>
  );
}

export default function App() {
  const [bikes, setBikes]       = useState(loadData);
  const [view,  setView]        = useState("home");
  const [bId,   setBId]         = useState(null);
  const [subView, setSubView]   = useState(null);
  const [modal, setModal]       = useState(null);
  const [toast, setToast]       = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [retireTarget, setRetireTarget] = useState(null);

  const [rideForm,    setRideForm]    = useState({ miles:"", date:today(), note:"" });
  const [repairForm,  setRepairForm]  = useState({ description:"", date:today() });
  const [compForm,    setCompForm]    = useState({ name:"", date:today() });
  const [resetForm,   setResetForm]   = useState({ compId:null, date:today() });
  const [newBikeName, setNewBikeName] = useState("");

  useEffect(() => saveData(bikes), [bikes]);

  const bike  = bikes.find(b => b.id === bId);
  const color = bike ? BIKE_COLORS[bikes.indexOf(bike) % BIKE_COLORS.length] : BIKE_COLORS[0];

  const showToast  = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const closeModal = ()    => setModal(null);
  const mutate     = (fn)  => setBikes(prev => prev.map(b => b.id === bId ? fn(b) : b));

  function logRide() {
    const miles = parseFloat(rideForm.miles);
    if (!miles || miles <= 0) return;
    mutate(b => ({ ...b, rides: [...b.rides, { id:Date.now(), miles, date:rideForm.date, note:rideForm.note }].sort((a,z) => a.date < z.date ? -1 : 1) }));
    setRideForm({ miles:"", date:today(), note:"" });
    showToast("Ride logged 🚴"); closeModal();
  }
  function logRepair() {
    if (!repairForm.description.trim()) return;
    mutate(b => ({ ...b, repairs: [...b.repairs, { id:Date.now(), description:repairForm.description, date:repairForm.date }].sort((a,z) => a.date < z.date ? -1 : 1) }));
    setRepairForm({ description:"", date:today() });
    showToast("Repair logged 🔧"); closeModal();
  }
  function addComponent() {
    if (!compForm.name.trim()) return;
    mutate(b => ({ ...b, components: [...(b.components||[]), { id:Date.now(), name:compForm.name.trim(), installedDate:compForm.date, resets:[{ date:compForm.date, label:"Installed" }] }] }));
    setCompForm({ name:"", date:today() });
    showToast("Component added ⚙️"); closeModal();
  }
  function resetComponent() {
    if (!resetForm.compId) return;
    mutate(b => ({ ...b, components: (b.components||[]).map(c => c.id === resetForm.compId ? { ...c, resets:[...c.resets, { date:resetForm.date, label:"Reset" }] } : c) }));
    setResetForm({ compId:null, date:today() });
    showToast("Counter reset ↺"); closeModal();
  }
  function retireComponent(archivedPart) {
    mutate(b => ({
      ...b,
      components: (b.components||[]).filter(c => c.id !== archivedPart.id),
      partsArchive: [...(b.partsArchive||[]), archivedPart],
    }));
    setRetireTarget(null);
    showToast("Part archived 📦");
  }
  function deleteArchivedPart(archivedAt) {
    if (!window.confirm("Permanently delete this archived part record?")) return;
    mutate(b => ({ ...b, partsArchive: (b.partsArchive||[]).filter(p => p.archivedAt !== archivedAt) }));
  }
  function deleteRepair(rid)   { mutate(b => ({ ...b, repairs:    b.repairs.filter(r => r.id !== rid) })); }
  function deleteRide(rid)     { mutate(b => ({ ...b, rides:      b.rides.filter(r => r.id !== rid) })); }
  function deleteComponent(cid){ mutate(b => ({ ...b, components:(b.components||[]).filter(c => c.id !== cid) })); }
  function addBike() {
    if (!newBikeName.trim()) return;
    setBikes(p => [...p, { id:Date.now(), name:newBikeName.trim(), rides:[], repairs:[], components:[], partsArchive:[] }]);
    setNewBikeName(""); showToast("Bike added 🚲"); closeModal();
  }
  function deleteBike() {
    if (!window.confirm("Delete this bike and all its data?")) return;
    setBikes(p => p.filter(b => b.id !== bId));
    setView("home");
  }

  const modals = {
    logRide: (
      <ModalShell title="Log a Ride" onClose={closeModal}>
        <Label>Miles</Label>
        <FieldInput type="number" value={rideForm.miles} onChange={e => setRideForm(f=>({...f,miles:e.target.value}))} placeholder="0.00" style={{ fontSize:24, fontWeight:700, marginBottom:16 }}/>
        <Label>Date</Label>
        <FieldInput type="date" value={rideForm.date} onChange={e => setRideForm(f=>({...f,date:e.target.value}))} style={{ marginBottom:16 }}/>
        <Label>Note (optional)</Label>
        <FieldInput value={rideForm.note} onChange={e => setRideForm(f=>({...f,note:e.target.value}))} placeholder="Morning loop, trail ride…" style={{ marginBottom:24 }}/>
        <Btn onClick={logRide} disabled={!rideForm.miles} color={color.primary}>Save Ride</Btn>
      </ModalShell>
    ),
    logRepair: (
      <ModalShell title="Log a Repair" onClose={closeModal}>
        <Label>Description</Label>
        <FieldInput value={repairForm.description} onChange={e => setRepairForm(f=>({...f,description:e.target.value}))} placeholder="New rear cassette, brake pads…" style={{ marginBottom:16 }}/>
        <Label>Date</Label>
        <FieldInput type="date" value={repairForm.date} onChange={e => setRepairForm(f=>({...f,date:e.target.value}))} style={{ marginBottom:24 }}/>
        <Btn onClick={logRepair} disabled={!repairForm.description.trim()} color={color.primary}>Save Repair</Btn>
      </ModalShell>
    ),
    addComp: (
      <ModalShell title="Track a Component" onClose={closeModal}>
        <div style={{ background:"#1c1c1c", borderRadius:12, padding:"12px 14px", marginBottom:18, display:"flex", gap:10 }}>
          <span>💡</span>
          <p style={{ color:"#666", fontSize:13, margin:0, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>Track any part independently: cassette, chain, tires, brake pads. Each gets its own mile counter you can reset any time.</p>
        </div>
        <Label>Component Name</Label>
        <FieldInput value={compForm.name} onChange={e => setCompForm(f=>({...f,name:e.target.value}))} placeholder="Rear cassette, chain, tires…" style={{ marginBottom:16 }}/>
        <Label>Installation Date</Label>
        <FieldInput type="date" value={compForm.date} onChange={e => setCompForm(f=>({...f,date:e.target.value}))} style={{ marginBottom:24 }}/>
        <Btn onClick={addComponent} disabled={!compForm.name.trim()} color={color.primary}>Add Component</Btn>
      </ModalShell>
    ),
    resetComp: (
      <ModalShell title="Reset Component Counter" onClose={closeModal}>
        <Label>Select Component</Label>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {(bike?.components||[]).map(c => (
            <button key={c.id} onClick={() => setResetForm(f=>({...f,compId:c.id}))}
              style={{ background: resetForm.compId===c.id ? color.primary+"22" : "#1c1c1c", border:`1.5px solid ${resetForm.compId===c.id ? color.primary : "#2a2a2a"}`, borderRadius:12, padding:"12px 14px", cursor:"pointer", textAlign:"left", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600 }}>
              {c.name}
            </button>
          ))}
        </div>
        <Label>Reset Date</Label>
        <FieldInput type="date" value={resetForm.date} onChange={e => setResetForm(f=>({...f,date:e.target.value}))} style={{ marginBottom:24 }}/>
        <Btn onClick={resetComponent} disabled={!resetForm.compId} color={color.primary}>Reset Counter</Btn>
      </ModalShell>
    ),
    addBike: (
      <ModalShell title="Add a Bike" onClose={closeModal}>
        <Label>Bike Name</Label>
        <FieldInput value={newBikeName} onChange={e => setNewBikeName(e.target.value)} placeholder="Road Bike, MTB, Commuter…" style={{ marginBottom:24 }}/>
        <Btn onClick={addBike} disabled={!newBikeName.trim()} color="#E8FF3A">Add Bike</Btn>
      </ModalShell>
    ),
  };

  const archive = bike ? (bike.partsArchive || []).slice().sort((a,b) => b.archivedAt - a.archivedAt) : [];

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#000" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input::placeholder{color:#3a3a3a}
        ::-webkit-scrollbar{display:none}
      `}</style>

      <div style={{ width:390, height:844, background:"#0d0d0d", borderRadius:44, overflow:"hidden", position:"relative", boxShadow:"0 0 0 2px #1e1e1e,0 40px 100px rgba(0,0,0,.9)" }}>

        {/* ── CALENDAR VIEW ── */}
        {view === "calendar" && <CalendarView bikes={bikes} onBack={() => setView("home")} />}

        {/* ── HOME ── */}
        {view === "home" && (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"54px 24px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                <div>
                  <p style={{ color:"#444", fontSize:11, letterSpacing:2.5, textTransform:"uppercase", margin:"0 0 4px", fontFamily:"'DM Mono',monospace" }}>My Fleet</p>
                  <h1 style={{ color:"#fff", fontSize:32, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif", lineHeight:1 }}>Bike Tracker</h1>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setView("calendar")} style={{ background:"#1c1c1c", border:"none", borderRadius:13, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    {Ico.cal("#888", 18)}
                  </button>
                  <button onClick={() => setModal("addBike")} style={{ background:"#E8FF3A", border:"none", borderRadius:13, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    {Ico.plus("#0d0d0d", 20)}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ margin:"0 24px 18px", background:"#141414", borderRadius:18, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ color:"#444", fontSize:10, letterSpacing:2, textTransform:"uppercase", margin:"0 0 4px", fontFamily:"'DM Mono',monospace" }}>Fleet Total</p>
                <p style={{ color:"#fff", fontSize:36, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                  {bikes.reduce((s,b) => s + sumMiles(b.rides), 0).toFixed(2)}
                  <span style={{ color:"#444", fontSize:16, fontWeight:600, marginLeft:6 }}>mi</span>
                </p>
              </div>
              <div style={{ fontSize:48, opacity:.35 }}>🚴</div>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"0 24px 32px", display:"flex", flexDirection:"column", gap:12 }}>
              {bikes.map((b, i) => {
                const col   = BIKE_COLORS[i % BIKE_COLORS.length];
                const miles = sumMiles(b.rides);
                const comps = b.components || [];
                return (
                  <button key={b.id} onClick={() => { setBId(b.id); setSubView(null); setView("bike"); setArchiveOpen(false); }}
                    style={{ background:"#141414", border:"none", borderRadius:20, padding:0, cursor:"pointer", textAlign:"left", overflow:"hidden", width:"100%" }}>
                    <div style={{ borderLeft:`4px solid ${col.primary}`, padding:"18px 18px 18px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ background:col.primary+"20", borderRadius:12, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {Ico.bike(col.primary, 24)}
                          </div>
                          <div>
                            <p style={{ color:"#fff", fontWeight:700, fontSize:16, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{b.name}</p>
                            <p style={{ color:"#444", fontSize:11, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>{b.rides.length} rides · {comps.length} parts</p>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ color:col.primary, fontWeight:800, fontSize:22, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{miles.toFixed(2)}</p>
                            <p style={{ color:"#444", fontSize:10, margin:0, fontFamily:"'DM Mono',monospace" }}>total mi</p>
                          </div>
                          {Ico.chev()}
                        </div>
                      </div>
                      {comps.length > 0 && (
                        <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:6 }}>
                          {comps.slice(0,3).map(c => {
                            const lr = c.resets.slice().sort((a,z) => z.date > a.date ? 1 : -1)[0];
                            return (
                              <div key={c.id} style={{ background:"#1e1e1e", borderRadius:8, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
                                {Ico.cog(col.primary, 11)}
                                <span style={{ color:"#888", fontSize:11, fontFamily:"'DM Mono',monospace" }}>{c.name}: {milesSince(b.rides, lr.date).toFixed(2)} mi</span>
                              </div>
                            );
                          })}
                          {comps.length > 3 && <div style={{ background:"#1e1e1e", borderRadius:8, padding:"4px 10px" }}><span style={{ color:"#555", fontSize:11, fontFamily:"'DM Mono',monospace" }}>+{comps.length-3} more</span></div>}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              {bikes.length === 0 && <Empty icon="🚲" text="No bikes yet. Tap + to add one!" />}
            </div>
          </div>
        )}

        {/* ── BIKE DETAIL ── */}
        {view === "bike" && bike && (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <div style={{ background:`linear-gradient(160deg,${color.primary}12 0%,#0d0d0d 65%)`, padding:"50px 24px 20px", flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <button onClick={() => setView("home")} style={{ background:"#1c1c1c", border:"none", borderRadius:11, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  {Ico.back()}
                </button>
                <button onClick={deleteBike} style={{ background:"none", border:"none", cursor:"pointer", color:"#ff5c5c", fontSize:13, fontFamily:"'DM Mono',monospace" }}>Delete</button>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                <div style={{ background:color.primary+"20", borderRadius:16, width:52, height:52, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ico.bike(color.primary, 30)}
                </div>
                <div>
                  <h2 style={{ color:"#fff", fontSize:26, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{bike.name}</h2>
                  <p style={{ color:"#444", fontSize:12, margin:"3px 0 0", fontFamily:"'DM Mono',monospace" }}>{bike.rides.length} rides · {(bike.components||[]).length} parts tracked</p>
                </div>
              </div>

              <div style={{ background:"#141414", borderRadius:16, padding:"16px 20px", marginBottom:14 }}>
                <p style={{ color:"#444", fontSize:10, letterSpacing:2, textTransform:"uppercase", margin:"0 0 4px", fontFamily:"'DM Mono',monospace" }}>Total Miles</p>
                <p style={{ color:color.primary, fontSize:38, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                  {sumMiles(bike.rides).toFixed(2)} <span style={{ color:"#444", fontSize:16, fontWeight:600 }}>mi</span>
                </p>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setModal("logRide")} style={{ flex:2, background:color.primary, border:"none", borderRadius:14, padding:"13px", cursor:"pointer", fontWeight:800, fontSize:15, fontFamily:"'DM Sans',sans-serif", color:"#0d0d0d" }}>
                  + Log Ride
                </button>
                <GhostBtn onClick={() => setModal("logRepair")} style={{ flex:1 }}>{Ico.wrench()} Repair</GhostBtn>
                <GhostBtn onClick={() => setModal("addComp")} style={{ flex:1 }}>{Ico.cog()} Part</GhostBtn>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", padding:"0 24px", borderBottom:"1px solid #1a1a1a", flexShrink:0 }}>
              {[["components","⚙️ Parts"], ["repairs","🔧 Repairs"], ["rides","🚴 Rides"]].map(([id, label]) => (
                <button key={id} onClick={() => { setSubView(subView === id ? null : id); setArchiveOpen(false); }}
                  style={{ flex:1, background:"none", border:"none", padding:"12px 0", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:1, color: subView===id ? color.primary : "#444", borderBottom:`2px solid ${subView===id ? color.primary : "transparent"}`, transition:"color .15s" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 32px" }}>

              {/* PARTS tab */}
              {subView === "components" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                  {/* Active parts */}
                  {(bike.components||[]).length === 0 && archive.length === 0 ? (
                    <Empty icon="⚙️" text="No parts tracked yet. Tap 'Part' above to add one." />
                  ) : (bike.components||[]).length === 0 && archive.length > 0 ? (
                    <div style={{ textAlign:"center", padding:"24px 0 8px" }}>
                      <p style={{ color:"#444", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>No active parts — see archive below.</p>
                    </div>
                  ) : (
                    (bike.components||[]).map(c => {
                      const sortedResets = c.resets.slice().sort((a,z) => z.date > a.date ? 1 : -1);
                      const lastReset    = sortedResets[0];
                      const currentMi   = milesSince(bike.rides, lastReset.date);
                      const totalMi     = milesSince(bike.rides, c.installedDate);
                      return (
                        <div key={c.id} style={{ background:"#141414", borderRadius:16, overflow:"hidden" }}>
                          <div style={{ borderLeft:`3px solid ${color.primary}`, padding:"16px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                {Ico.cog(color.primary, 16)}
                                <p style={{ color:"#fff", fontWeight:700, fontSize:16, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{c.name}</p>
                              </div>
                              <div style={{ display:"flex", gap:6 }}>
                                <button onClick={() => { setResetForm({ compId:c.id, date:today() }); setModal("resetComp"); }}
                                  style={{ background:"#1e1e1e", border:"1px solid #2a2a2a", borderRadius:8, padding:"5px 9px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                                  {Ico.reset()}<span style={{ color:"#777", fontSize:11, fontFamily:"'DM Mono',monospace" }}>reset</span>
                                </button>
                                <button onClick={() => setRetireTarget(c)}
                                  style={{ background:"#1e1e1e", border:"1px solid #2a2a2a", borderRadius:8, padding:"5px 9px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                                  {Ico.archive("#aaa", 13)}<span style={{ color:"#777", fontSize:11, fontFamily:"'DM Mono',monospace" }}>retire</span>
                                </button>
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:10 }}>
                              <div style={{ flex:1, background:"#0d0d0d", borderRadius:12, padding:"12px 14px" }}>
                                <p style={{ color:"#444", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 3px", fontFamily:"'DM Mono',monospace" }}>Since Reset</p>
                                <p style={{ color:color.primary, fontSize:24, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{currentMi.toFixed(2)}</p>
                                <p style={{ color:"#333", fontSize:10, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>{fmtDate(lastReset.date)}</p>
                              </div>
                              <div style={{ flex:1, background:"#0d0d0d", borderRadius:12, padding:"12px 14px" }}>
                                <p style={{ color:"#444", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 3px", fontFamily:"'DM Mono',monospace" }}>Since Install</p>
                                <p style={{ color:"#fff", fontSize:24, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{totalMi.toFixed(2)}</p>
                                <p style={{ color:"#333", fontSize:10, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>{fmtDate(c.installedDate)}</p>
                              </div>
                            </div>
                            {sortedResets.length > 1 && (
                              <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid #1e1e1e" }}>
                                <p style={{ color:"#333", fontSize:10, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 6px", fontFamily:"'DM Mono',monospace" }}>Reset history</p>
                                {sortedResets.slice(1).map((r, i) => (
                                  <p key={i} style={{ color:"#444", fontSize:11, margin:"2px 0", fontFamily:"'DM Mono',monospace" }}>↺ {fmtDate(r.date)} · {milesSince(bike.rides, r.date).toFixed(2)} mi from that date</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* ── Parts Archive collapsible section ── */}
                  {archive.length > 0 && (
                    <div style={{ marginTop: (bike.components||[]).length > 0 ? 8 : 0 }}>
                      <button onClick={() => setArchiveOpen(o => !o)}
                        style={{ width:"100%", background:"#141414", border:"1px solid #1e1e1e", borderRadius:14, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          {Ico.archive(color.primary, 15)}
                          <span style={{ color:"#aaa", fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Parts Archive</span>
                          <span style={{ background:color.primary+"22", color:color.primary, fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", borderRadius:6, padding:"2px 8px" }}>{archive.length}</span>
                        </div>
                        <div style={{ transform: archiveOpen ? "rotate(0deg)" : "rotate(-90deg)", transition:"transform .2s" }}>
                          {Ico.chevDown("#555", 16)}
                        </div>
                      </button>

                      {archiveOpen && (
                        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:10 }}>
                          {archive.map((part) => {
                            const daysActive = Math.round((new Date(part.retiredDate) - new Date(part.installedDate)) / (1000*60*60*24));
                            return (
                              <div key={part.archivedAt} style={{ background:"#141414", borderRadius:14, overflow:"hidden" }}>
                                <div style={{ borderLeft:`3px solid #2a2a2a`, padding:"14px 16px" }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                      {Ico.cog("#555", 14)}
                                      <span style={{ color:"#bbb", fontWeight:700, fontSize:15, fontFamily:"'DM Sans',sans-serif" }}>{part.name}</span>
                                    </div>
                                    <button onClick={() => deleteArchivedPart(part.archivedAt)}
                                      style={{ background:"none", border:"none", cursor:"pointer", padding:4, opacity:0.5 }}>
                                      {Ico.trash("#888", 13)}
                                    </button>
                                  </div>

                                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                                    <div style={{ flex:1, background:"#0d0d0d", borderRadius:10, padding:"10px 12px" }}>
                                      <p style={{ color:"#333", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 2px", fontFamily:"'DM Mono',monospace" }}>Total Miles</p>
                                      <p style={{ color:color.primary, fontSize:20, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{part.totalMiles.toFixed(2)}</p>
                                    </div>
                                    <div style={{ flex:1, background:"#0d0d0d", borderRadius:10, padding:"10px 12px" }}>
                                      <p style={{ color:"#333", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 2px", fontFamily:"'DM Mono',monospace" }}>Days Active</p>
                                      <p style={{ color:"#aaa", fontSize:20, fontWeight:800, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{daysActive >= 0 ? daysActive : "—"}</p>
                                    </div>
                                  </div>

                                  <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                                    <div style={{ flex:1 }}>
                                      <p style={{ color:"#333", fontSize:9, letterSpacing:1.2, textTransform:"uppercase", margin:"0 0 2px", fontFamily:"'DM Mono',monospace" }}>Installed</p>
                                      <p style={{ color:"#666", fontSize:12, margin:0, fontFamily:"'DM Mono',monospace" }}>{fmtDate(part.installedDate)}</p>
                                    </div>
                                    <span style={{ color:"#2a2a2a", fontSize:16, marginTop:12 }}>→</span>
                                    <div style={{ flex:1 }}>
                                      <p style={{ color:"#333", fontSize:9, letterSpacing:1.2, textTransform:"uppercase", margin:"0 0 2px", fontFamily:"'DM Mono',monospace" }}>Retired</p>
                                      <p style={{ color:"#666", fontSize:12, margin:0, fontFamily:"'DM Mono',monospace" }}>{fmtDate(part.retiredDate)}</p>
                                    </div>
                                  </div>

                                  {part.resets && part.resets.length > 1 && (
                                    <p style={{ color:"#333", fontSize:11, margin:"10px 0 0", fontFamily:"'DM Mono',monospace" }}>
                                      ↺ {part.resets.length - 1} counter reset{part.resets.length > 2 ? "s" : ""} during service
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* REPAIRS tab */}
              {subView === "repairs" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {(bike.repairs||[]).length === 0 ? <Empty icon="🔧" text="No repairs logged yet." /> : (
                    [...(bike.repairs||[])].sort((a,b) => b.date > a.date ? 1 : -1).map(rep => (
                      <div key={rep.id} style={{ background:"#141414", borderRadius:14, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          {Ico.wrench(color.primary, 14)}
                          <div>
                            <p style={{ color:"#fff", fontSize:15, margin:0, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{rep.description}</p>
                            <p style={{ color:"#444", fontSize:11, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>{fmtDate(rep.date)} · {milesSince(bike.rides, rep.date).toFixed(2)} mi since</p>
                          </div>
                        </div>
                        <button onClick={() => deleteRepair(rep.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>{Ico.trash()}</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* RIDES tab */}
              {subView === "rides" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {bike.rides.length === 0 ? <Empty icon="🏁" text="No rides logged yet — get pedaling!" /> : (
                    [...bike.rides].sort((a,b) => b.date > a.date ? 1 : -1).map(ride => (
                      <div key={ride.id} style={{ background:"#141414", borderRadius:14, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <p style={{ color:"#fff", fontWeight:700, fontSize:18, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{ride.miles.toFixed(2)} <span style={{ color:"#444", fontSize:13, fontWeight:400 }}>mi</span></p>
                          <p style={{ color:"#444", fontSize:11, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>{fmtDate(ride.date)}{ride.note ? ` · ${ride.note}` : ""}</p>
                        </div>
                        <button onClick={() => deleteRide(ride.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>{Ico.trash()}</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* DEFAULT: summary */}
              {!subView && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(bike.components||[]).length > 0 && (
                    <>
                      <p style={{ color:"#444", fontSize:11, letterSpacing:2, textTransform:"uppercase", margin:"4px 0 4px", fontFamily:"'DM Mono',monospace" }}>Active Parts</p>
                      {(bike.components||[]).map(c => {
                        const lr = c.resets.slice().sort((a,z) => z.date > a.date ? 1 : -1)[0];
                        return (
                          <div key={c.id} style={{ background:"#141414", borderRadius:14, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              {Ico.cog(color.primary, 15)}
                              <div>
                                <p style={{ color:"#fff", fontSize:15, margin:0, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{c.name}</p>
                                <p style={{ color:"#444", fontSize:11, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>since {fmtDate(lr.date)}</p>
                              </div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <p style={{ color:color.primary, fontWeight:800, fontSize:20, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{milesSince(bike.rides, lr.date).toFixed(2)}</p>
                              <p style={{ color:"#444", fontSize:10, margin:0, fontFamily:"'DM Mono',monospace" }}>mi since reset</p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {(bike.repairs||[]).length > 0 && (
                    <>
                      <p style={{ color:"#444", fontSize:11, letterSpacing:2, textTransform:"uppercase", margin:"8px 0 4px", fontFamily:"'DM Mono',monospace" }}>Latest Repair</p>
                      {[...(bike.repairs||[])].sort((a,b) => b.date > a.date ? 1 : -1).slice(0,1).map(rep => (
                        <div key={rep.id} style={{ background:"#141414", borderRadius:14, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {Ico.wrench(color.primary, 14)}
                            <div>
                              <p style={{ color:"#fff", fontSize:15, margin:0, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{rep.description}</p>
                              <p style={{ color:"#444", fontSize:11, margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>{fmtDate(rep.date)}</p>
                            </div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ color:"#fff", fontWeight:800, fontSize:20, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{milesSince(bike.rides, rep.date).toFixed(2)}</p>
                            <p style={{ color:"#444", fontSize:10, margin:0, fontFamily:"'DM Mono',monospace" }}>mi since</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {(bike.components||[]).length === 0 && (bike.repairs||[]).length === 0 && (
                    <Empty icon="🏁" text="Use the tabs above to view rides, repairs, or track a component." />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL */}
        {modal && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"flex-end", zIndex:100 }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            {modals[modal]}
          </div>
        )}

        {/* RETIRE MODAL */}
        {retireTarget && bike && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"flex-end", zIndex:100 }}
            onClick={e => { if (e.target === e.currentTarget) setRetireTarget(null); }}>
            <RetireModal
              component={retireTarget}
              bike={bike}
              color={color}
              onRetire={retireComponent}
              onClose={() => setRetireTarget(null)}
            />
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div style={{ position:"absolute", bottom:44, left:"50%", transform:"translateX(-50%)", background:"#fff", color:"#0d0d0d", padding:"10px 22px", borderRadius:100, fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", boxShadow:"0 4px 30px rgba(0,0,0,.5)", zIndex:200 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
