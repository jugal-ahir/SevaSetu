"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingIndicatorContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 800);

        return () => {
            clearTimeout(timeout);
            setLoading(false);
        };
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 w-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-progress origin-left"></div>
            <style jsx>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.7); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 0.8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default function LoadingIndicator() {
    return (
        <Suspense fallback={null}>
            <LoadingIndicatorContent />
        </Suspense>
    );
}
