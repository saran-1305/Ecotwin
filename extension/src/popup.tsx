import { useState, useEffect } from "react"
import "./style.css"
import { analyzeProduct, type ProductScore } from "./utils/scoring"

function IndexPopup() {
  const [scoreData, setScoreData] = useState<ProductScore>({ score: 0, carbon: "-", recyclability: "-", labor: "-" })
  const [productName, setProductName] = useState("Loading...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check storage for scanned product
    chrome.storage?.local?.get(["currentProduct"], (result) => {
      if (result.currentProduct && result.currentProduct.title) {
        setProductName(result.currentProduct.title)
        const analysis = analyzeProduct(result.currentProduct.title)
        setScoreData(analysis)
        setLoading(false)
      } else {
        setProductName("No Product Detected")
        setScoreData({ score: 0, carbon: "-", recyclability: "-", labor: "-" })
        setLoading(false)
      }
    })

    // Also try to trigger a scan in the active tab (in case it wasn't captured)
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scan" }).catch(() => {
          // Ignore errors if content script isn't ready or not on a product page
        })
      }
    })
  }, [])

  return (
    <div className="w-[350px] min-h-[400px] bg-green-white-theme p-6 flex flex-col items-center shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <h1 className="text-3xl font-serif text-emerald-800 mb-1 tracking-tight">EcoImpactAI</h1>
      <p className="text-xs text-emerald-600 uppercase tracking-widest mb-6 font-medium">Sustainability Scanner</p>

      {/* Product Info */}
      <div className="w-full text-center mb-6">
        <h2 className="text-lg font-semibold text-emerald-900 truncate px-2 leading-tight">
          {loading ? "Scanning..." : productName}
        </h2>
      </div>

      {/* Score Gauge */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        {/* Glow Effect behind gauge */}
        <div className="absolute inset-0 bg-emerald-400 opacity-20 blur-xl rounded-full"></div>

        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke="#d1fae5"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke={scoreData.score > 70 ? "#10b981" : scoreData.score > 40 ? "#f59e0b" : "#ef4444"}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * scoreData.score) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-emerald-900">{scoreData.score}</span>
          <span className="text-xs text-emerald-600 font-medium">ECO SCORE</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        <MetricBox label="Carbon" value={scoreData.carbon} color="text-emerald-700" bg="bg-emerald-50" />
        <MetricBox label="Recycle" value={scoreData.recyclability} color="text-teal-700" bg="bg-teal-50" />
        <MetricBox label="Labor" value={scoreData.labor} color="text-green-700" bg="bg-green-50" />
      </div>

      {/* CTA Button */}
      <a
        href="http://localhost:5173/scan/demo-product"
        target="_blank"
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all text-center flex items-center justify-center text-sm"
      >
        View Full Analysis
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}

const MetricBox = ({ label, value, color, bg }) => (
  <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${bg} border border-emerald-100 glass`}>
    <span className="text-[10px] uppercase text-gray-500 font-semibold mb-1">{label}</span>
    <span className={`text-sm font-bold ${color}`}>{value}</span>
  </div>
)

export default IndexPopup
