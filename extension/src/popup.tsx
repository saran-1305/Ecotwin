import { useState, useEffect } from "react"
import { Send, RefreshCw, ExternalLink, Leaf, Award, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import "./style.css"

import { Button } from "~components/ui/button"
import { Gauge } from "~components/Gauge"
import { ScoreCard } from "~components/ScoreCard"

import { useStorage } from "@plasmohq/storage/hook"
import { sendToBackground } from "@plasmohq/messaging"

function IndexPopup() {
    const [currentUrl, setCurrentUrl] = useState<string>("")
    const [analysis, setAnalysis] = useStorage("last_analysis", null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].url) {
                setCurrentUrl(tabs[0].url)
                handleAnalyze(tabs[0].url, tabs[0].id)
            }
        })
    }, [])

    const handleAnalyze = async (url: string, tabId?: number) => {
        setError(null);

        // Basic check for shopping sites
        const isShopping = url.includes("amazon") || url.includes("flipkart") || url.includes("myntra") || url.includes("ebay") || url.includes("walmart");

        if (!isShopping) {
            setAnalysis(null);
            return;
        }

        setLoading(true)

        try {
            // Request data from content script
            let productData = null;
            if (tabId) {
                try {
                    productData = await chrome.tabs.sendMessage(tabId, { action: "GET_PRODUCT_DATA" });
                } catch (e) {
                    console.warn("Content script not ready or not injected", e);
                    // Fallback to minimal data from URL
                    productData = { url, title: "Product Page", price: "", image: "" };
                }
            }

            // Mock Scoring Logic (Deterministic based on text)
            const textToAnalyze = ((productData?.title || "") + " " + url).toLowerCase();

            let score = 45;
            let reasons = ["Average sustainability profile"];
            let improvements = ["Look for eco-friendly alternatives"];
            let ranking = "Seedling";
            let categoryScores = { impact: 50, circularity: 50, ethics: 50, energy: 50 };

            if (textToAnalyze.includes("steel") || textToAnalyze.includes("bottle") || textToAnalyze.includes("metal")) {
                score = 92;
                ranking = "Climate Hero";
                reasons = ["Plastic-free material", "High durability & reusability", "Recyclable materials"];
                improvements = ["Verify supply chain ethics"];
                categoryScores = { impact: 95, circularity: 90, ethics: 80, energy: 85 };
            } else if (textToAnalyze.includes("plastic") || textToAnalyze.includes("toy") || textToAnalyze.includes("polyester")) {
                score = 25;
                ranking = "Seedling";
                reasons = ["High carbon footprint materials", "Low potential for recycling", "Likely single-use or short lifespan"];
                improvements = ["Switch to biodegradable materials", "Choose durable alternatives"];
                categoryScores = { impact: 20, circularity: 15, ethics: 40, energy: 30 };
            } else if (textToAnalyze.includes("organic") || textToAnalyze.includes("cotton") || textToAnalyze.includes("bamboo")) {
                score = 78;
                ranking = "Builder";
                reasons = ["Organic renewable materials", "Lower water consumption", "Biodegradable"];
                improvements = ["Check for Fair Trade certification"];
                categoryScores = { impact: 80, circularity: 85, ethics: 70, energy: 75 };
            }

            // Simulating API delay for effect
            setTimeout(() => {
                setAnalysis({
                    score,
                    ranking,
                    reasons,
                    improvements,
                    categoryScores,
                    title: productData?.title?.substring(0, 60) + (productData?.title?.length > 60 ? "..." : "") || "Analyzed Product",
                    url: url,
                    timestamp: new Date().toISOString()
                })
                setLoading(false)
            }, 800);

        } catch (err) {
            console.error(err);
            setError("Failed to analyze product. Please reload the page.");
            setLoading(false);
        }
    }

    const openWebApp = () => {
        const target = `http://localhost:3001/analyze?url=${encodeURIComponent(currentUrl)}`;
        chrome.tabs.create({ url: target });
    }

    if (!analysis && !loading) {
        return (
            <div className="w-[360px] h-[450px] flex flex-col items-center justify-center bg-gray-950 text-white p-6 relative overflow-hidden font-sans">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-gray-950 pointer-events-none" />
                <Leaf className="w-16 h-16 text-green-500 mb-6 opacity-30" />
                <h2 className="text-xl font-bold mb-3 tracking-tight">No Product Detected</h2>
                <p className="text-gray-400 text-center mb-8 text-sm leading-relaxed max-w-[280px]">
                    Open a product page on Amazon, Flipkart, Myntra, or eBay to see its sustainability score.
                </p>
                <div className="flex gap-2 text-xs text-gray-600 font-mono uppercase">
                    <span>Amazon</span> • <span>Flipkart</span> • <span>Myntra</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-[360px] h-[520px] bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="bg-green-500/10 p-1.5 rounded-lg ring-1 ring-green-500/20">
                        <Leaf className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="font-bold text-sm tracking-wide text-gray-100">EcoTwin</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAnalyze(currentUrl)}
                        disabled={loading}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <div className="relative z-10 flex-1 p-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                            <Leaf className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 animate-pulse" />
                        </div>
                        <p className="text-sm text-gray-400 animate-pulse font-medium">Analyzing product footprint...</p>
                    </div>
                ) : analysis ? (
                    <div className="p-4 space-y-6 pb-20">
                        <div className="text-center space-y-1">
                            <h1 className="text-sm font-medium text-gray-300 line-clamp-1 opacity-80">{analysis.title}</h1>
                        </div>

                        {/* Score Gauge */}
                        <div className="flex flex-col items-center justify-center -mt-2">
                            <Gauge score={analysis.score} size={200} />
                            <div className="mt-2 flex flex-col items-center relative z-20">
                                <div className="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">{analysis.score}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-green-400 mt-1 flex items-center gap-1.5 bg-green-950/50 px-3 py-1 rounded-full border border-green-500/20">
                                    <Award className="w-3 h-3" />
                                    {analysis.ranking}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Scores */}
                        <div className="space-y-2">
                            <ScoreCard label="Carbon Impact" score={analysis.categoryScores.impact} category="impact" />
                            <ScoreCard label="Circularity" score={analysis.categoryScores.circularity} category="circularity" />
                        </div>

                        {/* Reasons Accordion style */}
                        <div className="glass-panel rounded-xl overflow-hidden p-4 space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                Key Analysis
                            </h3>
                            <div className="space-y-2.5">
                                {analysis.reasons.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-200 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Footer Actions */}
            {analysis && !loading && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl z-20">
                    <Button className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-none shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02]" onClick={openWebApp}>
                        Deep Analysis
                        <ExternalLink className="w-4 h-4 opacity-80" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default IndexPopup
