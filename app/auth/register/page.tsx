"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Building, Calendar, Phone, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        emailVerified: false,
        department: "",
        year: new Date().getFullYear(),
    });
    const [loading, setLoading] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [error, setError] = useState("");
    
    // OTP states
    const [enteredOTP, setEnteredOTP] = useState("");
    const [otpError, setOtpError] = useState("");

    const handleSendOTP = async () => {
        // Validate required fields
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            setError("Please fill in all required fields");
            return;
        }

        // Validate phone number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone.replace(/\D/g, '').slice(-10))) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        setError("");
        setSendingOTP(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: formData.email,
                    name: formData.name 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }

            setStep(2);

            // If in dev mode, show the OTP
            if (data.devMode && data.otp) {
                setTimeout(() => {
                    alert(`[DEV MODE] Your OTP is: ${data.otp}\n\nIn production with Resend configured, this would be sent via email.`);
                }, 500);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSendingOTP(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (enteredOTP.length !== 6) {
            setOtpError("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        setOtpError("");

        try {
            // Verify OTP
            const verifyRes = await fetch("/api/auth/send-otp", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: formData.email,
                    otp: enteredOTP 
                }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
                throw new Error(verifyData.error || "Invalid OTP");
            }

            // OTP verified, proceed with registration
            await handleSubmit();
        } catch (err: any) {
            setOtpError(err.message);
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setSendingOTP(true);
        setOtpError("");
        setEnteredOTP("");

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: formData.email,
                    name: formData.name 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to resend OTP");
            }

            // If in dev mode, show the OTP
            if (data.devMode && data.otp) {
                alert(`[DEV MODE] New OTP: ${data.otp}`);
            } else {
                alert("New OTP sent to your email!");
            }
        } catch (err: any) {
            setOtpError(err.message);
        } finally {
            setSendingOTP(false);
        }
    };

    const handleSubmit = async () => {
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, emailVerified: true }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Store user data
            localStorage.setItem("user", JSON.stringify({
                ...data.user,
                phone: formData.phone,
                emailVerified: true,
            }));

            alert("Account created successfully! Email verified. ✓");
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
            setStep(1);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card with glassmorphism */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative px-8 py-10 bg-black rounded-2xl leading-none">
                        
                        {step === 1 ? (
                            // Step 1: Registration Form
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                                        Create Account
                                    </h1>
                                    <p className="text-neutral-400 mt-2">Join Campus Hive today</p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
                                    <div>
                                        <label className="text-neutral-300 text-sm mb-2 block">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-neutral-300 text-sm mb-2 block">
                                            Email * 
                                            <span className="text-neutral-500 text-xs ml-2">(Verification required)</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                placeholder="john@university.edu"
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Number - Required */}
                                    <div>
                                        <label className="text-neutral-300 text-sm mb-2 block">
                                            Mobile Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                placeholder="9876543210"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-neutral-300 text-sm mb-2 block">Password *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-neutral-300 text-sm mb-2 block">Department</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                                <input
                                                    type="text"
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                    placeholder="CS"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-neutral-300 text-sm mb-2 block">Year</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                                <input
                                                    type="number"
                                                    value={formData.year}
                                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                                    className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                    placeholder="2024"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sendingOTP}
                                        className="w-full relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50"
                                    >
                                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2">
                                            {sendingOTP ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Sending OTP...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4" />
                                                    Continue & Verify Email
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>

                                <p className="text-center text-neutral-400 mt-6">
                                    Already have an account?{" "}
                                    <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition">
                                        Login
                                    </Link>
                                </p>
                            </>
                        ) : (
                            // Step 2: OTP Verification
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="h-8 w-8 text-indigo-400" />
                                    </div>
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                                        Verify Email
                                    </h1>
                                    <p className="text-neutral-400 mt-2">
                                        Enter the 6-digit OTP sent to<br />
                                        <span className="text-white font-semibold">{formData.email}</span>
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-neutral-300 text-sm mb-2 block text-center">Enter OTP</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={enteredOTP}
                                            onChange={(e) => {
                                                setEnteredOTP(e.target.value.replace(/\D/g, ''));
                                                setOtpError("");
                                            }}
                                            placeholder="000000"
                                            className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                        disabled={enteredOTP.length !== 6 || loading}
                                        className="w-full relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none disabled:opacity-50"
                                    >
                                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4" />
                                                    Verify & Create Account
                                                </>
                                            )}
                                        </span>
                                    </button>

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            onClick={handleResendOTP}
                                            disabled={sendingOTP}
                                            className="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {sendingOTP ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                "Resend OTP"
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setStep(1);
                                                setEnteredOTP("");
                                                setOtpError("");
                                            }}
                                            className="text-neutral-400 hover:text-neutral-300 transition"
                                        >
                                            Change Email
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
