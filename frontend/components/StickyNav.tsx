'use client';
import Link from "next/link";
import { useState } from "react";
import { motion } from 'framer-motion';
import Image from "next/image";

export default function StickyNav() {
    const [menuOpen, setMenuOpen] = useState(false);

    return(
        <nav className="sticky top-0 z-50 backdrop-blur bg-[var(--color-orange)] text-white px-6 py-4 
        flex justify-between items-center shadow-md">
            <Link href="/">
                <Image
                    src="/UniteMatch_AI.png"
                    alt="UniteMatch AI Logo"
                    width={150}
                    height={50}
                    priority
                />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-6 text-lg font-semibold">
                <Link href="/" className="hover:underline">Home</Link>
                <Link href="/optimizer" className="hover:underline">Team Optimizer</Link>
                <Link href="/about" className="hover:underline">About</Link>
            </div>

            {/* Mobile Nav Toggle */}
            <motion.button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle Menu"
                className="md.hidden text-2xl font-bold"
                initial={false}
                animate={{ rotate: menuOpen ? 90 : 0 }}
            >
                ☰
            </motion.button>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="absolute top-full right-0 w-full bg-[var(--color-orange)] flex flex-col
                items-center py-4 space-y-4 md:hidden z-40">
                    <Link href="/" onClick={() => setMenuOpen(false)} className="hover:underline">Home</Link>
                    <Link href="/optimizer" onClick={() => setMenuOpen(false)} className="hover:underline">Team Optimizer</Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:underline">About</Link>
                </div>
            )}
        </nav>
    );
}