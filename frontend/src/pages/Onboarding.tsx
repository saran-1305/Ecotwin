import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Sliders } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Preferences } from "@/lib/types";

export default function Onboarding() {
    const { preferences, savePreferences } = useAuth();
    const navigate = useNavigate();

    const [prefs, setPrefs] = useState<Preferences>({
        carbon: 50,
        plastic_free: 50,
        ethics: 50,
        durability: 50,
        local: 50,
    });

    // Pre-load existing if editing
    useEffect(() => {
        if (preferences) {
            setPrefs(preferences);
        }
    }, [preferences]);

    const handleSliderChange = (key: keyof Preferences, value: number[]) => {
        setPrefs((prev) => ({ ...prev, [key]: value[0] }));
    };

    const handleSubmit = () => {
        savePreferences(prefs);
        navigate("/dashboard");
    };

    const categories = [
        { key: "carbon", label: "Low Carbon Footprint", desc: "Prioritize products with minimal greenhouse gas emissions." },
        { key: "plastic_free", label: "Plastic Free", desc: "Avoid single-use plastics and synthetic materials." },
        { key: "ethics", label: "Ethical Labor", desc: "Ensure fair wages and safe working conditions." },
        { key: "durability", label: "Durability & Repairability", desc: "Choose items that last longer and are fixable." },
        { key: "local", label: "Locally Sourced", desc: "Support local economies and reduce transport miles." },
    ] as const;

    const topPriority = Object.entries(prefs).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-3 gap-8">

                {/* Left Col: Explanation */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Customize Your Twin</h1>
                        <p className="text-muted-foreground">
                            Adjust the sliders to train your EcoTwin AI. What matters most to you when shopping?
                        </p>
                    </div>

                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardContent className="pt-6 space-y-8">
                            {categories.map((cat) => (
                                <div key={cat.key} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">{cat.label}</Label>
                                            <p className="text-xs text-muted-foreground">{cat.desc}</p>
                                        </div>
                                        <span className="font-mono text-sm font-bold w-8 text-right text-primary">
                                            {prefs[cat.key]}
                                        </span>
                                    </div>
                                    <Slider
                                        defaultValue={[50]}
                                        value={[prefs[cat.key]]}
                                        max={100}
                                        step={1}
                                        onValueChange={(val) => handleSliderChange(cat.key, val)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSubmit} className="gap-2 group">
                            {preferences ? "Save Changes" : "Start Analyzing"}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Right Col: Preview */}
                <div className="hidden md:flex flex-col gap-4 sticky top-8 h-fit">
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sliders className="w-5 h-5" />
                                Profile Preview
                            </CardTitle>
                            <CardDescription>How products will be scored for you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(prefs).map(([key, val]) => (
                                    val > 60 && (
                                        <Badge key={key} variant="secondary" className="capitalize">
                                            {key.replace("_", " ")}
                                        </Badge>
                                    )
                                ))}
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg space-y-2">
                                <p className="text-sm font-medium">Top Priority</p>
                                <div className="flex items-center gap-2 text-primary font-bold capitalize">
                                    <Check className="w-4 h-4" />
                                    {topPriority.replace("_", " ")}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground italic">
                                "I will look for {topPriority.replace("_", " ")} products and highlight them for you."
                            </p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
