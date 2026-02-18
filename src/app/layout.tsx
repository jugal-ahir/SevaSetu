import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
import Chatbot from "@/components/Chatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LoadingScreen />
        <Chatbot />
        {children}
      </body>
    </html>
  );
}
