"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import Lottie to prevent SSR hydration issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LoadingContent() {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(true);
    const [animationData, setAnimationData] = useState<any>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const noAnim = searchParams.get("noAnim") === "true";

    useEffect(() => {
        // Fetch the animation data client-side
        fetch('/LOADING.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Error loading animation:", err));
    }, []);

    useEffect(() => {
        if (noAnim) {
            setIsVisible(false);
            setIsAnimating(false);
            return;
        }

        setIsVisible(true);
        setIsAnimating(true);

        const timer = setTimeout(() => {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 800);
        }, 1500); // 1.5 seconds loading minimum for "impact"

        return () => {
            clearTimeout(timer);
        };
    }, []);

    if (!isVisible || noAnim) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#f8fafc] transition-opacity duration-700 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="w-64 h-64 md:w-96 md:h-96">
                {animationData && (
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                        className="w-full h-full"
                    />
                )}
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
