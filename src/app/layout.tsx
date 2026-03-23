import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Growth Tracker — 90-Day Developer Growth Engine",
  description: "Personal productivity dashboard for tracking daily tasks, content, freelancing, and startup growth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-[240px] flex-1">
            <TopBar />
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
