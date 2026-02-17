import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Leaf, History, TrendingUp, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const { user, scans } = useAuth();

    const totalScans = scans.length;
    const avgScore = totalScans > 0 ? Math.round(scans.reduce((a, b) => a + b.scores.personalized, 0) / totalScans) : 0;
    const highScoringScans = scans.filter(s => s.scores.personalized >= 70).length;
    const sustainableRate = totalScans > 0 ? Math.round((highScoringScans / totalScans) * 100) : 0;

    const chartData = [...scans].reverse().slice(0, 10).reverse().map((s, i) => ({
        name: `Scan ${i + 1}`,
        score: s.scores.personalized,
        date: new Date(s.createdAt).toLocaleDateString()
    }));

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user?.name || user?.email?.split('@')[0]}</p>
                </div>
                <Link to="/analyze">
                    <Button className="gap-2 shadow-lg hover:scale-105 transition-transform" size="lg">
                        <ArrowUpRight className="w-5 h-5" /> New Scan
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Scans" value={totalScans.toString()} icon={History} desc="+2 this week" />
                <KPICard title="Avg Eco Score" value={avgScore.toString()} icon={Leaf} desc="Based on your preferences" />
                <KPICard title="Sustainable Rate" value={`${sustainableRate}%`} icon={TrendingUp} desc="Products scoring > 70" />
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eco Level</CardTitle>
                        <Badge variant="default">Level 3</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">Seedling</div>
                        <p className="text-xs text-muted-foreground">50 points to Sprout</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-7 gap-6">
                <Card className="col-span-full lg:col-span-4 h-full">
                    <CardHeader>
                        <CardTitle>Sustainability Trend</CardTitle>
                        <CardDescription>Your last 10 scans over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis domain={[0, 100]} hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest products analyzed</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {scans.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
                                    <History className="w-12 h-12 mb-4 opacity-20" />
                                    No scans yet. Start analyzing!
                                </div>
                            ) : (
                                scans.slice(0, 5).map((scan) => (
                                    <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="font-medium leading-none truncate max-w-[150px]">{scan.product.title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={scan.scores.personalized > 50 ? "default" : "secondary"}>
                                                {scan.scores.personalized}
                                            </Badge>
                                            <Link to={`/scan/${scan.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, desc }: any) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </CardContent>
        </Card>
    );
}
