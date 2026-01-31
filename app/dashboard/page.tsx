"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Calendar, Building2, Users, TrendingUp, Clock, CheckCircle, ShoppingBag, BookOpen } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
    const { user, events, resources, clubs, storeItems, notes, chats } = useApp();

    // Calculate real-time stats
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
    const activeBookings = resources.filter(r => r.bookedSlots.length > 0).length;
    const clubMemberships = clubs.filter(c => c.role !== null).length;
    const totalStoreItems = storeItems.length;
    const totalNotes = notes.length;
    const unreadMessages = chats.reduce((acc, chat) => acc + chat.unread, 0);

    // Calculate engagement score (based on activity)
    const engagementScore = Math.min(100, Math.round(
        ((clubMemberships * 20) + (events.filter(e => e.organizer === "You").length * 15) + (activeBookings * 10)) 
    ));

    // Get recent activities from real data
    const recentActivities = [
        ...events.slice(-2).map(e => ({
            text: `Event "${e.title}" ${e.status}`,
            time: e.date
        })),
        ...resources.filter(r => r.bookedSlots.length > 0).slice(-2).map(r => ({
            text: `Booked ${r.name}`,
            time: "Recently"
        }))
    ].slice(0, 4);

    const stats = [
        {
            title: "Upcoming Events",
            description: `${upcomingEvents} events scheduled`,
            icon: <Calendar className="h-6 w-6 text-indigo-500" />,
            className: "md:col-span-1",
            header: (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-lg">
                    <div className="text-4xl font-bold text-indigo-400">{upcomingEvents}</div>
                </div>
            ),
        },
        {
            title: "Active Bookings",
            description: `${activeBookings} resources booked`,
            icon: <Building2 className="h-6 w-6 text-violet-500" />,
            className: "md:col-span-1",
            header: (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg">
                    <div className="text-4xl font-bold text-violet-400">{activeBookings}</div>
                </div>
            ),
        },
        {
            title: "Club Memberships",
            description: `Member of ${clubMemberships} clubs`,
            icon: <Users className="h-6 w-6 text-indigo-500" />,
            className: "md:col-span-1",
            header: (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-lg">
                    <div className="text-4xl font-bold text-indigo-400">{clubMemberships}</div>
                </div>
            ),
        },
        {
            title: "Recent Activity",
            description: unreadMessages > 0 ? `${unreadMessages} unread messages` : "All caught up!",
            icon: <Clock className="h-6 w-6 text-violet-500" />,
            className: "md:col-span-2",
            header: (
                <div className="h-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg p-4">
                    <div className="space-y-2">
                        {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-neutral-300">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span>{activity.text}</span>
                            </div>
                        )) : (
                            <p className="text-neutral-400 text-sm">No recent activity</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: "Engagement Score",
            description: `${engagementScore}% participation rate`,
            icon: <TrendingUp className="h-6 w-6 text-indigo-500" />,
            className: "md:col-span-1",
            header: (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-lg">
                    <div className="text-4xl font-bold text-indigo-400">{engagementScore}%</div>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                    Welcome back, {user?.name || "User"}!
                </h1>
                <p className="text-neutral-400 mt-2">Here's what's happening with your campus activities</p>
            </div>

            <BentoGrid className="max-w-6xl">
                {stats.map((stat, i) => (
                    <BentoGridItem
                        key={i}
                        title={stat.title}
                        description={stat.description}
                        header={stat.header}
                        icon={stat.icon}
                        className={stat.className}
                    />
                ))}
            </BentoGrid>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Link href="/dashboard/events" className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500 transition-all duration-200 text-left group cursor-pointer block">
                    <Calendar className="h-8 w-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-white mb-1">Create Event</h3>
                    <p className="text-neutral-400 text-sm">Start planning your next campus event</p>
                </Link>

                <Link href="/dashboard/resources" className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-violet-500 transition-all duration-200 text-left group cursor-pointer block">
                    <Building2 className="h-8 w-8 text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-white mb-1">Book Resource</h3>
                    <p className="text-neutral-400 text-sm">Reserve rooms, halls, or equipment</p>
                </Link>

                <Link href="/dashboard/clubs" className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500 transition-all duration-200 text-left group cursor-pointer block">
                    <Users className="h-8 w-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-white mb-1">Join Club</h3>
                    <p className="text-neutral-400 text-sm">Explore and join campus clubs</p>
                </Link>
            </div>
        </div>
    );
}
