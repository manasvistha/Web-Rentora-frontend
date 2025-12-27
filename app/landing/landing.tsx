"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative">

      {/* Navbar */}
      <header className="absolute top-0 left-0 w-full z-10 flex justify-between items-center px-12 py-6 bg-white/90">
        <Image
          src="/Logo.png"
          alt="Rentora logo"
          width={210}
          height={70}
          className="object-contain"
          priority
        />

        <nav className="flex items-center gap-8 text-sm font-medium">
          <Link href="#" className="hover:text-gray-600">
            Home
          </Link>
          <Link href="#" className="hover:text-gray-600">
            Properties
          </Link>
          <Link href="#" className="hover:text-gray-600">
            Pricing
          </Link>
          <Link href="#" className="hover:text-gray-600">
            Account
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-teal-600 px-5 py-2 text-teal-600 hover:bg-teal-50"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/room img.jpg')" }}
      >
        <div className="bg-white/70 px-10 py-8 rounded-xl text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-3">
            Find Your Dream Room with Rentora
          </h1>

          <p className="text-gray-700">
            Easily list flats, find roommates, and rent hassle-free
          </p>
        </div>
      </section>

    </main>
  );
}
