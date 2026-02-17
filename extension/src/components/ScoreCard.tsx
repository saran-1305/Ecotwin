import { motion } from "framer-motion"
import { ShieldCheck, Recycle, Leaf, Zap, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~components/ui/tooltip"

interface ScoreCardProps {
    score: number
    category: string
    label: string
    icon?: string
}

export function ScoreCard({ score, category, label }: ScoreCardProps) {
    // Determine color based on score
    let color = "bg-yellow-500"
    let textColor = "text-yellow-500"

    if (score >= 70) {
        color = "bg-green-500"
        textColor = "text-green-500"
    } else if (score <= 30) {
        color = "bg-red-500"
        textColor = "text-red-500"
    }

    const getIcon = () => {
        switch (category) {
            case 'impact': return <Leaf className={`w-4 h-4 ${textColor}`} />;
            case 'circularity': return <Recycle className={`w-4 h-4 ${textColor}`} />;
            case 'ethics': return <ShieldCheck className={`w-4 h-4 ${textColor}`} />;
            case 'energy': return <Zap className={`w-4 h-4 ${textColor}`} />;
            default: return <HelpCircle className={`w-4 h-4 ${textColor}`} />;
        }
    }

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-white/5`}>
                    {getIcon()}
                </div>
                <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div>
                    <div className="text-sm font-bold text-white">{score}/100</div>
                </div>
            </div>

            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}
