"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loading() {
                 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch('/LOADING.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Error loading animation:", err));
    }, []);

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-[#f8fafc]/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="w-48 h-48 md:w-64 md:h-64">
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
