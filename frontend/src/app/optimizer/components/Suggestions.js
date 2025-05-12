"use client";

import React from "react";

export default function Suggestions({ suggestedPokemon = [] }) {
  return (
    <div className="mt-6 flex flex-col items-center">
      <h2 className="text-white text-lg font-bold mb-4">Suggested Pokémon:</h2>

      {/* Display suggested Pokémon as square image cards */}
      <div className="grid grid-cols-3 gap-4">
        {suggestedPokemon.length > 0 ? (
          suggestedPokemon.map((pokemon, index) => (
            <div
              key={index}
              className="w-20 h-20 bg-white rounded-md shadow-md overflow-hidden hover:scale-105 transition-transform"
              title={pokemon.name}
            >
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-300 col-span-3">
            No suggestions yet. Build a team to receive recommendations!
          </p>
        )}
      </div>
    </div>
  );
}
