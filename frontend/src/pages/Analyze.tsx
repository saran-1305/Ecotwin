import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { ScanResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { SDGChip } from "@/components/shared/SDGChip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
    url: z.string().url("Please enter a valid product URL"),
});

export default function AnalyzePage() {
    const { preferences, addScan } = useAuth();
    const [result, setResult] = useState<ScanResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<{ url: string }>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: { url: string }) => {
        if (!preferences) return;
        setLoading(true);
        setError(null);
        try {
            const scan = await api.analyzeProduct(data.url, preferences);
            setResult(scan);
            addScan(scan);
        } catch (err) {
            setError("Failed to analyze product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">New Scan</h1>
                <p className="text-muted-foreground">Paste a product URL to reveal its environmental impact.</p>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="max-w-xl mx-auto border-dashed border-2 py-12 bg-accent/20">
                            <CardContent className="flex flex-col items-center space-y-6">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="https://amazon.com/product/..."
                                            className="pl-10 h-12 text-lg"
                                            {...register("url")}
                                        />
                                    </div>
                                    {errors.url && <p className="text-destructive text-sm">{errors.url.message}</p>}
                                    {error && <p className="text-destructive text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}

                                    <Button type="submit" className="w-full h-12 text-lg gap-2" disabled={loading}>
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Impact"}
                                    </Button>
                                </form>
                                <div className="text-xs text-muted-foreground text-center">
                                    Try searching for "steel bottle" or "plastic toy" to see the difference.
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Header Result */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                <Badge variant="outline" className="mb-2">
                                    {result.product.category}
                                </Badge>
                                <h2 className="text-2xl font-bold">{result.product.title}</h2>
                                <p className="text-muted-foreground">{result.product.brand}</p>
                                <div className="flex gap-2 mt-4">
                                    <Badge variant={result.scores.personalized > 70 ? "success" : result.scores.personalized > 40 ? "warning" : "destructive"}>
                                        {result.scores.personalized > 70 ? "Excellent Choice" : "Consider Alternatives"}
                                    </Badge>
                                    <Badge variant="outline">Confidence: {Math.round(result.scores.confidence * 100)}%</Badge>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <ScoreRing score={result.scores.personalized} label="Eco Score" size={140} />
                            </div>
                        </div>

                        <Separator />

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ScoreCard title="Carbon Impact" score={result.scores.impact} />
                            <ScoreCard title="Circularity" score={result.scores.circularity} />
                            <ScoreCard title="Ethics Score" score={result.scores.ethics} />
                        </div>

                        {/* Explanation */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Why this score?</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {result.explain.topReasons.map((r, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
                                            <span className="text-sm">{r}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Sustainable Development Goals</CardTitle></CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {result.sdg.length > 0 ? (
                                        result.sdg.map(s => <SDGChip key={s.id} id={s.id} why={s.why} />)
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No specific SDGs identified.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-center pt-8">
                            <Button variant="outline" size="lg" onClick={reset}>Analyze Another Product</Button>
                            <Link to={`/scan/${result.id}`} className="ml-4">
                                <Button size="lg" variant="secondary">View Full Details <ArrowRight className="ml-2 w-4 h-4" /></Button>
                            </Link>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ScoreCard({ title, score }: { title: string, score: number }) {
    let color = "text-red-500";
    if (score > 40) color = "text-yellow-500";
    if (score > 70) color = "text-green-500";

    return (
        <Card className="bg-card/50">
            <CardContent className="p-6 flex items-center justify-between">
                <span className="font-medium text-muted-foreground">{title}</span>
                <span className={`text-2xl font-bold ${color}`}>{score}</span>
            </CardContent>
            {/* Simple progress bar */}
            <div className="h-1 w-full bg-secondary mt-[-1px]">
                <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }} />
            </div>
        </Card>
    );
}
