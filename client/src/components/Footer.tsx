
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
    return (
        <footer className="w-full bg-slate-900 text-slate-200 border-t border-slate-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Quick Access */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Quick Access</h3>
                        <ul className="space-y-2">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Services", href: "/services" },
                                { label: "Our Team", href: "/team" },
                                { label: "Blog", href: "/blog" },
                                { label: "Membership", href: "/onboard" }
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href}>
                                        <a className="hover:text-accent transition-colors text-sm">
                                            {item.label}
                                        </a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4 text-accent" />
                                <span>contact@idyfs.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-accent" />
                                <span>+123 456 7890</span>
                            </li>
                            <li className="flex items-center space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-accent" />
                                <span>123 Development Way, Global City</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-accent transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-accent transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-accent transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-accent transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} International Development Youth Foundation Services. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
