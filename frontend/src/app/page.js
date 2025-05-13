import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-20 px-4">
        <h1 className="text-5xl font-extrabold mb-6 outlined-text drop-shadow-lg">Welcome to UniteMatch AI</h1>

        <div className="relative bg-gradient-to-br from-[var(--accent)] via-[var(--background)] to-purple-900 p-20 rounded-xl max-w-4xl w-full border-2 border-black shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Build Smarter Teams. Win More Matches!</h2>
          <p className="text-lg font-medium">
            UniteMatch AI helps Pokémon Unite players craft balanced, high-synergy teams using real match data and win-rate optimization.
          </p>

          <div className="mt-6">
            <Link href="/optimizer">
              <button className="bg-[var(--accent)] hover:bg-orange-500 mt-10 text-black text-2xl font-bold py-4 px-8 rounded transition-all duration-200 shadow-lg">
                Start Optimizing
              </button>
            </Link>
          </div>

          {/* Decorative Pokémon (absolute on large screens only) */}
          <Image src="/comfey.png" alt="Comfey" width={130} height={130} className="absolute -top-14 -left-18 hidden lg:block" />
          <Image src="/charizard.png" alt="Charizard" width={240} height={240} className="absolute -top-28 -right-36 hidden lg:block" />
          <Image src="/pikachu.png" alt="Pikachu" width={150} height={150} className="absolute -bottom-12 -left-8 hidden lg:block" />
          <Image src="/blastoise.png" alt="Blastoise" width={220} height={220} className="absolute -bottom-22 -right-32 hidden lg:block" />
        </div>
      </section>
    </main>
  );
}
