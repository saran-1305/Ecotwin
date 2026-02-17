import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { SDGChip } from "@/components/shared/SDGChip";

export default function ScanDetails() {
    const { id } = useParams();
    const { scans } = useAuth();
    const scan = scans.find(s => s.id === id);

    if (!scan) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <h2 className="text-2xl font-bold">Scan Not Found</h2>
                <Link to="/dashboard">
                    <Button>Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const handleShare = () => {
        const text = `I just analyzed ${scan.product.title} on EcoTwin! Eco Score: ${scan.scores.personalized}`;
        navigator.clipboard.writeText(text);
        alert("Summary copied to clipboard!");
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Link to="/dashboard">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Button>
                </Link>
                <Button variant="outline" className="gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" /> Share
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <Badge variant="secondary" className="mb-2">{scan.product.category}</Badge>
                        <h1 className="text-4xl font-bold mb-2">{scan.product.title}</h1>
                        <p className="text-xl text-muted-foreground">{scan.product.brand}</p>
                    </div>

                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">Sustainability Snapshot</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold">{scan.scores.impact}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Carbon</div>
                                </div>
                                <div className="border-l border-primary/20">
                                    <div className="text-2xl font-bold">{scan.scores.circularity}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Circularity</div>
                                </div>
                                <div className="border-l border-primary/20">
                                    <div className="text-2xl font-bold">{scan.scores.ethics}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Ethics</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center md:justify-end">
                    <Card className="w-fit p-6 flex flex-col items-center justify-center bg-card/80 backdrop-blur">
                        <ScoreRing score={scan.scores.personalized} size={180} strokeWidth={12} label="Personal Score" />
                        <div className="mt-4 text-center">
                            <p className="text-sm font-medium">Confidence Score</p>
                            <Badge variant="outline" className="mt-1">{Math.round(scan.scores.confidence * 100)}%</Badge>
                        </div>
                    </Card>
                </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Impact Analysis</CardTitle>
                        <CardDescription>Key factors influencing the score</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Strengths</h4>
                            <ul className="space-y-2">
                                {scan.explain.topReasons.map((r, i) => (
                                    <li key={i} className="flex gap-2 text-sm">
                                        <span className="text-green-500 font-bold">•</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2 text-orange-500">Areas for Improvement</h4>
                            <ul className="space-y-2">
                                {scan.explain.improvements.map((r, i) => (
                                    <li key={i} className="flex gap-2 text-sm">
                                        <span className="text-orange-400 font-bold">•</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>SDG Alignment</CardTitle>
                            <CardDescription>Contribution to UN Goals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {scan.sdg.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/20 border border-accent/30 w-full sm:w-auto">
                                        <SDGChip id={s.id} why={s.why} />
                                        <span className="text-sm font-medium">SDG {s.id}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-none shadow-inner">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg mb-1">Make a Difference</h3>
                                <p className="text-sm text-muted-foreground w-3/4">Considering this product? Check generic alternatives that might be more sustainable.</p>
                            </div>
                            <Button>Compare</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
