"use client";

import Link from "next/link";
import Image from "next/image";

export default function StickyNav() {
  return (
    <header className="sticky top-0 z-50 bg-[#f08922] px-8 py-4 flex justify-between items-center shadow-md">
      {/* Logo + Title */}
      <div className="flex items-center drop-shadow-2xl gap-3">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h1 className="text-white text-4xl outlined-text font-extrabold tracking-wide">UniteMatch AI</h1>
      </div>

      {/* Nav Links */}
      <nav className="flex space-x-8 text-black font-semibold text-lg">
        <Link href="/" className="hover:underline text-white text-3xl outlined-text font-extrabold">Home</Link>
        <Link href="/optimizer" className="hover:underline text-white text-3xl outlined-text font-extrabold">Team Optimizer</Link>
        <Link href="/about" className="hover:underline text-white text-3xl outlined-text font-extrabold">About</Link>
      </nav>
    </header>
  );
}
