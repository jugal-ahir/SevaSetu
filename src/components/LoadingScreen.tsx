"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingContent() {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(true);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const noAnim = searchParams.get("noAnim") === "true";

    useEffect(() => {
        if (noAnim) {
            setIsVisible(false);
            setIsAnimating(false);
            return;
        }

        // Play full animation on refresh or path change
        setIsVisible(true);
        setIsAnimating(true);

        // Animation length reduced for snappier feel
        const timer = setTimeout(() => {
            setIsAnimating(false);
            // Small transition delay before hiding completely
            setTimeout(() => setIsVisible(false), 400);
        }, 1800);

        return () => clearTimeout(timer);
    }, [pathname, noAnim]);

    if (!isVisible || noAnim) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative">
                {/* National Emblem replacing the S sketch */}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-slate-200/50 p-3 relative overflow-hidden ring-1 ring-slate-100 animate-pulse-subtle">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                        alt="National Emblem of India"
                        className="h-full w-full object-contain"
                    />
                </div>

                {/* Particle Whoosh Effect - Removed Distracting Ping */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full border border-blue-500/10"></div>
                </div>
            </div>

            <div className="mt-12 text-center overflow-hidden">
                <h2 className="text-2xl font-black tracking-[0.2em] text-slate-900 uppercase">
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '0.5s' }}>S</span>
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '0.6s' }}>E</span>
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '0.7s' }}>V</span>
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '0.8s' }}>A</span>
                    <span className="ml-3 inline-block animate-fade-up opacity-0" style={{ animationDelay: '0.9s' }}>S</span>
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '1.0s' }}>E</span>
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '1.1s' }}>T</span>
                    <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: '1.2s' }}>U</span>
                </h2>

                {/* Synced Progress Bar */}
                <div className="mt-4 h-1.5 w-64 mx-auto bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-progress"></div>
                </div>
                <p className="mt-3 text-[10px] font-black tracking-widest text-blue-600 uppercase border-t border-slate-100 pt-2 w-max mx-auto px-4">Initializing SevaSetu</p>
            </div>
        </div>
    );
}

export default function LoadingScreen() {
    return (
        <Suspense fallback={null}>
            <LoadingContent />
        </Suspense>
    );
}
