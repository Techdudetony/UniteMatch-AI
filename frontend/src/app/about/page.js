import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-8 text-white font-sans relative">
      {/* Page Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 [text-shadow:_2px_2px_0_#000]">
        About UniteMatch AI
      </h1>

      {/* Content Card */}
      <div className="relative max-w-3xl mx-auto bg-gradient-to-br from-orange-400 via-[#480ad8] to-purple-900 p-6 md:p-20 rounded-xl border border-black shadow-lg text-center">
        <p className="text-lg md:text-2xl font-semibold text-white mb-4">
          UniteMatch AI is a smart strategy assistant for Pokémon Unite.
        </p>

        <p className="text-md md:text-xl font-medium mb-4">
          Powered by real match data and machine learning, it analyzes win
          rates, role synergy, and lane assignments to help you create
          high-performing teams.
        </p>

        <p className="text-md md:text-xl font-medium">
          Whether you're solo queuing or playing as a coordinated 5-stack,
          UniteMatch AI helps you build balanced, high-synergy compositions—
          fast.
        </p>
      </div>

      {/* Pokémon Decorations */}
      <Image
        src="/lapras.png"
        alt="Lapras"
        width={300}
        height={300}
        className="absolute bottom-60 left-110 hidden md:block"
      />
      <Image
        src="/inteleon.png"
        alt="Inteleon"
        width={300}
        height={300}
        className="absolute top-8 right-100 hidden md:block"
      />
    </div>
  );
}
