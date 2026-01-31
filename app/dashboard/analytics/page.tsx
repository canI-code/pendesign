"use client";
import React, { useMemo } from "react";
import { TrendingUp, Users, Calendar, Building2, ArrowUp, ArrowDown, MessageSquare, ShoppingBag, BookOpen, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AnalyticsPage() {
    const { events, resources, clubs, chats, storeItems, notes, messages, user } = useApp();

    // Calculate real-time statistics
    const stats = useMemo(() => {
        const totalEvents = events.length;
        const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
        const approvedEvents = events.filter(e => e.status === "approved").length;
        
        const totalResources = resources.length;
        const bookedResources = resources.filter(r => r.status === "booked").length;
        
        const totalClubs = clubs.length;
        const myClubs = clubs.filter(c => c.role !== null).length;
        const totalClubMembers = clubs.reduce((sum, c) => sum + c.members, 0);
        
        const totalChats = chats.length;
        const totalMessages = Object.values(messages).reduce((sum, msgs) => sum + msgs.length, 0);
        const unreadMessages = chats.reduce((sum, c) => sum + c.unread, 0);
        
        const totalStoreItems = storeItems.length;
        const availableItems = storeItems.filter(i => i.quantity > 0).length;
        
        const totalNotes = notes.length;
        const totalDownloads = notes.reduce((sum, n) => sum + n.downloads, 0);
        
        // Calculate engagement rate based on activity
        const engagementScore = Math.min(100, Math.round(
            (myClubs * 15) + 
            (totalMessages * 2) + 
            (bookedResources * 10) +
            (totalDownloads * 0.5)
        ));

        return [
            {
                title: "Total Events",
                value: totalEvents.toString(),
                detail: `${upcomingEvents} upcoming`,
                trend: "up",
                change: `${approvedEvents} approved`,
                icon: <Calendar className="h-6 w-6" />,
                color: "from-indigo-500 to-indigo-700",
            },
            {
                title: "Active Clubs",
                value: totalClubs.toString(),
                detail: `You're in ${myClubs}`,
                trend: myClubs > 0 ? "up" : "neutral",
                change: `${totalClubMembers} total members`,
                icon: <Users className="h-6 w-6" />,
                color: "from-violet-500 to-violet-700",
            },
            {
                title: "Resource Bookings",
                value: bookedResources.toString(),
                detail: `of ${totalResources} resources`,
                trend: bookedResources > 0 ? "up" : "neutral",
                change: `${totalResources - bookedResources} available`,
                icon: <Building2 className="h-6 w-6" />,
                color: "from-purple-500 to-purple-700",
            },
            {
                title: "Engagement Score",
                value: `${engagementScore}%`,
                detail: "Based on activity",
                trend: engagementScore > 50 ? "up" : "down",
                change: engagementScore > 70 ? "Excellent!" : engagementScore > 40 ? "Good" : "Needs attention",
                icon: <TrendingUp className="h-6 w-6" />,
                color: "from-pink-500 to-pink-700",
            },
        ];
    }, [events, resources, clubs, chats, messages, storeItems, notes]);

    // Recent activity from real data
    const recentActivity = useMemo(() => {
        const activities: any[] = [];

        // Add recent events
        events.slice(-2).forEach(event => {
            activities.push({
                event: event.title,
                type: "Event Created",
                time: event.date,
                user: event.organizer || "You",
                icon: <Calendar className="h-4 w-4" />,
            });
        });

        // Add club activities
        clubs.filter(c => c.role !== null).slice(-2).forEach(club => {
            activities.push({
                event: club.name,
                type: "Club Joined",
                time: "Recently",
                user: user?.name || "You",
                icon: <Users className="h-4 w-4" />,
            });
        });

        // Add booked resources
        resources.filter(r => r.status === "booked").slice(-2).forEach(resource => {
            activities.push({
                event: resource.name,
                type: "Resource Booked",
                time: "Recently",
                user: user?.name || "You",
                icon: <Building2 className="h-4 w-4" />,
            });
        });

        return activities.slice(0, 5);
    }, [events, clubs, resources, user]);

    // Top events by participants
    const topEvents = useMemo(() => {
        return events
            .sort((a, b) => b.participants - a.participants)
            .slice(0, 4)
            .map(event => ({
                name: event.title,
                participants: event.participants,
                status: new Date(event.date) > new Date() 
                    ? "Upcoming" 
                    : event.status === "approved" 
                        ? "Completed" 
                        : "Planning",
                rating: event.rating || 0,
            }));
    }, [events]);

    // Additional analytics
    const additionalStats = useMemo(() => [
        {
            title: "Store Items",
            value: storeItems.length,
            detail: `${storeItems.filter(i => i.quantity > 0).length} available`,
            icon: <ShoppingBag className="h-5 w-5" />,
        },
        {
            title: "Notes Shared",
            value: notes.length,
            detail: `${notes.reduce((sum, n) => sum + n.downloads, 0)} downloads`,
            icon: <BookOpen className="h-5 w-5" />,
        },
        {
            title: "Active Chats",
            value: chats.length,
            detail: `${Object.values(messages).reduce((sum, msgs) => sum + msgs.length, 0)} messages`,
            icon: <MessageSquare className="h-5 w-5" />,
        },
        {
            title: "Avg Event Rating",
            value: events.filter(e => e.rating > 0).length > 0 
                ? (events.filter(e => e.rating > 0).reduce((sum, e) => sum + e.rating, 0) / events.filter(e => e.rating > 0).length).toFixed(1)
                : "N/A",
            detail: `${events.filter(e => e.reviews && e.reviews.length > 0).length} reviewed`,
            icon: <Star className="h-5 w-5" />,
        },
    ], [storeItems, notes, chats, messages, events]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                    Analytics Dashboard
                </h1>
                <p className="text-neutral-400 mt-2">Track your campus engagement and performance in real-time</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-indigo-500 transition-all"
                    >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-neutral-400 text-sm mb-2">{stat.title}</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                            <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-neutral-400"}`}>
                                {stat.trend === "up" ? <ArrowUp className="h-4 w-4" /> : stat.trend === "down" ? <ArrowDown className="h-4 w-4" /> : null}
                                <span className="text-xs">{stat.change}</span>
                            </div>
                        </div>
                        <p className="text-neutral-500 text-xs mt-2">{stat.detail}</p>
                    </div>
                ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {additionalStats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-indigo-400">
                                {stat.icon}
                            </div>
                            <span className="text-neutral-400 text-sm">{stat.title}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-neutral-500 text-xs mt-1">{stat.detail}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-neutral-800 rounded-lg">
                                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{activity.event}</h3>
                                        <p className="text-neutral-400 text-sm">{activity.type} by {activity.user}</p>
                                        <p className="text-neutral-500 text-xs mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-neutral-400">No recent activity yet</p>
                            <p className="text-neutral-500 text-sm mt-1">Start creating events or joining clubs!</p>
                        </div>
                    )}
                </div>

                {/* Top Events */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Top Events</h2>
                    {topEvents.length > 0 ? (
                        <div className="space-y-4">
                            {topEvents.map((event, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{event.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-neutral-400 text-sm">{event.participants} participants</p>
                                                {event.rating > 0 && (
                                                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                                        <Star className="h-3 w-3 fill-current" />
                                                        {event.rating.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        event.status === "Upcoming" ? "bg-blue-500/10 text-blue-400" :
                                        event.status === "Completed" ? "bg-green-500/10 text-green-400" :
                                        "bg-yellow-500/10 text-yellow-400"
                                    }`}>
                                        {event.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-neutral-400">No events yet</p>
                            <p className="text-neutral-500 text-sm mt-1">Create your first event to see it here!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">📊 Your Campus Activity Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-neutral-900/50 rounded-lg p-4">
                        <p className="text-neutral-400 mb-1">Club Participation</p>
                        <p className="text-white">
                            You're a member of <span className="text-indigo-400 font-semibold">{clubs.filter(c => c.role !== null).length}</span> clubs
                        </p>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-4">
                        <p className="text-neutral-400 mb-1">Events Organized</p>
                        <p className="text-white">
                            You've created <span className="text-indigo-400 font-semibold">{events.filter(e => e.organizer === "You").length}</span> events
                        </p>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-4">
                        <p className="text-neutral-400 mb-1">Communication</p>
                        <p className="text-white">
                            <span className="text-indigo-400 font-semibold">{chats.length}</span> active conversations
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
