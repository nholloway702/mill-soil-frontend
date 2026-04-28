import { useState, useRef, useCallback } from "react";

const MILL_GREEN = "#1c3d20";
const MILL_GREEN_MID = "#2d5c34";
const MILL_GREEN_LIGHT = "#eaf2eb";
const MILL_GOLD = "#9a7209";
const MILL_GOLD_LIGHT = "#fdf6e3";
const MILL_SEAFOAM = "#4a7c5e";
const MILL_SEAFOAM_LIGHT = "#d6ebe0";
const MILL_BORDER = "#c8d8ca";

const STORES = [
  { id: 1, name: "The Mill of Bel Air" },
  { id: 2, name: "The Mill of Salisbury" },
  { id: 3, name: "The Mill of Whiteford" },
  { id: 4, name: "The Mill of Black Horse" },
  { id: 6, name: "The Mill of Hereford" },
  { id: 7, name: "The Mill of Hampstead" },
  { id: 8, name: "The Mill of Red Lion" },
  { id: 9, name: "The Mill of Kingstown" },
];

const SEGMENTS = [
  { id: "residential", label: "Residential", sub: "Homeowner lawn care — turf & grass only" },
  { id: "turf", label: "Turf / Contractor", sub: "Commercial turf management" },
  { id: "equine", label: "Equine & Livestock", sub: "Pasture management" },
  { id: "agronomy", label: "Agronomy", sub: "Row crop & farm fields" },
  { id: "garden", label: "Garden", sub: "Vegetable gardens, flower beds, raised beds & ornamentals — not for lawn care", fullWidth: true },
];

const CONTEXT_FIELDS = {
  residential: [
    { key: "grass_type", label: "Grass type", type: "select", options: ["Tall Fescue", "Kentucky Bluegrass", "Perennial Ryegrass", "Bermuda", "Zoysia", "Sun & Shade Mix", "Unknown"] },
    { key: "lawn_condition", label: "Lawn condition", type: "select", options: ["Established / Healthy", "Established / Struggling", "Thin / Patchy", "New Seeding", "Renovation"] },
    { key: "sun_exposure", label: "Sun exposure", type: "select", options: ["Full Sun", "Mostly Sun", "Mostly Shade", "Full Shade", "Mixed"] },
    { key: "soil_type", label: "Soil type", type: "select", options: ["Clay", "Sandy", "Loam", "Unknown"] },
    { key: "lawn_size", label: "Lawn size (sq ft)", type: "number", placeholder: "e.g. 8000" },
    { key: "primary_goal", label: "Primary goal", type: "select", options: ["Thicken turf", "Improve color", "Weed control", "Full renovation", "Maintenance"] },
  ],
  turf: [
    { key: "turf_type", label: "Turf type", type: "select", options: ["Tall Fescue", "Kentucky Bluegrass", "Perennial Ryegrass", "Bermuda", "Zoysia", "Athletic Mix", "Sun & Shade Mix", "Unknown"] },
    { key: "property_type", label: "Property type", type: "select", options: ["Athletic field", "HOA common area", "Golf fairway", "Commercial landscape", "Residential route"] },
    { key: "program_type", label: "Program type", type: "select", options: ["New install", "Renovation", "Maintenance", "Overseeding"] },
    { key: "area_size", label: "Area size", type: "select", options: ["Under 1 acre", "1-5 acres", "5-10 acres", "10-25 acres", "25-50 acres", "50+ acres"] },
    { key: "primary_goal", label: "Primary goal", type: "select", options: ["Thicken turf", "Improve color", "Weed control", "Full renovation", "Maintenance program"] },
  ],
  equine: [
    { key: "stock_type", label: "Type of livestock", type: "select", options: ["Horses", "Cattle", "Sheep", "Goats", "Mixed"] },
    { key: "pasture_size", label: "Total pasture acreage", type: "number", placeholder: "e.g. 10" },
    { key: "num_fields", label: "Number of fields/paddocks", type: "number", placeholder: "e.g. 3" },
    { key: "pasture_condition", label: "Pasture condition", type: "select", options: ["Good established stand", "Thin areas", "Needs renovation", "New seeding"] },
    { key: "primary_goal", label: "Primary goal", type: "select", options: ["Grazing", "Hay production", "Mixed grazing and hay"] },
    { key: "stocking_rate", label: "Stocking rate", type: "text", placeholder: "e.g. 4 horses on 10 acres" },
  ],
  agronomy: [
    { key: "crop", label: "Intended crop", type: "select", options: ["Corn", "Soybeans", "Winter Wheat", "Barley", "Hay", "Alfalfa", "Sorghum", "Clover", "Sunflower", "Cover crop"] },
    { key: "acreage", label: "Field acreage", type: "number", placeholder: "e.g. 45" },
    { key: "yield_goal", label: "Yield goal", type: "text", placeholder: "e.g. 180 bu/ac corn, 4 tons/ac hay" },
    { key: "tillage", label: "Tillage system", type: "select", options: ["No-till", "Conventional", "Strip-till", "Minimum till"] },
    { key: "previous_crop", label: "Previous crop", type: "select", options: ["Corn", "Soybeans", "Winter Wheat", "Fallow", "Other"] },
  ],
  garden: [
    { key: "garden_size", label: "Garden size (sq ft)", type: "number", placeholder: "e.g. 500" },
    { key: "garden_type", label: "Type of garden", type: "select", options: ["Vegetable garden", "Flower bed", "Raised bed", "Mixed ornamental", "Herb garden", "Mixed vegetables & flowers"] },
    { key: "crops", label: "What are you growing?", type: "text", placeholder: "e.g. Tomatoes, peppers, corn, mixed vegetables, perennials" },
    { key: "tillage", label: "Tillage plan", type: "select", options: ["Yes — rototilling before planting", "No — no-till / direct seed", "Raised bed with new soil mix", "Lightly hand-worked"] },
    { key: "soil_texture", label: "Soil texture", type: "select", options: ["Sandy / light", "Loam / average", "Clay / heavy", "Unknown"] },
    { key: "goals", label: "Goals", type: "text", placeholder: "e.g. Improve yield, fix soil, starting new bed, organic preferred" },
  ],
};

