
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    if (user) {
        const redirect = sessionStorage.getItem("redirect_after_login");
        if (redirect) {
            sessionStorage.removeItem("redirect_after_login");
            setLocation(redirect);
        } else {
            setLocation("/");
        }
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await loginMutation.mutateAsync({ email, password });
            } else {
                await registerMutation.mutateAsync({ email, password, name });
            }
        } catch (error: any) {
            toast({
                title: isLogin ? "Login failed" : "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
            <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-black/5 bg-white/95 backdrop-blur-sm overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-[#04047a] to-[#2a2a9a]"></div>
                <CardHeader className="text-center pt-8 pb-6">
                    <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        {isLogin
                            ? "Sign in to access your dashboard"
                            : "Join IDYFS and start your journey"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                    className="h-11 focus-visible:ring-[#04047a]"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 focus-visible:ring-[#04047a]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10 focus-visible:ring-[#04047a]"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#04047a] hover:bg-[#04047a]/90 transition-all shadow-md hover:shadow-lg mt-4"
                            disabled={loginMutation.isPending || registerMutation.isPending}
                        >
                            {(loginMutation.isPending || registerMutation.isPending) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="px-8 pb-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
                    <div className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#04047a] font-semibold hover:text-[#2a2a9a] transition-colors hover:underline focus:outline-none focus:underline"
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

