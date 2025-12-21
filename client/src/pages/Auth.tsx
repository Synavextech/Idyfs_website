
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    if (user) {
        setLocation("/");
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
        <div className="min-h-[80vh] flex items-center justify-center bg-[#f2f2f2] px-4 py-12">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[#04047a]">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-[#04047a]">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription>
                        {isLogin
                            ? "Sign in to access your IDYFS dashboard"
                            : "Join IDYFS and start your journey today"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#04047a] hover:bg-[#04047a]/90"
                            disabled={loginMutation.isPending || registerMutation.isPending}
                        >
                            {(loginMutation.isPending || registerMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? "Login" : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-gray-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#04047a] font-semibold hover:underline"
                        >
                            {isLogin ? "Create one" : "Login here"}
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

