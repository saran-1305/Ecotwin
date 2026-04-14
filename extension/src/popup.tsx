import { useState, useEffect } from "react"
import "./style.css"
import { analyzeProduct, type ProductScore } from "./utils/scoring"
import LiveEcoSignals from "./components/LiveEcoSignals"

function IndexPopup() {
  const [scoreData, setScoreData] = useState<ProductScore | null>(null)
  const [productName, setProductName] = useState("Loading...")
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [productUrl, setProductUrl] = useState("")
  const [ledgerSyncStatus, setLedgerSyncStatus] = useState<string | null>(null)

  const saveQuickScanToLedger = async (analysis: ProductScore, title: string, url: string) => {
    chrome.storage?.local?.get(["ecoimpact_user_id"], async (result) => {
      let userId = result.ecoimpact_user_id;
      if (!userId) {
        userId = "ext-user-" + Date.now().toString();
        chrome.storage?.local?.set({ ecoimpact_user_id: userId });
      }

      try {
        let platform = "unknown";
        if (url.includes("amazon")) platform = "amazon";
        if (url.includes("flipkart")) platform = "flipkart";

        const payload = {
          user_id: userId,
          source: "extension_quick_scan",
          platform: platform,
          event_type: "product_scan",
          canonical_url: url,
          product_title: title,
          brand: analysis.brand,
          product_image: analysis.product_image,
          analysis_id: analysis.analysis_id,
          eco_score: analysis.eco_score,
          confidence: analysis.confidence,
          score_band: analysis.score_band,
          breakdown: analysis.breakdown,
          carbon_estimate: analysis.carbon_estimate,
          sdg_mapping: analysis.sdg_mapping || [],
          key_findings: analysis.key_findings || [],
          created_at_client: new Date().toISOString()
        };

        console.log("EcoImpactAI Debug: Ledger Payload", JSON.stringify(payload, null, 2));

        const res = await fetch('http://localhost:8000/ledger/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setLedgerSyncStatus("Saved to Ledger");
        } else {
          setLedgerSyncStatus("History sync failed");
        }
      } catch (e) {
        setLedgerSyncStatus("History sync failed");
      }
    });
  };

  useEffect(() => {
    chrome.storage?.local?.get(["currentProduct"], (result) => {
      if (result.currentProduct && result.currentProduct.title) {
        setProductName(result.currentProduct.title)
        setProductUrl(result.currentProduct.url)

        analyzeProduct(result.currentProduct.title, result.currentProduct.url, result.currentProduct)
          .then((analysis) => {
            // Anti-placeholder safeguard: Ensure we actually got a score 
            // In API Failure mode we do not render fake data
            if (analysis && analysis.eco_score !== null && analysis.eco_score !== undefined && !isNaN(analysis.eco_score)) {
              setScoreData(analysis)
              setLoading(false)
              setLedgerSyncStatus("Syncing...");
              saveQuickScanToLedger(analysis, result.currentProduct.title, result.currentProduct.url);
            } else {
              // Must be a failure response
              setErrorMsg("Analysis unavailable. Please retry.");
              setLoading(false);
            }
          })
          .catch(err => {
            console.error(err)
            // The updated rigorous hybrid backend now safely returns a structured text error 
            // inside err.message (from our manual TS catch block) rather than a raw 500 Pydantic trace.
            let msg = err.message || "Analysis unavailable. Please retry."

            // Standardize output bounds to roughly 40-50 chars max for the UI box
            if (msg.length > 55) {
              msg = msg.substring(0, 52) + "..."
            }
            setErrorMsg(msg)
            setLoading(false)
          })

      } else {
        setProductName("No Product Detected")
        setProductUrl("")
        setLoading(false)
      }
    })

    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scan" }).catch(() => { })
      }
    })
  }, [])

  const ecoScore = scoreData?.eco_score ?? 0;
  const config = getGaugeConfig(ecoScore, scoreData?.eco_score === null || !!errorMsg);
  const radius = 80;
  const arcLength = Math.PI * radius;

  const displayScore = scoreData?.eco_score !== null && scoreData?.eco_score !== undefined ? scoreData.eco_score : "--";

  return (
    <div className="w-[350px] min-h-[450px] bg-[#054231] p-6 flex flex-col items-center overflow-hidden font-sans border-t-4 border-emerald-400">
      {/* Header */}
      <h1 className="text-2xl font-serif text-[#F8F9FA] mb-1 tracking-tight">EcoImpact <span className="text-emerald-500">AI</span></h1>
      <p className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] mb-6 font-bold">Sustainability Scanner</p>

      {/* Product Info */}
      <div className="w-full text-center mb-6 px-4">
        <h2 className="text-base font-semibold text-[#F8F9FA] truncate leading-tight">
          {loading ? "Scanning..." : productName}
        </h2>
      </div>

      {errorMsg ? (
        <div className="w-full bg-red-900/40 border border-red-500/30 p-4 rounded-xl text-center mb-6">
          <span className="text-red-200 text-xs font-bold">{errorMsg}</span>
        </div>
      ) : (
        <>
          {/* Speedometer Gauge and Score Container */}
          <div className="relative w-48 h-[100px] flex flex-col items-center justify-center mb-6">

            {/* Glow Effect */}
            {!loading && <div className={`absolute -top-4 w-32 h-32 ${config.bgParam} opacity-40 blur-2xl rounded-full -z-10 transition-colors duration-500`}></div>}

            {/* 1. SVG Gauge */}
            <svg className="w-full h-full overflow-visible absolute top-0 left-0 z-0 pointer-events-none">
              <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#0B5A47" strokeWidth="12" strokeLinecap="round" />

              {!loading && (
                <path
                  d="M 10 90 A 80 80 0 0 1 170 90"
                  fill="none"
                  stroke={config.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={arcLength * (1 - ecoScore / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              )}

              {!loading && (
                <g
                  className="transition-all duration-1000 ease-out origin-[90px_90px]"
                  style={{ transform: `rotate(${-90 + (ecoScore / 100) * 180}deg)`, transformOrigin: "90px 90px" }}
                >
                  <circle cx="90" cy="90" r="4" fill="#CFE5DA" />
                  <path d="M 90 90 L 90 20" stroke="#CFE5DA" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
            </svg>

            {/* 2. Score Text */}
            <div className="absolute top-6 flex flex-col items-center z-10">
              <span className="text-5xl font-black tracking-tighter leading-none drop-shadow-md" style={{ color: config.color }}>
                {loading ? "..." : displayScore}
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-200 tracking-wider bg-[#043628]/80 px-1.5 py-0.5 mt-1 rounded border border-emerald-500/20 backdrop-blur-sm">ECO SCORE</span>
            </div>

            {/* 3. Status Badge */}
            {!loading && (
              <div className="absolute -bottom-8 opacity-0 animate-in fade-in slide-in-from-top-1 duration-700 delay-300 fill-mode-forwards" style={{ animationFillMode: 'forwards', opacity: 1 }}>
                <div className={`px-4 py-0.5 rounded-full ${config.bgParam} border ${config.textParam.replace('text', 'border')} border-opacity-30 shadow-sm`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${config.textParam}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-full"></div>

          {/* Live Eco Signals Panel */}
          <LiveEcoSignals signals={scoreData?.live_signals || scoreData?.signals || []} isLoading={loading} />

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6 mt-4">
            <MetricBox label="Carbon" value={scoreData?.carbon_estimate?.kg_co2e ? `${scoreData.carbon_estimate.kg_co2e}kg` : "Unavail"} />
            <MetricBox label="Recycle" value={scoreData?.recyclability?.percent ? `${scoreData.recyclability.percent}%` : "Unavail"} />
            <MetricBox label="Labor" value={scoreData?.labor_risk?.grade ? scoreData.labor_risk.grade : "Unavail"} />
          </div>
        </>
      )}

      {/* CTA Button */}
      <a
        href={`http://localhost:3000/#/analyzer?url=${encodeURIComponent(productUrl)}`}
        target="_blank"
        className="w-full py-3 bg-[#CFE5DA] hover:bg-[#A7F3D0] text-[#054231] font-bold rounded-xl shadow-lg hover:shadow-emerald-400/30 transition-all text-center flex items-center justify-center text-xs uppercase tracking-wider"
      >
        View Full Analysis
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Ledger Status */}
      {ledgerSyncStatus && !errorMsg && !loading && (
        <div className="w-full text-center mt-3 flex items-center justify-center gap-1.5 opacity-80 animate-in fade-in duration-300">
          {ledgerSyncStatus === "Saved to Ledger" ? (
            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          ) : ledgerSyncStatus === "History sync failed" ? (
            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : ledgerSyncStatus === "Syncing..." ? (
            <svg className="w-3 h-3 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : null}
          <span className={`text-[9px] uppercase font-bold tracking-widest ${ledgerSyncStatus === "History sync failed" ? 'text-red-400' : 'text-emerald-400'}`}>
            {ledgerSyncStatus}
          </span>
        </div>
      )}
    </div>
  )
}

const getGaugeConfig = (score: number, unavailable: boolean) => {
  if (unavailable) return { color: "#6b7280", label: "UNAVAILABLE", bgParam: "bg-gray-800/40", textParam: "text-gray-400" };
  if (score <= 20) return { color: "#ef4444", label: "LOW", bgParam: "bg-red-900/40", textParam: "text-red-300" };
  if (score <= 50) return { color: "#f97316", label: "FAIR", bgParam: "bg-orange-900/40", textParam: "text-orange-300" };
  if (score <= 70) return { color: "#84cc16", label: "GOOD", bgParam: "bg-lime-900/40", textParam: "text-lime-300" };
  if (score <= 90) return { color: "#34d399", label: "GREAT", bgParam: "bg-emerald-900/40", textParam: "text-emerald-300" };
  return { color: "#10b981", label: "EXCELLENT", bgParam: "bg-emerald-800/60", textParam: "text-emerald-200" };
};

const MetricBox = ({ label, value }: { label: string, value: string }) => {
  const isUnavailable = value === "Unavail";
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg bg-[#0B5A47] border ${isUnavailable ? 'border-gray-500/20' : 'border-emerald-500/20'} shadow-sm`}>
      <span className={`text-[9px] uppercase ${isUnavailable ? 'text-gray-400' : 'text-[#9FC7B7]'} font-bold mb-1 tracking-wider`}>{label}</span>
      <span className={`text-sm font-black ${isUnavailable ? 'text-gray-400' : 'text-emerald-300'}`}>{value}</span>
    </div>
  )
}

export default IndexPopup
