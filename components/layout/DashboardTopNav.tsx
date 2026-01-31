"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Calendar,
    Building2,
    Users,
    MessageCircle,
    TrendingUp,
    User,
    LogOut,
    Menu,
    X,
    ShoppingBag,
    BookOpen,
} from "lucide-react";

export function DashboardTopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Events", href: "/dashboard/events", icon: Calendar },
        { name: "Resources", href: "/dashboard/resources", icon: Building2 },
        { name: "Clubs", href: "/dashboard/clubs", icon: Users },
        { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
        { name: "Store", href: "/dashboard/store", icon: ShoppingBag },
        { name: "Notes", href: "/dashboard/notes", icon: BookOpen },
        { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">Campus Hive</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                                                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="hidden lg:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-white text-sm font-medium">{user?.name || "User"}</p>
                                <p className="text-neutral-400 text-xs">{user?.email || ""}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden border-t border-neutral-800 bg-neutral-900">
                        <div className="px-4 py-4 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowMobileMenu(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                                                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                            <div className="pt-4 border-t border-neutral-800">
                                <div className="px-4 py-2">
                                    <p className="text-white text-sm font-medium">{user?.name || "User"}</p>
                                    <p className="text-neutral-400 text-xs">{user?.email || ""}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
