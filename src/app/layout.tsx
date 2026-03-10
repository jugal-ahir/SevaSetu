import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SevaSetu - Urban Governance Platform",
  description: "Empowering citizens and municipal authorities with seamless grievance management and service delivery",
  icons: {
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/56/Emblem_of_India_%28white%29.svg",
    apple: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg",
  },
};

import LoadingScreen from "@/components/LoadingScreen";
import LoadingIndicator from "@/components/LoadingIndicator";
import Chatbot from "@/components/Chatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <LoadingIndicator />
        <LoadingScreen />
        <Chatbot />
        {children}
      </body>
    </html>
  );
}
