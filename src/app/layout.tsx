import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReticleDev } from "./reticle-dev";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Life OS — Personal Operating System",
  description: "Your complete life operating system. Plan, track and execute across health, career, finance and growth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'development' ? <ReticleDev /> : null}
      </body>
    </html>
  );
}
