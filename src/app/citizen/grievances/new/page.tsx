"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { PhotoIcon, MapPinIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function NewGrievancePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        address: "",
        latitude: "",
        longitude: "",
        departmentId: "",
    });
    const [departments, setDepartments] = useState<any[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    const categories = [
        { value: "ROADS", label: "Roads & Infrastructure", subcategories: ["Potholes", "Street Lights", "Drainage"] },
        { value: "WATER", label: "Water Supply", subcategories: ["No Water", "Contaminated Water", "Leakage"] },
        { value: "SANITATION", label: "Sanitation", subcategories: ["Garbage Collection", "Public Toilets", "Sewage"] },
        { value: "ELECTRICITY", label: "Electricity", subcategories: ["Power Cut", "Faulty Meter", "Street Lights"] },
        { value: "OTHER", label: "Other", subcategories: ["Noise Pollution", "Illegal Construction", "Other"] },
    ];

    const selectedCategory = categories.find(c => c.value === formData.category);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await fetch("/api/departments");
                const data = await res.json();
                if (data.departments) {
                    setDepartments(data.departments);
                }
            } catch (err) {
                console.error("Failed to fetch departments", err);
            }
        };
        fetchDepartments();
    }, []);

    const detectLocation = () => {
        setDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                    });
                    setDetectingLocation(false);
                },
                (error) => {
                    setError("Unable to detect location. Please enter manually.");
                    setDetectingLocation(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser");
            setDetectingLocation(false);
        }
    };

    const handleAIScan = async () => {
        if (!imageFile) {
            setError("Please select an image first to scan.");
            return;
        }

        setIsScanning(true);
        setError("");

        try {
            const scanFormData = new FormData();
            scanFormData.append("file", imageFile);

            const res = await fetch("/api/analyze-image", {
                method: "POST",
                body: scanFormData,
            });

            if (!res.ok) throw new Error("AI Analysis failed");

            const data = await res.json();

            // Artificial delay for animation
            await new Promise(r => setTimeout(r, 3000));

            setFormData(prev => ({
                ...prev,
                ...data,
                departmentId: departments.find(d => d.name.toUpperCase().includes(data.category))?.id || prev.departmentId
            }));

            setScanComplete(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setUploadProgress("Preparing submission...");

        try {
            let imageUrl = null;
            if (imageFile) {
                setUploadProgress("Uploading image...");
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    throw new Error(uploadData.error || "Image upload failed");
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.imageUrl;
            }

            setUploadProgress("Submitting grievance details...");
            const res = await fetch("/api/grievances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                    imageUrl,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                let errorMessage = data.error || "Failed to submit grievance";
                if (data.details && data.details.fieldErrors) {
                    const validationErrors = Object.entries(data.details.fieldErrors)
                        .map(([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`)
                        .join("; ");
                    errorMessage += `: ${validationErrors}`;
                }
                throw new Error(errorMessage);
            }

            router.push(`/citizen/grievances/${data.grievance.id}`);
        } catch (err: any) {
            setError(err.message);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="CITIZEN" userName="Citizen" />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Submit New Grievance</h1>
                    <p className="mt-2 text-slate-600">Provide details about your issue for faster resolution</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Upload Image & AI Scan
                            </label>
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50">
                                    <PhotoIcon className="h-6 w-6 text-blue-500" />
                                    {imageFile ? "Change Image" : "Choose Image"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            setImageFile(e.target.files?.[0] || null);
                                            setScanComplete(false);
                                        }}
                                        className="hidden"
                                    />
                                </label>

                                {imageFile && !scanComplete && (
                                    <button
                                        type="button"
                                        onClick={handleAIScan}
                                        disabled={isScanning}
                                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <SparklesIcon className={`h-5 w-5 ${isScanning ? "animate-spin" : ""}`} />
                                        {isScanning ? "Scanning..." : "Scan Image with AI"}
                                    </button>
                                )}

                                {scanComplete && (
                                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-6 py-4 text-sm font-bold text-green-700 border border-green-100">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        AI Scan Successful!
                                    </div>
                                )}
                            </div>
                            {imageFile && (
                                <p className="mt-2 text-xs text-slate-500 italic pl-1">Selected: {imageFile.name}</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                minLength={5}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Brief summary of the issue"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                required
                                minLength={10}
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Detailed description of the issue..."
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-slate-700">
                                    Target Department *
                                </label>
                                <select
                                    id="department"
                                    required
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">Select department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subcategory" className="block text-sm font-medium text-slate-700">
                                Subcategory
                            </label>
                            <select
                                id="subcategory"
                                value={formData.subcategory}
                                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                disabled={!selectedCategory}
                                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
                            >
                                <option value="">Select subcategory</option>
                                {selectedCategory?.subcategories.map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                                Address *
                            </label>
                            <input
                                id="address"
                                type="text"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Street address or landmark"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Location Coordinates
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={detectingLocation}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <MapPinIcon className="h-5 w-5" />
                                    {detectingLocation ? "Detecting..." : "Auto-Detect Location"}
                                </button>
                                {formData.latitude && formData.longitude && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span>📍 {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? uploadProgress || "Submitting..." : "Submit Grievance"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Scanning Animation Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
                    <div className="relative h-80 w-80 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-white/20">
                        <div className="animate-scan" />
                        <div className="flex h-full flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <SparklesIcon className="h-16 w-16 text-blue-500 animate-pulse" />
                                <div className="absolute -inset-4 rounded-full border border-blue-100 animate-ping opacity-25" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-900 uppercase tracking-[0.2em]">AI Scanning</p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">Analyzing image content...</p>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-500 h-full animate-progress" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
