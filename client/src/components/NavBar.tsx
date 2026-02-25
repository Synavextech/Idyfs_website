
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function NavBar() {
    const [location] = useLocation();
    const { user, profile, logoutMutation } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { title: "Home", href: "/" },
        { title: "Events", href: "/events" },
        { title: "Services", href: "/services" },
        { title: "Team", href: "/team" },
        { title: "Blog", href: "/blog" },
        { title: "Become a Member", href: "/onboard" },
    ];

    const isAdmin = profile?.role === 'admin';
    if (isAdmin) {
        navLinks.push({ title: "Admin", href: "/admin" });
    }


    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-primary text-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        IDYFS
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-accent-foreground/80 px-3 py-2 rounded-md",
                                    link.title === "Become a Member"
                                        ? "bg-[#b8240d] text-white hover:bg-[#b8240d]/90 shadow-md"
                                        : location === link.href ? "text-accent font-bold" : "text-white/90"
                                )}
                            >
                                {link.title}
                            </Link>
                        ))}
                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                                className="text-white border-white hover:bg-white hover:text-primary"
                            >
                                Logout
                            </Button>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/auth" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                                    Login/Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-white hover:bg-primary/90 rounded-md"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-primary/20 bg-primary">
                    <div className="flex flex-col space-y-2 p-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:bg-primary/80 p-2 rounded-md",
                                    location === link.href ? "text-accent font-bold" : "text-white/90"
                                )}
                            >
                                {link.title}
                            </Link>
                        ))}
                        {user && (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="text-left text-sm font-medium text-white/90 hover:bg-primary/80 p-2 rounded-md"
                            >Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
