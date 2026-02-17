"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Path between:
// Start: 23.0381, 72.5544 (LD College)
// End: 23.0398, 72.5318 (Commerce Six Roads)
const ROAD_PATH: [number, number][] = [
    [23.0381, 72.5544], // LD College
    [23.0382, 72.5535],
    [23.0383, 72.5510],
    [23.0385, 72.5485],
    [23.0386, 72.5460],
    [23.0388, 72.5435],
    [23.0390, 72.5410],
    [23.0393, 72.5385],
    [23.0395, 72.5350],
    [23.0397, 72.5330],
    [23.0398, 72.5318], // Commerce Six Roads
];

function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 16);
    }, [position, map]);
    return null;
}

export default function LiveVehicleMap({ vehicleName }: { vehicleName: string }) {
    const [currentPos, setCurrentPos] = useState<[number, number]>(ROAD_PATH[0]);
    const [rotation, setRotation] = useState(0);
    const [pathIndex, setPathIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Create a rotating truck icon using a DivIcon
    const vehicleIcon = useMemo(() => {
        if (typeof window === "undefined") return null;
        return L.divIcon({
            className: "bg-transparent",
            html: `
                <div style="transform: rotate(${rotation - 90}deg); transition: transform 0.1s linear;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2555/2555013.png" style="width: 40px; height: 40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    }, [rotation]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 1) {
                    setPathIndex((idx) => (idx + 1) % (ROAD_PATH.length - 1));
                    return 0;
                }
                return prev + 0.01;
            });
        }, 80);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const start = ROAD_PATH[pathIndex];
        const end = ROAD_PATH[pathIndex + 1];

        // Calculate heading (bearing)
        const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * (180 / Math.PI);
        setRotation(90 - angle);

        const lat = start[0] + (end[0] - start[0]) * progress;
        const lng = start[1] + (end[1] - start[1]) * progress;

        setCurrentPos([lat, lng]);
    }, [pathIndex, progress]);

    if (!vehicleIcon) return null;

    return (
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border-4 border-white bg-slate-100 shadow-2xl ring-1 ring-slate-200">
            <div className="absolute top-6 left-6 z-[1000] rounded-2xl bg-white px-5 py-3 shadow-xl border border-slate-100 ring-4 ring-slate-50">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Live Surveillance</p>
                        <p className="text-base font-black text-slate-900">{vehicleName}</p>
                    </div>
                </div>
            </div>

            <MapContainer
                // @ts-ignore
                center={ROAD_PATH[0]}
                zoom={16}
                scrollWheelZoom={false}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <Polyline
                    // @ts-ignore
                    positions={ROAD_PATH}
                    color="#1e293b"
                    weight={6}
                    opacity={0.08}
                />

                {/* @ts-ignore */}
                <Marker position={currentPos} icon={vehicleIcon} />

                <RecenterMap position={currentPos} />
            </MapContainer>

            <div className="absolute bottom-6 left-6 z-[1000] rounded-xl bg-slate-900/90 backdrop-blur-md px-4 py-2 text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                Speed: 42 km/h • Heading: {rotation.toFixed(0)}°
            </div>
        </div>
    );
}
