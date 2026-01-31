"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface CardData {
    id: string;
    image: string;
    index: string;
    title: string;
    description: string;
    color: string;
}

const cards: CardData[] = [
    {
        id: "card-one",
        image: "/cards/card-1.png",
        index: "01",
        title: "500+ Events",
        description: "Annually organized campus events, festivals, and workshops bringing students together.",
        color: "from-indigo-500 to-indigo-700",
    },
    {
        id: "card-two",
        image: "/cards/card-2.png",
        index: "02",
        title: "50+ Resources",
        description: "Modern seminar halls, labs, and equipment available for booking anytime.",
        color: "from-violet-500 to-violet-700",
    },
    {
        id: "card-three",
        image: "/cards/card-3.png",
        index: "03",
        title: "20+ Clubs",
        description: "Active student clubs fostering collaboration, creativity, and innovation.",
        color: "from-purple-500 to-purple-700",
    },
];

export function ScrollSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    const [isGapAnimationCompleted, setIsGapAnimationCompleted] = useState(false);
    const [isFlipAnimationCompleted, setIsFlipAnimationCompleted] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const ctx = gsap.context(() => {
            // Match media for responsive handling
            const mm = gsap.matchMedia();

            mm.add("(min-width: 768px)", () => {
                // Desktop animations
                const st = ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=300%",
                    pin: true,
                    scrub: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;

                        // Sticky header animation (10% - 25%)
                        if (headerRef.current) {
                            if (progress >= 0.1 && progress <= 0.25) {
                                const headerProgress = gsap.utils.mapRange(0.1, 0.25, 0, 1, progress);
                                gsap.set(headerRef.current, {
                                    y: gsap.utils.interpolate(50, 0, headerProgress),
                                    opacity: headerProgress,
                                });
                            } else if (progress < 0.1) {
                                gsap.set(headerRef.current, { y: 50, opacity: 0 });
                            } else {
                                gsap.set(headerRef.current, { y: 0, opacity: 1 });
                            }
                        }

                        // Card container width animation (0% - 25%)
                        if (containerRef.current) {
                            if (progress <= 0.25) {
                                const widthProgress = gsap.utils.mapRange(0, 0.25, 0, 1, progress);
                                gsap.set(containerRef.current, {
                                    width: gsap.utils.interpolate("60%", "90%", widthProgress),
                                });
                            } else {
                                gsap.set(containerRef.current, { width: "90%" });
                            }
                        }

                        // Gap and border-radius animation (35%)
                        if (progress >= 0.35 && !isGapAnimationCompleted) {
                            setIsGapAnimationCompleted(true);
                            gsap.to(containerRef.current, {
                                gap: "1.5rem",
                                duration: 0.5,
                                ease: "power2.out",
                            });
                            cardsRef.current.forEach((card) => {
                                if (card) {
                                    gsap.to(card, {
                                        borderRadius: "1rem",
                                        duration: 0.5,
                                    });
                                }
                            });
                        } else if (progress < 0.35 && isGapAnimationCompleted) {
                            setIsGapAnimationCompleted(false);
                            gsap.to(containerRef.current, {
                                gap: "0",
                                duration: 0.5,
                            });
                            // Reset border radius
                            cardsRef.current.forEach((card, idx) => {
                                if (card) {
                                    let borderRadius = "0";
                                    if (idx === 0) borderRadius = "1rem 0 0 1rem";
                                    if (idx === 2) borderRadius = "0 1rem 1rem 0";
                                    gsap.to(card, { borderRadius, duration: 0.5 });
                                }
                            });
                        }

                        // Card flip animation (70%)
                        if (progress >= 0.7 && !isFlipAnimationCompleted) {
                            setIsFlipAnimationCompleted(true);
                            cardsRef.current.forEach((card, idx) => {
                                if (card) {
                                    gsap.to(card, {
                                        rotateY: 180,
                                        duration: 0.8,
                                        delay: idx * 0.1,
                                        ease: "power2.inOut",
                                    });
                                    // Add swing effect to outer cards
                                    if (idx === 0 || idx === 2) {
                                        gsap.to(card, {
                                            y: 10,
                                            rotateZ: idx === 0 ? -2 : 2,
                                            duration: 0.8,
                                            delay: idx * 0.1,
                                        });
                                    }
                                }
                            });
                        } else if (progress < 0.7 && isFlipAnimationCompleted) {
                            setIsFlipAnimationCompleted(false);
                            cardsRef.current.forEach((card, idx) => {
                                if (card) {
                                    gsap.to(card, {
                                        rotateY: 0,
                                        y: 0,
                                        rotateZ: 0,
                                        duration: 0.8,
                                        delay: idx * 0.1,
                                    });
                                }
                            });
                        }
                    },
                });

                return () => {
                    st.kill();
                };
            });

            // Mobile - disable animations, stack vertically
            mm.add("(max-width: 767px)", () => {
                gsap.set(headerRef.current, { y: 0, opacity: 1 });
                gsap.set(containerRef.current, { width: "100%", gap: "1rem" });
                cardsRef.current.forEach((card) => {
                    if (card) {
                        gsap.set(card, {
                            rotateY: 0,
                            borderRadius: "1rem",
                            y: 0,
                            rotateZ: 0,
                        });
                    }
                });
            });
        });

        return () => ctx.revert();
    }, [isGapAnimationCompleted, isFlipAnimationCompleted]);

    return (
        <div className="scroll-animation-wrapper">
            {/* Intro Section */}
            <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-neutral-950 px-8">
                <h1 className="text-5xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 max-w-4xl">
                    Experience Campus Life Like Never Before
                </h1>
            </section>

            {/* Sticky Section with Cards */}
            <section
                ref={sectionRef}
                className="min-h-screen bg-black flex flex-col items-center justify-center py-20"
            >
                {/* Sticky Header */}
                <div
                    ref={headerRef}
                    className="text-center mb-12 opacity-0 translate-y-12"
                >
                    <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                        Discover What Awaits
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg max-w-2xl mx-auto">
                        Scroll to explore the vibrant campus ecosystem
                    </p>
                </div>

                {/* Card Container */}
                <div
                    ref={containerRef}
                    className="flex flex-col md:flex-row items-center justify-center w-[60%] gap-0"
                    style={{ perspective: "1000px" }}
                >
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            ref={(el) => { cardsRef.current[idx] = el; }}
                            className="card relative w-full md:w-1/3 aspect-[5/7] overflow-hidden"
                            style={{
                                transformStyle: "preserve-3d",
                                transformOrigin: "center center",
                                borderRadius:
                                    idx === 0
                                        ? "1rem 0 0 1rem"
                                        : idx === 2
                                            ? "0 1rem 1rem 0"
                                            : "0",
                            }}
                        >
                            {/* Card Front */}
                            <div
                                className="card-front absolute inset-0 w-full h-full"
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>

                            {/* Card Back */}
                            <div
                                className={`card-back absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br ${card.color}`}
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <span className="text-8xl font-bold text-white/20 absolute top-4 left-4">
                                    {card.index}
                                </span>
                                <h3 className="text-3xl font-bold text-white mb-4 text-center">
                                    {card.title}
                                </h3>
                                <p className="text-white/80 text-center text-lg">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Outro Section */}
            <section className="min-h-screen flex items-center justify-center bg-gradient-to-t from-black to-neutral-950 px-8">
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-8">
                        Ready to Join?
                    </h2>
                    <p className="text-neutral-400 text-xl mb-12 max-w-2xl mx-auto">
                        Start managing your campus activities with Campus Hive today
                    </p>
                    <a
                        href="/auth/register"
                        className="inline-flex items-center px-12 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-lg font-semibold hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300"
                    >
                        Get Started Now
                    </a>
                </div>
            </section>
        </div>
    );
}
