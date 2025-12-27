import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rentora",
  description: "Find rooms, roommates, and rent hassle-free",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-left">
            <Image
              src="/Logo.png"
              alt="Rentora Logo"
              width={300}
              height={60}
            />
          </div>

          <div className="nav-right">
            <Link href="/login" className="btn-outline">
              Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
