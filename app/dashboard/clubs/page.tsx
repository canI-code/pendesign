"use client";
import React, { useState } from "react";
import { Users, Crown, Star, TrendingUp, X, UserPlus, MessageCircle, Upload, Image as ImageIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function ClubsPage() {
    const { clubs, joinClub, leaveClub, updateClub, user } = useApp();
    const router = useRouter();
    const [filter, setFilter] = useState("all");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClub, setSelectedClub] = useState<any>(null);
    const [joinForm, setJoinForm] = useState({
        reason: "",
        skills: "",
        availability: "",
    });
    const [editForm, setEditForm] = useState({
        logo: "",
        banner: "",
    });

    const handleJoinClub = (club: any) => {
        setSelectedClub(club);
        setShowJoinModal(true);
    };

    const handleEditClub = (club: any) => {
        setSelectedClub(club);
        setEditForm({
            logo: club.logo || "",
            banner: club.banner || "",
        });
        setShowEditModal(true);
    };

    const handleSubmitJoin = (e: React.FormEvent) => {
        e.preventDefault();

        joinClub(selectedClub.id);

        alert(`Welcome to ${selectedClub.name}!\n\nYou are now a member! A chat has been created in the Messages section.`);

        setShowJoinModal(false);
        setJoinForm({ reason: "", skills: "", availability: "" });

        setTimeout(() => {
            if (confirm("Would you like to go to Messages to chat with your club members?")) {
                router.push("/dashboard/messages");
            }
        }, 500);
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        updateClub(selectedClub.id, {
            logo: editForm.logo,
            banner: editForm.banner,
        });
        setShowEditModal(false);
        alert("Club branding updated successfully!");
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setEditForm({ ...editForm, logo: url });
        }
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setEditForm({ ...editForm, banner: url });
        }
    };

    const handleLeaveClub = (clubId: number) => {
        if (confirm("Are you sure you want to leave this club? The chat will also be removed.")) {
            leaveClub(clubId);
            alert("You have left the club successfully!");
        }
    };

    const handleOpenChat = (clubName: string) => {
        sessionStorage.setItem("openChat", clubName);
        router.push("/dashboard/messages");
    };

    const filteredClubs = clubs.filter((club) => {
        if (filter === "all") return true;
        if (filter === "my-clubs") return club.role !== null;
        return club.category === filter;
    });

    const getRoleBadge = (role: string | null) => {
        if (!role) return null;

        const badges = {
            head: { icon: <Crown className="h-3 w-3" />, text: "Head", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/50" },
            coordinator: { icon: <Star className="h-3 w-3" />, text: "Coordinator", color: "bg-blue-500/10 text-blue-400 border-blue-500/50" },
            member: { icon: <Users className="h-3 w-3" />, text: "Member", color: "bg-green-500/10 text-green-400 border-green-500/50" },
        };

        const badge = badges[role as keyof typeof badges];
        if (!badge) return null;

        return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                {badge.icon}
                <span>{badge.text}</span>
            </div>
        );
    };

    const isClubAdmin = (club: any) => {
        return club.role === "head" || club.role === "coordinator";
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Clubs & Committees
                    </h1>
                    <p className="text-neutral-400 mt-2">Join and collaborate with campus communities</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                {["all", "my-clubs", "technical", "cultural", "sports"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-indigo-500"
                            }`}
                    >
                        {f.replace("-", " ")}
                    </button>
                ))}
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                    <div
                        key={club.id}
                        className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                        {/* LinkedIn-style Banner */}
                        <div className="relative h-28 bg-gradient-to-r from-indigo-600 to-violet-600">
                            {club.banner ? (
                                <img 
                                    src={club.banner} 
                                    alt={`${club.name} banner`} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600" />
                            )}
                            
                            {/* Role Badge on Banner */}
                            {club.role && (
                                <div className="absolute top-3 right-3">
                                    {getRoleBadge(club.role)}
                                </div>
                            )}
                        </div>

                        {/* Logo - Positioned like LinkedIn */}
                        <div className="relative px-6">
                            <div className="absolute -top-10 left-6">
                                <div className="w-20 h-20 rounded-xl bg-neutral-800 border-4 border-neutral-900 flex items-center justify-center overflow-hidden shadow-lg">
                                    {club.logo && (club.logo.startsWith('http') || club.logo.startsWith('blob')) ? (
                                        <img 
                                            src={club.logo} 
                                            alt={`${club.name} logo`} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl">{club.logo || "🏢"}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 px-6 pb-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{club.name}</h3>
                                    <span className="text-xs text-indigo-400 capitalize">{club.category}</span>
                                </div>
                                {isClubAdmin(club) && (
                                    <button
                                        onClick={() => handleEditClub(club)}
                                        className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                                        title="Edit Club Branding"
                                    >
                                        <ImageIcon className="h-4 w-4 text-neutral-400" />
                                    </button>
                                )}
                            </div>
                            
                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{club.description}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-neutral-800/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                        <Users className="h-3 w-3" />
                                        <span>Members</span>
                                    </div>
                                    <div className="text-white font-bold text-lg">{club.members}</div>
                                </div>
                                <div className="bg-neutral-800/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>Events</span>
                                    </div>
                                    <div className="text-white font-bold text-lg">{club.events}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {club.role ? (
                                    <>
                                        <button
                                            onClick={() => handleOpenChat(club.name)}
                                            className="flex-1 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            Open Chat
                                        </button>
                                        <button
                                            onClick={() => handleLeaveClub(club.id)}
                                            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            Leave
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleJoinClub(club)}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                    >
                                        Join Club
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Join Club Modal */}
            {showJoinModal && selectedClub && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center overflow-hidden">
                                    {selectedClub.logo && (selectedClub.logo.startsWith('http') || selectedClub.logo.startsWith('blob')) ? (
                                        <img src={selectedClub.logo} alt={selectedClub.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">{selectedClub.logo || "🏢"}</span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-white">Join {selectedClub.name}</h2>
                            </div>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitJoin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Why do you want to join? *</label>
                                <textarea
                                    required
                                    value={joinForm.reason}
                                    onChange={(e) => setJoinForm({ ...joinForm, reason: e.target.value })}
                                    placeholder="Tell us why you're interested in this club..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Relevant Skills/Experience</label>
                                <textarea
                                    value={joinForm.skills}
                                    onChange={(e) => setJoinForm({ ...joinForm, skills: e.target.value })}
                                    placeholder="Any relevant skills or experience..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Availability *</label>
                                <select
                                    required
                                    value={joinForm.availability}
                                    onChange={(e) => setJoinForm({ ...joinForm, availability: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="">Select your availability</option>
                                    <option value="weekdays">Weekdays</option>
                                    <option value="weekends">Weekends</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            <div className="bg-neutral-800 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-2">Club Info</h4>
                                <div className="space-y-1 text-sm text-neutral-400">
                                    <p>{selectedClub.description}</p>
                                    <p className="mt-2">Current Members: <span className="text-white">{selectedClub.members}</span></p>
                                    <p>Events Organized: <span className="text-white">{selectedClub.events}</span></p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Join & Start Chatting
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Club Branding Modal */}
            {showEditModal && selectedClub && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Edit Club Branding</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
                            {/* Banner Preview & Upload */}
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Club Banner</label>
                                <div className="relative h-32 rounded-lg overflow-hidden bg-neutral-800">
                                    {editForm.banner ? (
                                        <img src={editForm.banner} alt="Banner preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600" />
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="text-center">
                                            <Upload className="h-6 w-6 text-white mx-auto mb-1" />
                                            <span className="text-white text-sm">Upload Banner</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBannerUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-neutral-500 text-xs mt-1">Recommended: 1200x300px</p>
                            </div>

                            {/* Logo Preview & Upload */}
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Club Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-800 flex items-center justify-center">
                                        {editForm.logo && (editForm.logo.startsWith('http') || editForm.logo.startsWith('blob')) ? (
                                            <img src={editForm.logo} alt="Logo preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl">{editForm.logo || selectedClub.logo || "🏢"}</span>
                                        )}
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload className="h-5 w-5 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <div className="text-neutral-400 text-sm">
                                        <p>Click to upload a new logo</p>
                                        <p className="text-neutral-500 text-xs mt-1">Recommended: 200x200px</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
