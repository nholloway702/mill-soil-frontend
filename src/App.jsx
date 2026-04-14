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
  { id: "residential", label: "Residential", sub: "Homeowner lawn & garden", icon: "🏡" },
  { id: "turf", label: "Turf / Contractor", sub: "Commercial turf management", icon: "⛳" },
  { id: "equine", label: "Equine & Livestock", sub: "Pasture management", icon: "🐴" },
  { id: "agronomy", label: "Agronomy", sub: "Row crop & farm fields", icon: "🌾" },
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
    { key: "pasture_type", label: "Pasture grass type", placeholder: "e.g. Orchardgrass/clover mix, Tall Fescue" },
    { key: "acreage", label: "Pasture acreage", placeholder: "e.g. 5 acres" },
    { key: "stocking", label: "Stocking rate", placeholder: "e.g. 3 horses, mixed cattle/equine" },
    { key: "goals", label: "Management goals", placeholder: "e.g. Improve stand density, reduce weeds, hay production" },
  ],
  agronomy: [
    { key: "crop", label: "Crop / intended use", placeholder: "e.g. Corn, Soybeans, Winter Wheat, Hay" },
    { key: "acreage", label: "Field acreage", placeholder: "e.g. 45 acres" },
    { key: "yield_goal", label: "Yield goal", placeholder: "e.g. 180 bu/ac corn, 50 bu/ac soybeans" },
    { key: "tillage", label: "Tillage system", placeholder: "e.g. No-till, conventional, strip-till" },
  ],
};

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
};

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
    <div style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ background: MILL_GREEN, color: "white", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Zone: {zone.sampleId}</span>
        <span style={{ fontSize: 12, opacity: 0.85 }}>Lab #{zone.labNumber}</span>
      </div>
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
    </div>
  );
}

export default function MillSoilAgent() {
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [context, setContext] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPdfBase64(e.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const segmentLabel = SEGMENTS.find(s => s.id === segment)?.label || "";
  const fields = CONTEXT_FIELDS[segment] || [];

  const loadingMessages = [
    "Parsing soil test results...",
    "Evaluating nutrient levels and ratios...",
    "Building agronomic recommendations...",
    "Mapping to Mill product catalog...",
    "Generating customer program...",
  ];

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, loadingMessages.length - 1);
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 2200);

    const contextStr = Object.entries(context)
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join("\n");

    const systemPrompt = `You are an expert agronomist and soil fertility specialist working for The Mill of Bel Air, a family-owned agricultural retail store in Bel Air, MD. You analyze Waypoint Analytical soil reports and generate comprehensive, actionable plans for customers.

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

    const userMsg = `Segment: ${segmentLabel}

Customer context:
${contextStr}

