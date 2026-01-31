"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FlipWords } from "@/components/ui/flip-words";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ScrollSection } from "@/components/scroll/ScrollSection";
import Link from "next/link";
import {
  Calendar,
  Building2,
  Users,
  BarChart3,
  MessageSquare,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react";

export default function Home() {
  const words = ["Events", "Resources", "Collaboration", "Innovation"];

  const features = [
    {
      title: "Event Management",
      description: "Create, manage, and track campus events with approval workflows and budget tracking.",
      icon: <Calendar className="h-6 w-6 text-indigo-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Resource Booking",
      description: "Book rooms, halls, and equipment with automatic conflict detection.",
      icon: <Building2 className="h-6 w-6 text-violet-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Club Collaboration",
      description: "Join clubs, collaborate on events, and manage memberships seamlessly.",
      icon: <Users className="h-6 w-6 text-indigo-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Analytics Dashboard",
      description: "Track engagement, resource utilization, and event participation with detailed insights.",
      icon: <BarChart3 className="h-6 w-6 text-violet-500" />,
      className: "md:col-span-2",
    },
    {
      title: "In-App Messaging",
      description: "Communicate with team members and clubs in real-time.",
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Approval Workflows",
      description: "Streamlined approval process for events and resource bookings.",
      icon: <CheckCircle className="h-6 w-6 text-violet-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Real-time Updates",
      description: "Get instant notifications for approvals, rejections, and upcoming events.",
      icon: <Clock className="h-6 w-6 text-indigo-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Role-Based Access",
      description: "Secure access control with admin, organizer, and participant roles.",
      icon: <Shield className="h-6 w-6 text-violet-500" />,
      className: "md:col-span-1",
    },
  ];

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      {/* Hero Section */}
      <div className="h-screen w-full flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            Campus Hive <br /> Unified Campus Management
          </h1>
          <div className="mt-8 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            <TextGenerateEffect
              words="Streamline campus activities with our comprehensive platform for managing events, resources, and collaboration."
              className="text-center"
            />
          </div>

          <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 mt-8 text-center">
            Manage
            <FlipWords words={words} className="text-indigo-500" />
            <br />
            with ease
          </div>

          <div className="flex gap-4 justify-center mt-12">
            <Link href="/auth/register">
              <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  Get Started
                </span>
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-8 py-3 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 text-white focus:ring-2 focus:ring-indigo-400 hover:shadow-xl transition duration-200">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Animation Section */}
      <ScrollSection />

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 bg-black">
        <h2 className="text-3xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-12">
          Everything you need in one place
        </h2>
        <BentoGrid className="max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <BentoGridItem
              key={i}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              className={feature.className}
            />
          ))}
        </BentoGrid>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 py-20 text-center bg-black">
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-6">
          Ready to transform your campus?
        </h2>
        <p className="text-neutral-400 text-lg mb-8">
          Join hundreds of students and organizers already using Campus Hive
        </p>
        <Link href="/auth/register">
          <button className="px-12 py-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 text-white text-lg font-semibold hover:shadow-2xl transition duration-200">
            Start Free Today
          </button>
        </Link>
      </div>
    </div>
  );
}

