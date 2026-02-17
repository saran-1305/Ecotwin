import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SDGChipProps {
    id: number;
    why: string;
    className?: string;
}

const SDG_COLORS: Record<number, string> = {
    1: "bg-[#E5243B]", 2: "bg-[#DDA63A]", 3: "bg-[#4C9F38]", 4: "bg-[#C5192D]",
    5: "bg-[#FF3A21]", 6: "bg-[#26BDE2]", 7: "bg-[#FCC30B]", 8: "bg-[#A21942]",
    9: "bg-[#FD6925]", 10: "bg-[#DD1367]", 11: "bg-[#FD9D24]", 12: "bg-[#BF8B2E]",
    13: "bg-[#3F7E44]", 14: "bg-[#0A97D9]", 15: "bg-[#56C02B]", 16: "bg-[#00689D]",
    17: "bg-[#19486A]",
};

export function SDGChip({ id, why, className }: SDGChipProps) {
    const color = SDG_COLORS[id] || "bg-gray-500";

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold shadow-md cursor-help hover:scale-110 transition-transform",
                            color,
                            className
                        )}
                    >
                        {id}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">SDG {id}</p>
                    <p className="text-xs text-muted-foreground">{why}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