Please analyze the attached soil report PDF and return the JSON plan.`;

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: pdfBase64 }
              },
              { type: "text", text: userMsg }
            ]
          }]
        })
      });

      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStep(3);
    } catch (err) {
      setError("Analysis failed. Please check the PDF and try again. " + err.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const severityColor = (s) => s === "critical" ? "#c0392b" : s === "warning" ? "#e67e22" : "#27ae60";
  const severityBg = (s) => s === "critical" ? "#fdecea" : s === "warning" ? "#fef5e7" : "#eafaf1";

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 4px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${MILL_GREEN}` }}>
        <div style={{ background: MILL_GREEN, borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22 }}>🌱</span>
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: MILL_GREEN, margin: 0 }}>Soil Analysis Agent</h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>The Mill of Bel Air · Waypoint Analytical</p>
        </div>
      </div>

      <ProgressBar step={step} />

      {/* STEP 0 - Segment */}
      {step === 0 && (
        <div>
          <SectionHeader title="Select customer segment" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {SEGMENTS.map(s => (
              <div key={s.id} style={segStyle(segment === s.id)} onClick={() => setSegment(s.id)}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{s.icon}</span>
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

      {/* STEP 1 - Upload */}
      {step === 1 && (
        <div>
          <SectionHeader title="Upload Waypoint soil report (PDF)" />
          <div
            style={{
              border: `2px dashed ${pdfFile ? MILL_GREEN : MILL_BORDER}`,
              borderRadius: 10, padding: "32px 24px", textAlign: "center",
              cursor: "pointer", background: pdfFile ? MILL_GREEN_LIGHT : "#fafafa",
              marginBottom: 20, transition: "all .15s"
            }}
            onClick={() => fileRef.current.click()}
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{pdfFile ? "✅" : "📄"}</div>
            {pdfFile ? (
              <>
                <div style={{ fontWeight: 700, color: MILL_GREEN, fontSize: 14 }}>{pdfFile.name}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Click to replace</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, color: MILL_GREEN, fontSize: 14 }}>Drop PDF here or click to browse</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Waypoint Analytical reports only</div>
              </>
            )}
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnSecondary} onClick={() => setStep(0)}>← Back</button>
            <button style={{ ...btnPrimary, opacity: pdfFile ? 1 : 0.4 }} disabled={!pdfFile} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 - Context */}
      {step === 2 && (
        <div>
          <SectionHeader title={`${segmentLabel} — field & customer details`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: MILL_GREEN, display: "block", marginBottom: 5 }}>{f.label}</label>
                <input
                  style={inputStyle}
                  placeholder={f.placeholder}
                  value={context[f.key] || ""}
                  onChange={e => setContext(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c0392b" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
            <button style={btnPrimary} onClick={runAnalysis} disabled={loading}>
              {loading ? loadingMsg : "Generate Analysis & Program →"}
            </button>
          </div>

          {loading && (
            <div style={{ marginTop: 20, padding: "14px 16px", background: MILL_GREEN_LIGHT, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${MILL_GREEN}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 13, color: MILL_GREEN, fontWeight: 600 }}>{loadingMsg}</span>
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* STEP 3 - Results */}
      {step === 3 && result && (
        <div>
          {/* Customer header */}
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

          {/* Executive Summary */}
          <div style={{ background: MILL_GOLD_LIGHT, border: `1px solid ${MILL_GOLD}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: MILL_GOLD, marginBottom: 6 }}>EXECUTIVE SUMMARY</div>
            <p style={{ fontSize: 14, color: "#3a2800", lineHeight: 1.6, margin: 0 }}>{result.executiveSummary}</p>
          </div>

          {/* Key Findings */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Key findings" />
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

          {/* Zone data */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Zone results" />
            {result.zones?.map((z, i) => <ZoneCard key={i} zone={z} />)}
          </div>

          {/* Lime strategy */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Lime correction strategy" />
            <div style={{ background: "#f4f9f4", border: `1px solid ${MILL_BORDER}`, borderRadius: 8, padding: "14px 16px", fontSize: 14, lineHeight: 1.7, color: "#222" }}>
              {result.limeStrategy}
            </div>
          </div>

          {/* Annual program */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Annual application program" />
            {result.annualProgram?.map((timing, ti) => (
              <div key={ti} style={{ marginBottom: 14 }}>
                <div style={{ background: MILL_SEAFOAM, color: "white", borderRadius: "8px 8px 0 0", padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>
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

          {/* Product list */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Recommended products (Mill purchase list)" />
            <div style={{ border: `1px solid ${MILL_BORDER}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", background: MILL_GREEN_LIGHT, padding: "8px 14px", gap: 8 }}>
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

          {/* Customer notes */}
          <div style={{ background: MILL_SEAFOAM_LIGHT, border: `1px solid ${MILL_SEAFOAM}`, borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: MILL_SEAFOAM, marginBottom: 6 }}>NOTE TO CUSTOMER</div>
            <p style={{ fontSize: 14, color: "#1a3a2a", lineHeight: 1.6, margin: 0 }}>{result.customerNotes}</p>
          </div>

          <button style={btnSecondary} onClick={() => { setStep(0); setSegment(null); setPdfFile(null); setPdfBase64(null); setContext({}); setResult(null); }}>
            ← Start new analysis
          </button>
        </div>
      )}
    </div>
  );
}
