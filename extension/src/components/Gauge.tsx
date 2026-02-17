import { motion } from "framer-motion"

interface GaugeProps {
    score: number
    size?: number
}

export function Gauge({ score, size = 180 }: GaugeProps) {
    // Clamp score
    const displayScore = Math.min(100, Math.max(0, score))

    // Calculate rotation (-90 to 90 degrees)
    const rotation = (displayScore / 100) * 180 - 90

    // Determine color
    let color = "text-yellow-500"
    if (displayScore >= 75) color = "text-green-500"
    else if (displayScore <= 35) color = "text-red-500"

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
            {/* Background Arc */}
            <div className="absolute top-0 w-full h-full overflow-hidden">
                <div className="w-full h-[200%] rounded-full border-[12px] border-white/10 border-b-0" />
            </div>

            {/* Needle */}
            <motion.div
                initial={{ rotate: -90 }}
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className="absolute bottom-5 w-full flex justify-center origin-bottom"
                style={{ transformOrigin: "50% 100%", bottom: "20px" }}
            >
                <div className="relative w-1 h-[calc(50%-20px)] bg-white/80 origin-bottom rounded-full" style={{ top: "-50%" }}>
                    <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
            </motion.div>

            {/* Center Pivot */}
            <div className="absolute bottom-3 w-4 h-4 bg-white rounded-full shadow-lg z-10" />

            {/* Score Text Overlay (Optional, if not outside) */}
        </div>
    )
}
