"use client";

import Link from "next/link";
import { MapPinIcon, ShieldCheckIcon, ChartBarIcon, BellAlertIcon } from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all group-hover:scale-105 p-2 relative ring-1 ring-slate-100">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                  alt="National Emblem of India"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">SevaSetu</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Urban Governance</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Empowering{" "}
            <span className="gradient-text">Urban Governance</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            SevaSetu bridges the gap between citizens and municipal authorities, enabling seamless grievance management, real-time service tracking, and transparent governance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/40"
            >
              Register as Citizen
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
            >
              Official Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<MapPinIcon className="h-8 w-8" />}
            title="Location-Based"
            description="Auto-detect location or manually pin grievance locations for accurate service delivery"
          />
          <FeatureCard
            icon={<ShieldCheckIcon className="h-8 w-8" />}
            title="Secure Verification"
            description="Digital identity verification ensures authentic users and secure data handling"
          />
          <FeatureCard
            icon={<ChartBarIcon className="h-8 w-8" />}
            title="Real-Time Analytics"
            description="Track SLA compliance, performance metrics, and service delivery in real-time"
          />
          <FeatureCard
            icon={<BellAlertIcon className="h-8 w-8" />}
            title="Smart Escalation"
            description="Automatic escalation based on SLA rules ensures timely resolution"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <StatCard number="24/7" label="Service Availability" />
          <StatCard number="100%" label="Transparency" />
          <StatCard number="Real-Time" label="Tracking" />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-600">
            © 2026 SevaSetu. Empowering citizens, enabling governance.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3 text-blue-600 transition-all group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="text-4xl font-bold gradient-text">{number}</div>
      <div className="mt-2 text-sm font-medium text-slate-600">{label}</div>
    </div>
  );
}
