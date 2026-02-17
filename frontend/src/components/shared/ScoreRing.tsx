import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    subLabel?: string;
    className?: string;
    animate?: boolean;
}

export function ScoreRing({
    score,
    size = 120,
    strokeWidth = 8,
    label,
    subLabel,
    className,
    animate = true,
}: ScoreRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const colorClass = getColor(score);

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-secondary opacity-20"
                />
                {/* Progress Ring */}
                <motion.circle
                    initial={animate ? { strokeDashoffset: circumference } : undefined}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={cn(colorClass)}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={cn("text-3xl font-bold", colorClass)}>
                    {score}
                </span>
                {label && <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>}
                {subLabel && <span className="text-[10px] text-muted-foreground/70">{subLabel}</span>}
            </div>
        </div>
    );
}
