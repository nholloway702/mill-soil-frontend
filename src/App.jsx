import { useState, useRef, useCallback } from "react";

const MILL_GREEN = "#1c3d20";
const MILL_GREEN_MID = "#2d5c34";
const MILL_GREEN_LIGHT = "#eaf2eb";
const MILL_GOLD = "#9a7209";
const MILL_GOLD_LIGHT = "#fdf6e3";
const MILL_SEAFOAM = "#4a7c5e";
const MILL_SEAFOAM_LIGHT = "#d6ebe0";
const MILL_BORDER = "#c8d8ca";

const SEGMENTS = [
  { id: "residential", label: "Residential", sub: "Homeowner lawn & garden" },
  { id: "turf", label: "Turf / Contractor", sub: "Commercial turf management" },
  { id: "equine", label: "Equine & Livestock", sub: "Pasture management" },
  { id: "agronomy", label: "Agronomy", sub: "Row crop & farm fields" },
];

const CONTEXT_FIELDS = {
  residential: [
    { key: "grass_type", label: "Grass type", placeholder: "e.g. Tall Fescue, Kentucky Bluegrass" },
    { key: "lawn_size", label: "Lawn size (sq ft)", placeholder: "e.g. 8000" },
    { key: "lawn_age", label: "Lawn condition", placeholder: "e.g. Established, New seeding, Renovation" },
    { key: "goals", label: "Customer goals", placeholder: "e.g. Thicken turf, improve color, reduce weeds" },
  ],
  turf: [
    { key: "grass_type", label: "Turf type", placeholder: "e.g. Bermuda, Zoysia, Tall Fescue" },
    { key: "area_size", label: "Area size (sq ft or acres)", placeholder: "e.g. 2 acres" },
    { key: "use_type", label: "Use type", placeholder: "e.g. Athletic field, golf fairway, HOA common area" },
    { key: "goals", label: "Program goals", placeholder: "e.g. Competition-ready, maintenance program, renovation" },
  ],
  equine: [
    { key: "pasture_size", label: "Total pasture acreage", placeholder: "e.g. 10 acres" },
    { key: "num_fields", label: "Number of fields/paddocks", placeholder: "e.g. 3 fields" },
    { key: "stock_type", label: "Type of livestock", placeholder: "e.g. Horses, cattle, goats, mixed" },
    { key: "stocking_rate", label: "Stocking rate", placeholder: "e.g. 4 horses on 10 acres" },
    { key: "pasture_condition", label: "Current pasture condition", placeholder: "e.g. Established stand, thin areas, needs renovation" },
    { key: "goals", label: "Management goals", placeholder: "e.g. Improve stand density, hay production, reduce weeds, year-round grazing" },
  ],
  agronomy: [
    { key: "crop", label: "Intended crop", placeholder: "e.g. Corn, Soybeans, Winter Wheat, Hay, Alfalfa, Barley, Sorghum" },
    { key: "acreage", label: "Field acreage", placeholder: "e.g. 45 acres" },
    { key: "yield_goal", label: "Yield goal", placeholder: "e.g. 180 bu/ac corn, 50 bu/ac soybeans, 4 tons/ac hay" },
    { key: "tillage", label: "Tillage system", placeholder: "e.g. No-till, conventional, strip-till" },
    { key: "previous_crop", label: "Previous crop", placeholder: "e.g. Soybeans, Corn, Fallow" },
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
  const steps = ["Segment", "Upload", "Context", "Analysis"];
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

// ─── individual report detail (with print support) ────────────────────────────

function ReportDetail({ item, segmentLabel, onBack, onReset }) {
  const result = item.result;
  const severityColor = (s) => s === "critical" ? "#c0392b" : s === "warning" ? "#e67e22" : "#27ae60";
  const severityBg  = (s) => s === "critical" ? "#fdecea" : s === "warning" ? "#fef5e7" : "#eafaf1";

  return (
    <div>
      {/* ── print styles ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

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
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button style={btnSecondary} onClick={onBack}>← Back to results</button>
        <button
          style={{ ...btnPrimary, background: MILL_SEAFOAM }}
          onClick={() => window.print()}
        >
          Export PDF
        </button>
        <button style={{ ...btnSecondary, marginLeft: "auto" }} onClick={onReset}>Start new analysis</button>
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
          <p style={{ fontSize: 14, color: "#3a2800", lineHeight: 1.6, margin: 0 }}>{result.executiveSummary}</p>
        </div>

        {/* ── key findings ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Key findings</p>
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

        {/* ── lime strategy ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Lime correction strategy</p>
          </div>
          <div style={{ background: "#f4f9f4", border: `1px solid ${MILL_BORDER}`, borderRadius: 8, padding: "14px 16px", fontSize: 14, lineHeight: 1.7, color: "#222" }}>
            {result.limeStrategy}
          </div>
        </div>

        {/* ── annual program ── */}
        <div style={{ marginBottom: 20 }} className="page-break-before">
          <div className="section-header-bar" style={{ borderLeft: `3px solid ${MILL_GREEN}`, paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: MILL_GREEN, margin: 0 }}>Annual application program</p>
          </div>
          {result.annualProgram?.map((timing, ti) => (
            <div key={ti} style={{ marginBottom: 14 }}>
              <div className="timing-header" style={{ background: MILL_SEAFOAM, color: "white", borderRadius: "8px 8px 0 0", padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>
                {timing.timing}
              </div>
              <div style={{ border: `1px solid ${MILL_BORDER}`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                {timing.applications?.map((app, ai) => (
                  <div key={ai} style={{ padding: "10px 14px", borderBottom: ai < timing.applications.length - 1 ? `1px solid ${MILL_BORDER}` : "none", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Zone</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN }}>{app.zone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Product</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{app.product}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{app.rate}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Purpose</div>
                      <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{app.purpose}</div>
                    </div>
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
            {result.productList?.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "10px 14px", gap: 8, borderTop: `1px solid ${MILL_BORDER}`, background: i % 2 === 0 ? "white" : "#fafcfa" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{p.product}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{p.type}</div>
                <div style={{ fontSize: 12, color: MILL_GOLD, fontWeight: 600 }}>{p.estimatedQty}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{p.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── customer notes ── */}
        <div style={{ background: MILL_SEAFOAM_LIGHT, border: `1px solid ${MILL_SEAFOAM}`, borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: MILL_SEAFOAM, marginBottom: 6 }}>NOTE TO CUSTOMER</div>
          <p style={{ fontSize: 14, color: "#1a3a2a", lineHeight: 1.6, margin: 0 }}>{result.customerNotes}</p>
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
          "purpose": "string (1 short sentence why)"
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
  "customerNotes": "string - 2-3 sentences of plain English advice written directly to the customer. Warm and helpful tone."
}`;

export default function MillSoilAgent() {
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState(null);
  // queue: [{ id, file, base64, status, context, result, error }]
  const [queue, setQueue] = useState([]);
  const [sharedContext, setSharedContext] = useState({});
  const [processing, setProcessing] = useState(false);
  const [activeReport, setActiveReport] = useState(null); // queue item being viewed
  const fileRef = useRef();

  const segmentLabel = SEGMENTS.find(s => s.id === segment)?.label || "";
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
    setStep(3);
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
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
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

  // ── reset ──────────────────────────────────────────────────────────────────

  const reset = () => {
    setStep(0);
    setSegment(null);
    setQueue([]);
    setSharedContext({});
    setProcessing(false);
    setActiveReport(null);
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const doneCount   = queue.filter(q => q.status === "done").length;
  const errorCount  = queue.filter(q => q.status === "error").length;
  const isReceiving = queue.some(q => q.status === "receiving");

  // ── individual report view (replaces step 3 content) ─────────────────────

  if (step === 3 && activeReport !== null) {
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 4px" }}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${MILL_GREEN}` }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: MILL_GREEN, margin: 0 }}>Soil Analysis Agent</h1>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>The Mill</p>
          </div>
        </div>
        <ReportDetail
          item={activeReport}
          segmentLabel={segmentLabel}
          onBack={() => setActiveReport(null)}
          onReset={reset}
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

      {/* ── STEP 0 — Segment ── */}
      {step === 0 && (
        <div>
          <SectionHeader title="Select customer segment" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {SEGMENTS.map(s => (
              <div key={s.id} style={segStyle(segment === s.id)} onClick={() => setSegment(s.id)}>
                <div style={{ fontWeight: 700, fontSize: 14, color: MILL_GREEN }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <button style={{ ...btnPrimary, opacity: segment ? 1 : 0.4 }} disabled={!segment} onClick={() => setStep(1)}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 1 — Upload (multi-file) ── */}
      {step === 1 && (
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
            <button style={btnSecondary} onClick={() => { setStep(0); setQueue([]); }}>← Back</button>
            <button
              style={{ ...btnPrimary, opacity: queue.length > 0 ? 1 : 0.4 }}
              disabled={queue.length === 0}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 — Context ── */}
      {step === 2 && (
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
                        <div key={f.key}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN, display: "block", marginBottom: 5 }}>{f.label}</label>
                          <input
                            style={inputStyle}
                            placeholder={f.placeholder}
                            value={item.context[f.key] || ""}
                            onChange={e => updateQueueItem(item.id, { context: { ...item.context, [f.key]: e.target.value } })}
                          />
                        </div>
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
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN, display: "block", marginBottom: 5 }}>{f.label}</label>
                    <input
                      style={inputStyle}
                      placeholder={f.placeholder}
                      value={sharedContext[f.key] || ""}
                      onChange={e => setSharedContext(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
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
            <button style={btnSecondary} onClick={() => setStep(1)} disabled={processing}>← Back</button>
            <button style={btnPrimary} onClick={runBatchAnalysis} disabled={processing}>
              Run Analysis ({queue.length} PDF{queue.length > 1 ? "s" : ""}) →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Processing / Results list ── */}
      {step === 3 && activeReport === null && (
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
                        <button style={{ ...btnPrimary, flexShrink: 0, fontSize: 13, padding: "9px 18px" }} onClick={() => setActiveReport(item)}>
                          View Report
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
