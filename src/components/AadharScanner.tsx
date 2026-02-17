"use client";

import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { CameraIcon, PhotoIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface AadharScannerProps {
    onExtractionComplete: (data: { nationalId: string; dob: string }) => void;
    onClose: () => void;
}

export default function AadharScanner({ onExtractionComplete, onClose }: AadharScannerProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const runOCR = async () => {
        if (!image) return;

        setIsScanning(true);
        setProgress(0);
        setError(null);

        try {
            const result = await Tesseract.recognize(image, "eng", {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        setProgress(Math.floor(m.progress * 100));
                    }
                },
            });

            const text = result.data.text;
            console.log("OCR Extracted Text:", text);

            // Regex for Aadhar Number: 12 digits (often has spaces)
            const aadharMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/) || text.match(/\b\d{12}\b/);

            // Regex for DOB: DD/MM/YYYY or DD-MM-YYYY
            const dobMatch = text.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);

            const extractedData = {
                nationalId: aadharMatch ? aadharMatch[0].replace(/\s/g, "") : "",
                dob: dobMatch ? formatDateForInput(dobMatch[0]) : "",
            };

            if (!extractedData.nationalId && !extractedData.dob) {
                setError("Could not extract data clearly. Please try a better photo or manual entry.");
            } else {
                onExtractionComplete(extractedData);
                setTimeout(onClose, 1500); // Close after showing success briefly
            }
        } catch (err) {
            console.error("OCR Error:", err);
            setError("Failed to process image. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const formatDateForInput = (dateStr: string) => {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const parts = dateStr.includes("/") ? dateStr.split("/") : dateStr.split("-");
        if (parts.length === 3) {
            const [d, m, y] = parts;
            return `${y}-${m}-${d}`;
        }
        return "";
    };

    useEffect(() => {
        if (image && !isScanning) {
            runOCR();
        }
    }, [image]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-slate-500 hover:bg-white hover:text-slate-700 transition-all"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="p-8">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <SparklesIcon className="h-8 w-8 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Smart Aadhar Scanner</h2>
                        <p className="mt-1 text-slate-500 text-sm">Upload or capture your Aadhar card for auto-filling</p>
                    </div>

                    {!image ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 transition-all hover:border-blue-400 hover:bg-blue-50/50"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="rounded-full bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <PhotoIcon className="h-8 w-8 text-slate-400 group-hover:text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-slate-900">Upload Aadhar Image</p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or JPEG (Max 5MB)</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">Or use camera</span>
                                </div>
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()} // Simplified for now, in reality might use MediaDevices API
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 px-4 font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                            >
                                <CameraIcon className="h-5 w-5 text-slate-500" />
                                Take a Photo
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                                <img src={image} alt="Aadhar Card" className="h-full w-full object-cover" />

                                {isScanning && (
                                    <>
                                        {/* Futuristic Graphical Overlay */}
                                        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                                            {/* Hex Grid Background */}
                                            <div className="absolute inset-0 opacity-10" style={{
                                                backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
                                                backgroundSize: '32px 32px'
                                            }}></div>

                                            {/* SVG for Nodes and Edges */}
                                            <svg className="absolute inset-0 h-full w-full">
                                                <defs>
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>

                                                {/* Graphical Edges (Lines) */}
                                                <g className="stroke-blue-500/30 stroke-[0.5] fill-none">
                                                    <line x1="10%" y1="20%" x2="40%" y2="40%" className="animate-edge-pulse" />
                                                    <line x1="40%" y1="40%" x2="30%" y2="70%" className="animate-edge-pulse" style={{ animationDelay: '0.5s' }} />
                                                    <line x1="30%" y1="70%" x2="60%" y2="80%" className="animate-edge-pulse" style={{ animationDelay: '1s' }} />
                                                    <line x1="60%" y1="80%" x2="80%" y2="50%" className="animate-edge-pulse" style={{ animationDelay: '1.5s' }} />
                                                    <line x1="80%" y1="50%" x2="40%" y2="40%" className="animate-edge-pulse" style={{ animationDelay: '2s' }} />
                                                    <line x1="10%" y1="20%" x2="80%" y2="50%" className="animate-edge-pulse" style={{ animationDelay: '2.5s' }} />
                                                </g>

                                                {/* Graphical Nodes (Dots) */}
                                                <g filter="url(#glow)">
                                                    <circle cx="10%" cy="20%" r="3" className="fill-blue-400 animate-node-pulse" />
                                                    <circle cx="40%" cy="40%" r="4" className="fill-blue-500 animate-node-pulse" style={{ animationDelay: '0.3s' }} />
                                                    <circle cx="30%" cy="70%" r="3" className="fill-blue-400 animate-node-pulse" style={{ animationDelay: '0.6s' }} />
                                                    <circle cx="60%" cy="80%" r="5" className="fill-blue-600 animate-node-pulse" style={{ animationDelay: '0.9s' }} />
                                                    <circle cx="80%" cy="50%" r="4" className="fill-blue-500 animate-node-pulse" style={{ animationDelay: '1.2s' }} />
                                                </g>
                                            </svg>

                                            {/* Scanning Bar with Glow */}
                                            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_40px_rgba(59,130,246,1)] animate-scan-line">
                                                <div className="absolute top-1/2 left-0 h-[300px] w-full -translate-y-1/2 bg-blue-500/5 blur-3xl"></div>
                                            </div>

                                            {/* Corner Accents */}
                                            <div className="absolute top-4 left-4 h-12 w-12 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg"></div>
                                            <div className="absolute top-4 right-4 h-12 w-12 border-t-2 border-r-2 border-blue-500/50 rounded-tr-lg"></div>
                                            <div className="absolute bottom-4 left-4 h-12 w-12 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg"></div>
                                            <div className="absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>
                                        </div>

                                        {/* Progress Overlay */}
                                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]">
                                            <div className="text-center">
                                                <div className="relative mb-6 inline-block">
                                                    <svg className="h-24 w-24 -rotate-90">
                                                        <circle cx="48" cy="48" r="40" className="stroke-blue-900/30 fill-none stroke-[6]" />
                                                        <circle
                                                            cx="48" cy="48" r="40"
                                                            className="stroke-blue-500 fill-none stroke-[6] transition-all duration-300"
                                                            strokeDasharray={251.2}
                                                            strokeDashoffset={251.2 - (251.2 * progress) / 100}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xl font-black text-white">{progress}%</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold tracking-tighter text-white uppercase italic">Neural Processing</h3>
                                                <p className="text-[10px] text-blue-300 font-mono mt-1 animate-pulse">MATCHING_IDENTITY_PATTERNS...</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-red-900/60 p-6 text-center text-white backdrop-blur-sm">
                                        <div>
                                            <p className="mb-4 font-medium">{error}</p>
                                            <button
                                                onClick={() => setImage(null)}
                                                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                Try Another Photo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isScanning && !error && (
                                <div className="mt-6 flex justify-between gap-4">
                                    <button
                                        onClick={() => setImage(null)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Retake
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes nodePulse {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.3); filter: brightness(1.5); }
                }
                @keyframes edgePulse {
                    0%, 100% { opacity: 0.2; stroke-width: 0.5; }
                    50% { opacity: 0.6; stroke-width: 1; }
                }
                .animate-scan-line {
                    animation: scan 3s ease-in-out infinite;
                }
                .animate-node-pulse {
                    transform-origin: center;
                    animation: nodePulse 2s ease-in-out infinite;
                }
                .animate-edge-pulse {
                    animation: edgePulse 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
