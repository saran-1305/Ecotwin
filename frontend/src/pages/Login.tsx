import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScanSearch, ArrowRight, Loader2, Leaf, ShieldCheck, Globe, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import loginBg from "@/assets/login-bg.jpg";

const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        login(data.email);
        navigate("/dashboard");
    };

    const FeatureItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
        <div className="flex items-center gap-3 text-white/90">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm shadow-sm ring-1 ring-white/20">
                <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm drop-shadow-sm">{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-primary">
            {/* Background Effects */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-100 transition-transform duration-[20s] hover:scale-105"
                style={{ backgroundImage: `url(${loginBg})` }}
            />
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Green Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-black/40" />

            {/* Noise Texture */}
            <div className="absolute inset-0 subtle-noise opacity-20 mixed-blend-overlay" />

            <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 py-10">

                {/* Login Card - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full"
                >
                    <Card className="border-none shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                        <CardHeader className="space-y-1 pb-4">
                            <div className="flex justify-center mb-4">
                                <div className="bg-primary/10 p-3 rounded-2xl">
                                    <ScanSearch className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-center">
                                {isLogin ? "Welcome back" : "Create an account"}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {isLogin
                                    ? "Enter your email to sign in to your EcoTwin"
                                    : "Enter your email below to get started"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...register("email")}
                                        className={errors.email ? "border-destructive bg-white/50" : "bg-white/50"}
                                    />
                                    {errors.email && (
                                        <p className="text-destructive text-xs">{errors.email.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                        className={errors.password ? "border-destructive bg-white/50" : "bg-white/50"}
                                    />
                                    {errors.password && (
                                        <p className="text-destructive text-xs">{errors.password.message}</p>
                                    )}
                                </div>
                                <Button className="w-full shadow-lg shadow-primary/20" type="submit" disabled={isLoading} size="lg">
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? "Sign In" : "Create Account"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-muted/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background/0 px-2 text-muted-foreground bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full hover:bg-primary/5" onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Marketing Content - Stacked Below */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="w-full text-center space-y-6 px-4"
                >
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                            Make Sustainable Choices
                        </h1>
                        <p className="text-white/80 max-w-sm mx-auto leading-relaxed font-medium">
                            Your personal AI guide to understanding the environmental impact of products you buy.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-left max-w-sm mx-auto bg-white/5 p-4 rounded-xl border border-white/10">
                        <FeatureItem icon={Leaf} text="Real-time Carbon Footprint Analysis" />
                        <FeatureItem icon={ShieldCheck} text="Ethical Supply Chain Verification" />
                        <FeatureItem icon={Globe} text="Global Impact Tracking" />
                    </div>

                    <div className="text-white/40 text-xs">
                        © 2024 EcoTwin Inc.
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
