"use client";
import React, { useState, useEffect } from "react";
import { User, Mail, Building, Calendar, Edit2, Save, Phone, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
    const { user, setUser, clubs, events, resources } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john.doe@university.edu",
        phone: "",
        phoneVerified: false,
        department: "Computer Science",
        year: "2024",
        role: "Student",
        bio: "Passionate about technology and innovation. Active member of Tech Club and Robotics Club.",
    });

    // OTP verification states
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [generatedOTP, setGeneratedOTP] = useState("");
    const [enteredOTP, setEnteredOTP] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || "John Doe",
                email: user.email || "john.doe@university.edu",
                phone: user.phone || "",
                phoneVerified: user.phoneVerified || false,
                department: user.department || "Computer Science",
                year: user.year || "2024",
                role: user.role || "Student",
                bio: user.bio || "Passionate about technology and innovation.",
            });
        }
    }, [user]);

    // Calculate real stats
    const myClubs = clubs.filter(c => c.role !== null).length;
    const myEvents = events.filter(e => e.organizer === "You").length;
    const myBookings = resources.filter(r => r.status === "booked").length;

    const handleSave = () => {
        setIsEditing(false);
        // Save to localStorage and context
        const updatedUser = { ...user, ...profile };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Profile updated successfully!");
    };

    const generateOTP = () => {
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(otp);
        return otp;
    };

    const handleSendOTP = () => {
        if (!profile.phone || profile.phone.length < 10) {
            alert("Please enter a valid phone number first");
            return;
        }
        
        const otp = generateOTP();
        setOtpSent(true);
        setOtpError("");
        setShowOTPModal(true);
        
        // In a real app, you'd send this via SMS API
        // For demo, we'll show it in an alert
        setTimeout(() => {
            alert(`[DEMO] Your OTP is: ${otp}\n\nIn production, this would be sent via SMS.`);
        }, 500);
    };

    const handleVerifyOTP = () => {
        if (enteredOTP === generatedOTP) {
            setProfile({ ...profile, phoneVerified: true });
            setShowOTPModal(false);
            setEnteredOTP("");
            setOtpError("");
            
            // Update user context
            const updatedUser = { ...user, phone: profile.phone, phoneVerified: true };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            alert("Phone number verified successfully! ✓");
        } else {
            setOtpError("Invalid OTP. Please try again.");
        }
    };

    const handleResendOTP = () => {
        const otp = generateOTP();
        setOtpError("");
        setEnteredOTP("");
        alert(`[DEMO] New OTP: ${otp}`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Profile
                    </h1>
                    <p className="text-neutral-400 mt-2">Manage your account settings</p>
                </div>
                <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    {isEditing ? (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    ) : (
                        <>
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </>
                    )}
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {/* Header with gradient */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-violet-600"></div>

                {/* Profile Info */}
                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 bg-neutral-800 border-4 border-neutral-900 rounded-full flex items-center justify-center text-5xl">
                            👤
                        </div>
                        {profile.phoneVerified && (
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">
                                    <User className="inline h-4 w-4 mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">
                                    <Mail className="inline h-4 w-4 mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Mobile Number Field with Verification */}
                            <div className="md:col-span-2">
                                <label className="block text-neutral-400 text-sm mb-2">
                                    <Phone className="inline h-4 w-4 mr-2" />
                                    Mobile Number
                                    {profile.phoneVerified && (
                                        <span className="ml-2 text-green-400 text-xs">
                                            <CheckCircle className="inline h-3 w-3 mr-1" />
                                            Verified
                                        </span>
                                    )}
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => {
                                                setProfile({ 
                                                    ...profile, 
                                                    phone: e.target.value,
                                                    phoneVerified: false // Reset verification if number changes
                                                });
                                            }}
                                            disabled={!isEditing}
                                            placeholder="+91 9876543210"
                                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                                        />
                                        {profile.phoneVerified && (
                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />
                                        )}
                                    </div>
                                    {isEditing && profile.phone && !profile.phoneVerified && (
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            className="px-4 py-3 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors font-medium whitespace-nowrap"
                                        >
                                            <Shield className="inline h-4 w-4 mr-2" />
                                            Verify
                                        </button>
                                    )}
                                </div>
                                {!profile.phoneVerified && profile.phone && (
                                    <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Phone number not verified. Click "Verify" to receive OTP.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">
                                    <Building className="inline h-4 w-4 mr-2" />
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={profile.department}
                                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">
                                    <Calendar className="inline h-4 w-4 mr-2" />
                                    Year
                                </label>
                                <input
                                    type="text"
                                    value={profile.year}
                                    onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-neutral-400 text-sm mb-2">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                disabled={!isEditing}
                                rows={4}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-indigo-400 mb-2">{myEvents}</div>
                    <p className="text-neutral-400">Events Created</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-violet-400 mb-2">{myClubs}</div>
                    <p className="text-neutral-400">Club Memberships</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{myBookings}</div>
                    <p className="text-neutral-400">Resource Bookings</p>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Verify Phone Number</h2>
                            <p className="text-neutral-400 mt-2">
                                Enter the 6-digit OTP sent to<br />
                                <span className="text-white font-semibold">{profile.phone}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Enter OTP</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={enteredOTP}
                                    onChange={(e) => {
                                        setEnteredOTP(e.target.value.replace(/\D/g, ''));
                                        setOtpError("");
                                    }}
                                    placeholder="000000"
                                    className="w-full px-4 py-4 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500"
                                />
                                {otpError && (
                                    <p className="text-red-400 text-sm mt-2 flex items-center justify-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {otpError}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={enteredOTP.length !== 6}
                                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Verify OTP
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    onClick={handleResendOTP}
                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Resend OTP
                                </button>
                                <button
                                    onClick={() => {
                                        setShowOTPModal(false);
                                        setEnteredOTP("");
                                        setOtpError("");
                                    }}
                                    className="text-neutral-400 hover:text-neutral-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