// ─── shared styles ────────────────────────────────────────────────────────────

const segStyle = (selected) => ({
  border: `1.5px solid ${selected ? MILL_GREEN : MILL_BORDER}`,
  borderRadius: 10,
  padding: "14px 16px",
  cursor: "pointer",
  background: selected ? MILL_GREEN_LIGHT : "white",
  transition: "all .15s",
  textAlign: "left",
});

const btnPrimary = {
  background: MILL_GREEN,
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "11px 28px",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnSecondary = {
  background: "white",
  color: MILL_GREEN,
  border: `1.5px solid ${MILL_GREEN}`,
  borderRadius: 8,
  padding: "10px 24px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};

const inputStyle = {
  width: "100%",
  border: `1px solid ${MILL_BORDER}`,
  borderRadius: 7,
  padding: "9px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  color: "#1a1a1a",
  background: "white",
  boxSizing: "border-box",
};

// ─── helper ───────────────────────────────────────────────────────────────────

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// ─── small shared components ──────────────────────────────────────────────────

function StatusBadge({ level }) {
  const map = {
    "Very Low": { bg: "#fde8e8", color: "#8b1a1a", label: "Very Low" },
    "Low": { bg: "#fef3cd", color: "#7a5000", label: "Low" },
    "Medium": { bg: "#fff8e1", color: "#8a6000", label: "Medium" },
    "Optimum": { bg: "#e6f4ea", color: "#1a5c28", label: "Optimum" },
    "Very High": { bg: "#e8f0fe", color: "#1a3a8f", label: "Very High" },
    "High": { bg: "#e8f0fe", color: "#1a3a8f", label: "High" },
  };
  const s = map[level] || { bg: "#f0f0f0", color: "#555", label: level };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 5, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>{title}</p>
    </div>
  );
}

function ProgressBar({ step }) {
  const steps = ["Store", "Segment", "Upload", "Context", "Review", "Report"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: i < step ? MILL_GREEN : i === step ? MILL_GREEN_MID : MILL_BORDER,
              color: i <= step ? "white" : "#888",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>{i < step ? "✓" : i + 1}</div>
            <span style={{ fontSize: 11, color: i === step ? MILL_GREEN : "#888", fontWeight: i === step ? 600 : 400, whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? MILL_GREEN : MILL_BORDER, margin: "0 6px", marginBottom: 18 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ZoneCard({ zone }) {
  const nutrients = [
    { name: "Soil pH", value: zone.ph, unit: "", status: zone.ph < 6.0 ? "Low" : zone.ph > 7.0 ? "High" : "Optimum" },
    { name: "Phosphorus", value: zone.p, unit: "ppm", status: zone.p < 30 ? "Low" : zone.p > 100 ? "High" : "Medium" },
    { name: "Potassium", value: zone.k, unit: "ppm", status: zone.k < 100 ? "Low" : zone.k > 250 ? "High" : "Medium" },
    { name: "Calcium", value: zone.ca, unit: "ppm", status: zone.ca < 500 ? "Low" : zone.ca > 2000 ? "High" : "Optimum" },
    { name: "Magnesium", value: zone.mg, unit: "ppm", status: zone.mg < 80 ? "Low" : zone.mg > 300 ? "High" : "Optimum" },
    { name: "Organic Matter", value: zone.om, unit: "%", status: zone.om < 2 ? "Low" : zone.om > 5 ? "High" : "Optimum" },
  ];
  return (
    <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {nutrients.map(n => (
            <div key={n.name} style={{ background: "#f7faf7", borderRadius: 7, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>{n.name}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN }}>{n.value}{n.unit}</div>
              <StatusBadge level={n.status} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, background: MILL_GOLD_LIGHT, color: MILL_GOLD, borderRadius: 5, padding: "3px 9px", fontWeight: 600 }}>
            CEC: {zone.cec} meq/100g
          </span>
          <span style={{ fontSize: 12, background: MILL_SEAFOAM_LIGHT, color: MILL_SEAFOAM, borderRadius: 5, padding: "3px 9px", fontWeight: 600 }}>
            %Ca: {zone.pctCa}  %Mg: {zone.pctMg}  %K: {zone.pctK}
          </span>
          <span style={{ fontSize: 12, background: "#f0f4ff", color: "#1a3a8f", borderRadius: 5, padding: "3px 9px", fontWeight: 600 }}>
            ENR: {zone.enr}
          </span>
        </div>
    </div>
  );
}

// ─── queue row ────────────────────────────────────────────────────────────────

const QUEUE_STATUS = {
  waiting:   { bg: "#f5f5f5",        color: "#666",    label: "Waiting" },
  analyzing: { bg: MILL_GREEN_LIGHT, color: MILL_GREEN, label: "Analyzing…" },
  receiving: { bg: MILL_GREEN_LIGHT, color: MILL_GREEN, label: "Receiving…" },
  retrying:  { bg: MILL_GOLD_LIGHT,  color: MILL_GOLD,  label: "Retrying…" },
  done:      { bg: "#e6f4ea",        color: "#1a5c28", label: "Done" },
  error:     { bg: "#fdecea",        color: "#c0392b", label: "Error" },
};

function QueueRow({ item, onRemove }) {
  const s = QUEUE_STATUS[item.status] || QUEUE_STATUS.waiting;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px",
      background: s.bg,
      border: `1px solid ${MILL_BORDER}`,
      borderRadius: 7, marginBottom: 6,
    }}>
      <span style={{ flex: 1, fontSize: 13, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.file.name}
      </span>
      {(item.status === "analyzing" || item.status === "retrying") && (
        <div style={{
          width: 14, height: 14, flexShrink: 0,
          border: `2px solid ${MILL_GREEN}`, borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
      )}
      {item.status === "error" && item.error && (
        <span style={{ fontSize: 11, color: "#c0392b", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.error}
        </span>
      )}
      <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
        {s.label}
      </span>
      {onRemove && item.status === "waiting" && (
        <button
          onClick={onRemove}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#aaa", fontSize: 18, padding: "0 2px", lineHeight: 1 }}
          title="Remove"
        >×</button>
      )}
    </div>
  );
}

// ─── context field (handles select / number / text) ───────────────────────────

function ContextField({ field, value, onChange }) {
  const label = (
    <label style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN, display: "block", marginBottom: 5 }}>
      {field.label}
    </label>
  );
  if (field.type === "select") {
    return (
      <div>
        {label}
        <select style={inputStyle} value={value || ""} onChange={e => onChange(e.target.value)}>
          <option value="">— select —</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      {label}
      <input
        type={field.type || "text"}
        style={inputStyle}
        placeholder={field.placeholder || ""}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── review step ──────────────────────────────────────────────────────────────

function ReviewStep({ item, segmentLabel, storeName, onApprove, onReject }) {
  const result = item.result;
  const severityColor = (s) => s === "critical" ? "#c0392b" : s === "warning" ? "#e67e22" : "#27ae60";
  const severityBg  = (s) => s === "critical" ? "#fdecea" : s === "warning" ? "#fef5e7" : "#eafaf1";

  return (
    <div>
      <SectionHeader title="Review analysis before finalizing" />

      {/* summary card */}
      <div style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: MILL_GREEN, color: "white", padding: "12px 16px" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{result.customer?.name}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{result.customer?.address}</div>
        </div>
        <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, borderBottom: `1px solid ${MILL_BORDER}` }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Segment</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN }}>{segmentLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Store</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN }}>{storeName || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Zones detected</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN }}>{result.zones?.length ?? 0}</div>
          </div>
        </div>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Executive summary</div>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, margin: 0 }}>{result.executiveSummary}</p>
        </div>
      </div>

      {/* key findings */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: MILL_GREEN, margin: 0 }}>
            Key findings ({result.keyFindings?.length ?? 0})
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.keyFindings?.map((f, i) => (
            <div key={i} style={{ background: severityBg(f.severity), border: `1px solid ${severityColor(f.severity)}33`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#222", flex: 1 }}>{f.finding}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 12 }}>
                <span style={{ fontSize: 11, color: "#888" }}>{f.zone}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: severityColor(f.severity), background: severityBg(f.severity), border: `1px solid ${severityColor(f.severity)}44`, borderRadius: 4, padding: "2px 7px" }}>
                  {f.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button style={btnPrimary} onClick={onApprove}>
          Looks good — generate full report →
        </button>
        <button
          style={{ ...btnSecondary, color: "#c0392b", borderColor: "#c0392b" }}
          onClick={onReject}
        >
          Something looks wrong — start over
        </button>
      </div>
    </div>
  );
}

// ─── individual report detail (with print support) ────────────────────────────

function ReportDetail({ item, segmentLabel, storeName, onBack, onReset, onSaveEdits }) {
  const result = item.result;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const r = isEditing ? draft : result;

  const startEdit  = () => { setDraft(JSON.parse(JSON.stringify(result))); setIsEditing(true); };
  const cancelEdit = () => { setDraft(null); setIsEditing(false); };
  const saveEdit   = () => { onSaveEdits(draft); setIsEditing(false); setDraft(null); };

  const setField = (field, val) => setDraft(d => ({ ...d, [field]: val }));
  const updateFinding = (i, val) => setDraft(d => ({
    ...d, keyFindings: d.keyFindings.map((f, idx) => idx === i ? { ...f, finding: val } : f),
  }));
  const deleteFinding = (i) => setDraft(d => ({
    ...d, keyFindings: d.keyFindings.filter((_, idx) => idx !== i),
  }));
  const updateApplication = (ti, ai, field, val) => setDraft(d => ({
    ...d, annualProgram: d.annualProgram.map((t, tIdx) => tIdx !== ti ? t : {
      ...t, applications: t.applications.map((a, aIdx) => aIdx !== ai ? a : { ...a, [field]: val }),
    }),
  }));
  const updateProduct = (i, field, val) => setDraft(d => ({
    ...d, productList: d.productList.map((p, idx) => idx !== i ? p : { ...p, [field]: val }),
  }));

  const editTA = {
    width: "100%", fontSize: 14, lineHeight: 1.6, fontFamily: "inherit",
    border: "1.5px solid #b8860b", borderRadius: 6, padding: "8px 10px",
    resize: "vertical", background: "#fffef8", color: "#222", boxSizing: "border-box",
  };
  const editIn = {
    width: "100%", fontSize: 13, fontFamily: "inherit",
    border: "1.5px solid #b8860b", borderRadius: 4, padding: "4px 7px",
    background: "#fffef8", color: "#222", boxSizing: "border-box",
  };

  const severityColor = (s) => s === "critical" ? "#c0392b" : s === "warning" ? "#e67e22" : "#27ae60";
  const severityBg  = (s) => s === "critical" ? "#fdecea" : s === "warning" ? "#fef5e7" : "#eafaf1";

  return (
    <div>
      {/* ── print styles ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @page {
          margin: 0.75in;
          size: auto;
        }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

          .no-print { display: none !important; }
          .print-show { display: block !important; }

          body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #000; }

          /* zone header — dark green */
          .zone-header { background: #1c3d20 !important; color: white !important; }

          /* section headers keep left accent */
          .section-header-bar { border-left: 3px solid #1c3d20 !important; }

          /* annual program timing row — seafoam */
          .timing-header { background: #4a7c5e !important; color: white !important; }

          /* product list header — light green */
          .product-list-header { background: #eaf2eb !important; }

          /* page breaks */
          .page-break-before { page-break-before: always; }
        }
      `}</style>

      {/* ── screen-only navigation ── */}
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {!isEditing && <button style={btnSecondary} onClick={onBack}>← Back to results</button>}
        {!isEditing && (
          <button
            style={{ ...btnPrimary, background: MILL_SEAFOAM }}
            onClick={() => {
              const originalTitle = document.title;
              document.title = `The Mill Soil Analysis - ${result.customer?.name || 'Report'}`;
              window.print();
              document.title = originalTitle;
            }}
          >
            Export PDF
          </button>
        )}
        {!isEditing && (
          <button style={{ ...btnPrimary, background: MILL_GOLD }} onClick={startEdit}>
            Edit Report
          </button>
        )}
        {isEditing && (
          <>
            <span style={{ fontSize: 13, fontWeight: 700, color: MILL_GOLD, border: `1.5px solid ${MILL_GOLD}`, borderRadius: 6, padding: "4px 12px" }}>
              Editing
            </span>
            <button style={{ ...btnPrimary, background: MILL_GREEN }} onClick={saveEdit}>
              Save Changes
            </button>
            <button style={btnSecondary} onClick={cancelEdit}>
              Cancel
            </button>
          </>
        )}
        {!isEditing && <button style={{ ...btnSecondary, marginLeft: "auto" }} onClick={onReset}>Start new analysis</button>}
      </div>

      <div className="print-content">
        {/* ── print-only report header ── */}
        <div className="print-show" style={{ display: "none", marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid #1c3d20" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#1c3d20" }}>The Mill</div>
            <div style={{ fontSize: 13, color: "#444", marginTop: 2 }}>Soil Analysis Report</div>
          </div>
        </div>

        {/* ── customer header ── */}
        <div style={{ background: MILL_GREEN, color: "white", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{result.customer?.name}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{result.customer?.address}</div>
            {storeName && (
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>{storeName}</div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Report #{result.customer?.reportNumber}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{result.customer?.date}</div>
            <div style={{ marginTop: 6, background: "rgba(255,255,255,0.2)", borderRadius: 5, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{segmentLabel}</div>
          </div>
        </div>

        {/* ── executive summary ── */}
        <div style={{ background: MILL_GOLD_LIGHT, border: `1px solid ${MILL_GOLD}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: MILL_GOLD, marginBottom: 6 }}>EXECUTIVE SUMMARY</div>
          {isEditing
            ? <textarea rows={5} style={editTA} value={draft.executiveSummary || ""} onChange={e => setField("executiveSummary", e.target.value)} />
            : <p style={{ fontSize: 14, color: "#3a2800", lineHeight: 1.6, margin: 0 }}>{r.executiveSummary}</p>
          }
        </div>

        {/* ── key findings ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Key findings</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {r.keyFindings?.map((f, i) => (
              <div key={i} style={{ background: severityBg(f.severity), border: `1px solid ${severityColor(f.severity)}33`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                {isEditing
                  ? <input style={{ ...editIn, flex: 1 }} value={f.finding} onChange={e => updateFinding(i, e.target.value)} />
                  : <div style={{ fontSize: 13, color: "#222", flex: 1 }}>{f.finding}</div>
                }
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>{f.zone}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: severityColor(f.severity), background: severityBg(f.severity), border: `1px solid ${severityColor(f.severity)}44`, borderRadius: 4, padding: "2px 7px" }}>
                    {f.severity}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => deleteFinding(i)}
                      style={{ background: "#c0392b", color: "white", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── zone results ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Zone results</p>
          </div>
          {result.zones?.map((z, i) => (
            <div key={i} style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
              <div className="zone-header" style={{ background: MILL_GREEN, color: "white", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Zone: {z.sampleId}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Lab #{z.labNumber}</span>
              </div>
              <ZoneCard zone={z} />
            </div>
          ))}
        </div>

        {/* ── farm fertility summary (agronomy only) ── */}
        {segmentLabel === "Agronomy" && result.farmSummaryTable?.rows?.length > 0 && (() => {
          const tbl = result.farmSummaryTable;
          const numKeys = ["ph", "lime", "n", "p2o5", "k2o", "mg", "s", "zn", "b"];
          const cellBg = (key, val) => {
            if (typeof val !== "number") return "transparent";
            if (val === 0) return "#f0f0f0";
            if (key === "n" && val > 200) return "#e6f4ea";
            if (key === "p2o5" && val > 80) return "#e6f4ea";
            if (key === "k2o" && val > 100) return "#e6f4ea";
            return "transparent";
          };
          const cellColor = (key, val) => {
            if (typeof val === "number" && val === 0) return "#bbb";
            return "#222";
          };
          const rowKeys = ["field", "crop", "yieldGoal", "ph", "lime", "n", "p2o5", "k2o", "mg", "s", "zn", "b", "notes"];
          return (
            <div style={{ marginBottom: 20 }}>
              <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Farm fertility summary</p>
              </div>
              <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${MILL_BORDER}` }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, minWidth: 860 }}>
                  <thead>
                    <tr>
                      {tbl.headers.map((h, i) => (
                        <th key={i} style={{
                          background: MILL_GREEN, color: "white", padding: "8px 10px",
                          textAlign: "left", fontWeight: 700, whiteSpace: "nowrap",
                          borderRight: i < tbl.headers.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tbl.rows.map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? "white" : "#fafcfa" }}>
                        {rowKeys.map((key, ci) => {
                          const val = row[key];
                          const bg = cellBg(key, val);
                          const col = cellColor(key, val);
                          const isNotes = key === "notes";
                          return (
                            <td key={ci} style={{
                              padding: "7px 10px",
                              borderTop: `1px solid ${MILL_BORDER}`,
                              borderRight: ci < rowKeys.length - 1 ? `1px solid ${MILL_BORDER}` : "none",
                              background: bg,
                              color: col,
                              whiteSpace: isNotes ? "normal" : "nowrap",
                              lineHeight: 1.4,
                              maxWidth: isNotes ? 200 : undefined,
                            }}>
                              {val === 0 ? "—" : (val ?? "—")}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ── lime strategy ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Lime correction strategy</p>
          </div>
          <div style={{ background: "#f4f9f4", border: `1px solid ${MILL_BORDER}`, borderRadius: 8, padding: "14px 16px", fontSize: 14, lineHeight: 1.7, color: "#222" }}>
            {isEditing
              ? <textarea rows={6} style={editTA} value={draft.limeStrategy || ""} onChange={e => setField("limeStrategy", e.target.value)} />
              : r.limeStrategy
            }
          </div>
        </div>

        {/* ── annual program ── */}
        <div style={{ marginBottom: 20 }} className="page-break-before">
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Annual application program</p>
          </div>
          {r.annualProgram?.map((timing, ti) => (
            <div key={ti} style={{ marginBottom: 14 }}>
              <div className="timing-header" style={{ background: MILL_SEAFOAM, color: "white", borderRadius: "8px 8px 0 0", padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>
                {timing.timing}
              </div>
              <div style={{ border: `1px solid ${MILL_BORDER}`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                {timing.applications?.map((app, ai) => (
                  <div key={ai} style={{ padding: "10px 14px", borderBottom: ai < timing.applications.length - 1 ? `1px solid ${MILL_BORDER}` : "none" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Zone</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN }}>{app.zone}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Product</div>
                        {isEditing ? (
                          <>
                            <input style={editIn} value={app.product || ""} onChange={e => updateApplication(ti, ai, "product", e.target.value)} />
                            <input style={{ ...editIn, marginTop: 4 }} value={app.rate || ""} placeholder="Rate" onChange={e => updateApplication(ti, ai, "rate", e.target.value)} />
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{app.product}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>{app.rate}</div>
                          </>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Purpose</div>
                        {isEditing
                          ? <input style={editIn} value={app.purpose || ""} onChange={e => updateApplication(ti, ai, "purpose", e.target.value)} />
                          : <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{app.purpose}</div>
                        }
                      </div>
                    </div>
                    {(isEditing || app.method || app.notes) && (
                      <div style={{ display: "flex", gap: 12, paddingTop: 6, borderTop: `1px solid ${MILL_BORDER}55`, flexWrap: "wrap" }}>
                        {isEditing ? (
                          <>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Method</div>
                              <input style={editIn} value={app.method || ""} placeholder="Application method (optional)" onChange={e => updateApplication(ti, ai, "method", e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Notes</div>
                              <input style={editIn} value={app.notes || ""} placeholder="Notes (optional)" onChange={e => updateApplication(ti, ai, "notes", e.target.value)} />
                            </div>
                          </>
                        ) : (
                          <>
                            {app.method && <div style={{ fontSize: 11, color: "#444" }}><span style={{ fontWeight: 700, color: MILL_GREEN }}>Method: </span>{app.method}</div>}
                            {app.notes && <div style={{ fontSize: 11, color: "#666", fontStyle: "italic", flex: 1 }}>{app.notes}</div>}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── product list ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Recommended products (Mill purchase list)</p>
          </div>
          <div style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 8, overflow: "hidden" }}>
            <div className="product-list-header" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", background: MILL_GREEN_LIGHT, padding: "8px 14px", gap: 8 }}>
              {["Product", "Type", "Est. Qty", "Purpose"].map(h => (
                <div key={h} style={{ fontSize: 12, fontWeight: 700, color: MILL_GREEN }}>{h}</div>
              ))}
            </div>
            {r.productList?.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "10px 14px", gap: 8, borderTop: `1px solid ${MILL_BORDER}`, background: i % 2 === 0 ? "white" : "#fafcfa" }}>
                {isEditing ? (
                  <>
                    <input style={editIn} value={p.product || ""} onChange={e => updateProduct(i, "product", e.target.value)} />
                    <input style={editIn} value={p.type || ""} onChange={e => updateProduct(i, "type", e.target.value)} />
                    <input style={editIn} value={p.estimatedQty || ""} onChange={e => updateProduct(i, "estimatedQty", e.target.value)} />
                    <input style={editIn} value={p.purpose || ""} onChange={e => updateProduct(i, "purpose", e.target.value)} />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{p.product}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{p.type}</div>
                    <div style={{ fontSize: 12, color: MILL_GOLD, fontWeight: 600 }}>{p.estimatedQty}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{p.purpose}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── customer notes ── */}
        <div style={{ background: MILL_SEAFOAM_LIGHT, border: `1px solid ${MILL_SEAFOAM}`, borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: MILL_SEAFOAM, marginBottom: 6 }}>NOTE TO CUSTOMER</div>
          {isEditing
            ? <textarea rows={5} style={editTA} value={draft.customerNotes || ""} onChange={e => setField("customerNotes", e.target.value)} />
            : <p style={{ fontSize: 14, color: "#1a3a2a", lineHeight: 1.6, margin: 0 }}>{r.customerNotes}</p>
          }
        </div>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert agronomist and soil fertility specialist working for The Mill, a family-owned agricultural retail store in Bel Air, MD. You analyze soil lab reports and generate comprehensive, actionable plans for customers.

You will receive a soil sample PDF and customer context. Return a JSON object ONLY with no markdown or preamble, matching this exact structure:

{
  "customer": {
    "name": "string",
    "address": "string",
    "reportNumber": "string",
    "date": "string"
  },
  "zones": [
    {
      "sampleId": "string (e.g. Front, Back, Field A)",
      "labNumber": "string",
      "ph": number,
      "bufferPh": number,
      "p": number,
      "k": number,
      "ca": number,
      "mg": number,
      "om": number,
      "cec": number,
      "pctCa": number,
      "pctMg": number,
      "pctK": number,
      "enr": number,
      "limeRec": { "lbs": number, "tons": number },
      "fertRec": { "n": number, "p2o5": number, "k2o": number }
    }
  ],
  "executiveSummary": "2-3 sentence plain-English summary of the overall soil health and what this customer most needs to address. Written for the customer, not a scientist.",
  "keyFindings": [
    { "finding": "string", "severity": "critical|warning|good", "zone": "string or All Zones" }
  ],
  "annualProgram": [
    {
      "timing": "string (e.g. Early Spring - March/April)",
      "applications": [
        {
          "zone": "string",
          "product": "string (use real Mill product names or common products like Jonathan Green, Scott's, Lebanon, Hi-Yield, etc.)",
          "rate": "string (e.g. 4 lbs per 1000 sq ft)",
          "purpose": "string (1 short sentence why)",
          "method": "string (optional — application method, e.g. broadcast incorporated, 2x2 in-furrow, UAN coulter injection. Omit or empty string for non-agronomy.)",
          "notes": "string (optional — lab-specific comments or special instructions. Omit or empty string if none.)"
        }
      ]
    }
  ],
  "limeStrategy": "string - plain English explanation of the lime correction plan, split applications, timing",
  "productList": [
    {
      "product": "string",
      "type": "string (e.g. Fertilizer, Lime, Soil Amendment)",
      "estimatedQty": "string",
      "purpose": "string"
    }
  ],
  "customerNotes": "string - 2-3 sentences of plain English advice written directly to the customer. Warm and helpful tone.",
  "farmSummaryTable": {
    "_note": "AGRONOMY SEGMENT ONLY — omit this field entirely for residential, turf, and equine reports.",
    "headers": ["Field", "Crop", "Yield Goal", "pH", "Lime (tons/acre)", "N (lbs/acre)", "P2O5 (lbs/acre)", "K2O (lbs/acre)", "Mg (lbs/acre)", "S (lbs/acre)", "Zn (lbs/acre)", "B (lbs/acre)", "Notes"],
    "rows": [
      {
        "field": "string — field/sample name",
        "crop": "string — intended crop from lab rec table",
        "yieldGoal": "string — yield goal from lab rec table",
        "ph": "number — soil pH",
        "lime": "number — tons/acre (0 if none needed)",
        "n": "number — lbs N/acre",
        "p2o5": "number — lbs P2O5/acre",
        "k2o": "number — lbs K2O/acre",
        "mg": "number — lbs Mg/acre (0 if none)",
        "s": "number — lbs S/acre (0 if none)",
        "zn": "number — lbs Zn/acre (0 if none)",
        "b": "number — lbs B/acre (0 if none)",
        "notes": "string — lab application comments for this field"
      }
    ]
  }
}`;

export default function MillSoilAgent() {
  // step: 0=Store, 1=Segment, 2=Upload, 3=Context, 4=Analysis
  const [step, setStep] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null); // persists for session — not cleared on reset
  const [segment, setSegment] = useState(null);
  // queue: [{ id, file, base64, status, context, result, error }]
  const [queue, setQueue] = useState([]);
  const [sharedContext, setSharedContext] = useState({});
  const [processing, setProcessing] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);  // item pending review before full report
  const [activeReport, setActiveReport] = useState(null); // item showing full report
  const fileRef = useRef();

  const segmentLabel = SEGMENTS.find(s => s.id === segment)?.label || "";
  const selectedStoreName = STORES.find(s => s.id === selectedStore)?.name || "";
  const fields = CONTEXT_FIELDS[segment] || [];
  const isAgronomy = segment === "agronomy";

  // ── file handling ──────────────────────────────────────────────────────────

  const addFiles = useCallback(async (fileList) => {
    const pdfs = Array.from(fileList).filter(f => f.type === "application/pdf");
    if (!pdfs.length) return;
    const items = await Promise.all(
      pdfs.map(async (file, i) => {
        const base64 = await readFileAsBase64(file);
        console.log(`[pdf] "${file.name}" base64 size: ${(base64.length / 1024).toFixed(1)} KB`);
        if (base64.length > 5 * 1024 * 1024) {
          return {
            id: `${Date.now()}-${i}-${file.name}`,
            file,
            base64: null,
            status: "error",
            context: {},
            result: null,
            error: "This PDF is too large to process. Please try splitting it into smaller files.",
          };
        }
        return {
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          base64,
          status: "waiting",
          context: {},
          result: null,
          error: null,
        };
      })
    );
    setQueue(prev => [...prev, ...items]);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFromQueue = (id) => setQueue(prev => prev.filter(q => q.id !== id));

  const updateQueueItem = (id, patch) =>
    setQueue(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  // ── batch analysis ─────────────────────────────────────────────────────────

  const runBatchAnalysis = async () => {
    setStep(4);
    setProcessing(true);
    // snapshot so loop indices are stable
    const snapshot = [...queue];

    for (const item of snapshot) {
      if (item.status === "error") continue;
      updateQueueItem(item.id, { status: "analyzing" });

      const ctx = isAgronomy ? item.context : sharedContext;
      const contextStr = Object.entries(ctx)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
        .join("\n");

      const userMsg = `Segment: ${segmentLabel}\n\nCustomer context:\n${contextStr}\n\nPlease analyze the attached soil report PDF and return the JSON plan.`;

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const requestBody = JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          selectedStore: selectedStoreName,
          messages: [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: item.base64 } },
              { type: "text", text: userMsg },
            ],
          }],
        });

        console.log(`[fetch] Sending to: ${apiUrl}`);
        console.log(`[fetch] "${item.file.name}" body size: ${(requestBody.length / 1024).toFixed(1)} KB`);

        const attemptFetch = () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
          return fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        };

        let response;
        try {
          response = await attemptFetch();
        } catch (fetchErr) {
          if (fetchErr.name === "AbortError") {
            throw new Error("Analysis timed out. Please try again.");
          }
          console.warn(`[fetch] Network error for "${item.file.name}": ${fetchErr.message}. Retrying in 3s…`);
          updateQueueItem(item.id, { status: "retrying" });
          await new Promise(r => setTimeout(r, 3000));
          try {
            response = await attemptFetch();
          } catch (retryErr) {
            if (retryErr.name === "AbortError") {
              throw new Error("Analysis timed out. Please try again.");
            }
            throw new Error("Cannot reach the analysis server. Please check your connection.");
          }
        }

        // Handle 422 (AI returned invalid JSON) — retry once before giving up
        if (response.status === 422) {
          let errData = {};
          try { errData = await response.json(); } catch {}
          if (errData.raw) console.error(`[parse] AI returned invalid JSON for "${item.file.name}":`, errData.raw);
          console.warn(`[fetch] 422 parse error for "${item.file.name}" — retrying once…`);
          updateQueueItem(item.id, { status: "retrying" });
          await new Promise(r => setTimeout(r, 3000));
          try {
            response = await attemptFetch();
          } catch (retryErr) {
            if (retryErr.name === "AbortError") throw new Error("Analysis timed out. Please try again.");
            throw new Error("Cannot reach the analysis server. Please check your connection.");
          }
          if (response.status === 422) {
            let errData2 = {};
            try { errData2 = await response.json(); } catch {}
            if (errData2.raw) console.error(`[parse] AI returned invalid JSON on retry for "${item.file.name}":`, errData2.raw);
            throw new Error("Analysis failed — the AI returned an unexpected response. Please try again.");
          }
        }

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        updateQueueItem(item.id, { status: "analyzing" });
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/event-stream")) {
          updateQueueItem(item.id, { status: "receiving" });
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const evt = JSON.parse(data);
                if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                  accumulated += evt.delta.text;
                }
              } catch {}
            }
          }
          const parsed = JSON.parse(accumulated.replace(/```json|```/g, "").trim());
          updateQueueItem(item.id, { status: "done", result: parsed });
        } else {
          const data = await response.json();
          const raw = data.content?.find(b => b.type === "text")?.text || "";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          updateQueueItem(item.id, { status: "done", result: parsed });
        }
      } catch (err) {
        updateQueueItem(item.id, { status: "error", error: err.message });
      }
    }

    setProcessing(false);
  };

  // ── reset — preserves selectedStore for session ────────────────────────────

  const reset = () => {
    setStep(0);
    setSegment(null);
    setQueue([]);
    setSharedContext({});
    setProcessing(false);
    setReviewItem(null);
    setActiveReport(null);
    // selectedStore intentionally preserved
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const doneCount   = queue.filter(q => q.status === "done").length;
  const errorCount  = queue.filter(q => q.status === "error").length;
  const isReceiving = queue.some(q => q.status === "receiving");

  // ── full report view ───────────────────────────────────────────────────────

  if (activeReport !== null) {
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 4px" }}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${MILL_GREEN}` }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: MILL_GREEN, margin: 0 }}>Soil Analysis Agent</h1>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>The Mill</p>
          </div>
        </div>
        <div className="no-print"><ProgressBar step={5} /></div>
        <ReportDetail
          item={activeReport}
          segmentLabel={segmentLabel}
          storeName={selectedStoreName}
          onBack={() => setActiveReport(null)}
          onReset={reset}
          onSaveEdits={(updated) => {
            updateQueueItem(activeReport.id, { result: updated });
            setActiveReport(prev => ({ ...prev, result: updated }));
          }}
        />
      </div>
    );
  }

  // ── review step ────────────────────────────────────────────────────────────

  if (reviewItem !== null) {
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${MILL_GREEN}` }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: MILL_GREEN, margin: 0 }}>Soil Analysis Agent</h1>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>The Mill</p>
          </div>
        </div>
        <ProgressBar step={4} />
        <ReviewStep
          item={reviewItem}
          segmentLabel={segmentLabel}
          storeName={selectedStoreName}
          onApprove={() => { setActiveReport(reviewItem); setReviewItem(null); }}
          onReject={reset}
        />
      </div>
    );
  }

  // ── main multi-step layout ─────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 4px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${MILL_GREEN}` }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: MILL_GREEN, margin: 0 }}>Soil Analysis Agent</h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>The Mill</p>
        </div>
      </div>

      <ProgressBar step={step} />

      {/* ── STEP 0 — Store selection ── */}
      {step === 0 && (
        <div>
          <SectionHeader title="Select your store" />
          <div style={{ marginBottom: 20 }}>
            <select
              style={{ ...inputStyle, fontSize: 15, padding: "11px 14px" }}
              value={selectedStore ?? ""}
              onChange={e => setSelectedStore(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— select a store —</option>
              {STORES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button
            style={{ ...btnPrimary, opacity: selectedStore ? 1 : 0.4 }}
            disabled={!selectedStore}
            onClick={() => setStep(1)}
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 1 — Segment ── */}
      {step === 1 && (
        <div>
          <SectionHeader title="Select customer segment" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {SEGMENTS.map(s => (
              <div
                key={s.id}
                style={{ ...segStyle(segment === s.id), ...(s.fullWidth ? { gridColumn: "1 / -1" } : {}) }}
                onClick={() => setSegment(s.id)}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: s.fullWidth ? MILL_SEAFOAM : MILL_GREEN }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnSecondary} onClick={() => setStep(0)}>← Back</button>
            <button style={{ ...btnPrimary, opacity: segment ? 1 : 0.4 }} disabled={!segment} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 — Upload (multi-file) ── */}
      {step === 2 && (
        <div>
          <SectionHeader title="Upload soil lab reports (PDF)" />

          {/* drop zone */}
          <div
            style={{
              border: `2px dashed ${queue.length > 0 ? MILL_GREEN : MILL_BORDER}`,
              borderRadius: 10, padding: "28px 24px", textAlign: "center",
              cursor: "pointer", background: queue.length > 0 ? MILL_GREEN_LIGHT : "#fafafa",
              marginBottom: 16, transition: "all .15s",
            }}
            onClick={() => fileRef.current.click()}
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
          >
            {queue.length > 0 ? (
              <>
                <div style={{ fontWeight: 700, color: MILL_GREEN, fontSize: 14 }}>
                  {queue.length} PDF{queue.length > 1 ? "s" : ""} queued
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Drop or click to add more</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, color: MILL_GREEN, fontSize: 14 }}>Drop PDFs here or click to browse</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Soil lab reports — select one or multiple</div>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: "none" }}
              onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
            />
          </div>

          {/* queue list */}
          {queue.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {queue.map(item => (
                <QueueRow key={item.id} item={item} onRemove={() => removeFromQueue(item.id)} />
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnSecondary} onClick={() => { setStep(1); setQueue([]); }}>← Back</button>
            <button
              style={{ ...btnPrimary, opacity: queue.length > 0 ? 1 : 0.4 }}
              disabled={queue.length === 0}
              onClick={() => setStep(3)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Context ── */}
      {step === 3 && (
        <div>
          {isAgronomy ? (
            /* per-PDF context cards for Agronomy */
            <div>
              <SectionHeader title={`Agronomy — field details per report (${queue.length} PDF${queue.length > 1 ? "s" : ""})`} />
              {queue.map((item, i) => (
                <div key={item.id} style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ background: MILL_GREEN_LIGHT, borderBottom: `1px solid ${MILL_BORDER}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: MILL_GREEN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.file.name}
                    </span>
                    <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>Report {i + 1} of {queue.length}</span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {fields.map(f => (
                        <ContextField
                          key={f.key}
                          field={f}
                          value={item.context[f.key] || ""}
                          onChange={val => updateQueueItem(item.id, { context: { ...item.context, [f.key]: val } })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* shared context for Residential / Turf / Equine */
            <div>
              <SectionHeader title={`${segmentLabel} — field & customer details`} />
              {queue.length > 1 && (
                <div style={{ background: MILL_GOLD_LIGHT, border: `1px solid ${MILL_GOLD}`, borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#5a3a00" }}>
                  These details apply to all {queue.length} reports in this batch.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {fields.map(f => (
                  <ContextField
                    key={f.key}
                    field={f}
                    value={sharedContext[f.key] || ""}
                    onChange={val => setSharedContext(prev => ({ ...prev, [f.key]: val }))}
                  />
                ))}
              </div>

              {/* compact file list */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Files in batch
                </div>
                {queue.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9faf9", border: `1px solid ${MILL_BORDER}`, borderRadius: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnSecondary} onClick={() => setStep(2)} disabled={processing}>← Back</button>
            <button style={btnPrimary} onClick={runBatchAnalysis} disabled={processing}>
              Run Analysis ({queue.length} PDF{queue.length > 1 ? "s" : ""}) →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4 — Processing / Results list ── */}
      {step === 4 && (
        <div>
          {processing ? (
            <>
              <SectionHeader title={`Processing ${queue.length} report${queue.length > 1 ? "s" : ""}…`} />
              <div style={{ marginBottom: 20 }}>
                {queue.map(item => (
                  <QueueRow key={item.id} item={item} />
                ))}
              </div>
              <div style={{ padding: "14px 16px", background: MILL_GREEN_LIGHT, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 18, height: 18, flexShrink: 0, border: `2px solid ${MILL_GREEN}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 13, color: MILL_GREEN, fontWeight: 600 }}>
                  {isReceiving ? "Receiving analysis — please keep this tab open" : "Analyzing — please keep this tab open"}
                </span>
              </div>
            </>
          ) : (
            <>
              <SectionHeader title={`Analysis complete — ${doneCount} of ${queue.length} succeeded${errorCount > 0 ? `, ${errorCount} failed` : ""}`} />

              {/* results rows */}
              <div style={{ marginBottom: 20 }}>
                {queue.map(item => {
                  if (item.status === "done" && item.result) {
                    return (
                      <div key={item.id} style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 10, marginBottom: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.result.customer?.name || item.file.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{item.result.customer?.address}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                            {item.result.zones?.length ?? 0} zone{(item.result.zones?.length ?? 0) !== 1 ? "s" : ""} · {segmentLabel}
                          </div>
                        </div>
                        <button style={{ ...btnPrimary, flexShrink: 0, fontSize: 13, padding: "9px 18px" }} onClick={() => setReviewItem(item)}>
                          Review →
                        </button>
                      </div>
                    );
                  }
                  if (item.status === "error") {
                    return (
                      <div key={item.id} style={{ border: "1px solid #f5c6c6", borderRadius: 10, marginBottom: 10, padding: "12px 16px", background: "#fdecea", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#c0392b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.file.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#922", marginTop: 2 }}>{item.error}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#c0392b", background: "#fde8e8", borderRadius: 5, padding: "3px 10px", flexShrink: 0 }}>Error</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <button style={btnSecondary} onClick={reset}>← Start new analysis</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
