'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color--purple)]">

      {/* Home Section */}
      <section className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Build Smarter Teams. Win More Matches!
        </h2>
        <p className="text-lg md:text-xl mb-6">
          UniteMatch AI helps Pokémon Unite players craft balanced, high-synergy teams using real match data and win-rate optimization.
        </p>
        <Link href="/optimizer">
          <button className="bg-[var(--color-orange)] hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition">
            Start Optimizing
          </button>
        </Link>
      </section>
    </main>
  );
}
