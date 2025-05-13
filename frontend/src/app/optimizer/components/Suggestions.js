"use client";

import React from "react";

export default function Suggestions({ suggestedPokemon = [] }) {
  const isPlaceholder = suggestedPokemon.length === 0;

  return (
    <div className="mt-6 text-center w-full">
      <h2 className="text-white text-xl font-bold mb-2 [text-shadow:_1px_1px_0_#000]">
        Suggestioned Pokémon:
      </h2>

      {isPlaceholder ? (
        <p className="text-sm text-white">Add teammates to see recommendations.</p>
      ) : (
        <div className="flex gap-4 justify-center mt-4">
          {suggestedPokemon.map((pokemon, index) => (
            <div
              key={index}
              className="w-20 h-20 bg-white rounded-md shadow-md overflow-hidden hover:scale-105 transition-transform border-4 border-blue-500"
              title={pokemon.name}
            >
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
