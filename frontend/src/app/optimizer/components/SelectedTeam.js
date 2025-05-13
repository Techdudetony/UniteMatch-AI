"use client";

import Image from "next/image";

export default function SelectedTeam({ stackSize, selectedPokemon, lane }) {
  return (
    <div className="w-[420px] rounded-2xl border-4 border-black p-8 bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 shadow-xl">
      <h2 className="text-white text-3xl font-extrabold mb-4 text-center [text-shadow:_2px_2px_0_#000]">
        Selected Team
      </h2>

      <div className="space-y-4">
        {selectedPokemon
          .slice(0, stackSize === "3 Stack" ? 3 : 5)
          .map((filename, index) => {
            // Convert "galarian-rapidash" to "Galarian Rapidash"
            const name = filename
              .split("-")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-22 h-22 rounded-lg border-4 border-purple-500 overflow-hidden bg-gradient-to-b from-orange-600 to-purple-600">
                  <Image
                    src={`/pokemon/${filename}.png`}
                    alt={name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="text-white font-bold leading-tight text-xl [text-shadow:_1px_1px_0_#000]">
                  <div>{name}</div>
                  <div className="text-lg">Role / {lane} Lane</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

