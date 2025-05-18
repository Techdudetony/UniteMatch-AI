"use client";

import React, { useState, useMemo } from "react";
import { useOptimizer } from "@/context/OptimizerContext";
import { scoreCandidate, getRecommendedLane } from "../../utils/synergy";

export default function Suggestions() {
  const { selectedPokemon, pokemonData, stackSize } = useOptimizer(); // 🆕
  const [expandedIndex, setExpandedIndex] = useState(null);

  const suggestions = useMemo(() => {
    if (!pokemonData || selectedPokemon.length === 0) return [];

    const selectedNames = selectedPokemon.map(p => p.name.toLowerCase());

    const laneCounts = {};
    const roleCounts = {};

    selectedPokemon.forEach(p => {
      if (p.lane) laneCounts[p.lane] = (laneCounts[p.lane] || 0) + 1;
      if (p.role) roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
    });

    return pokemonData
      .filter(p => {
        const name = p.Name?.toLowerCase();
        return (
          name &&
          !selectedNames.includes(name) &&
          p.Role &&
          p.PreferredLane
        );
      })
      .map(p => ({
        ...p,
        score: scoreCandidate(p, selectedPokemon, laneCounts, roleCounts, stackSize) // 🆕
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(p => ({
        name: p.Name,
        role: p.Role,
        lane: getRecommendedLane(p.Role),
        winRate: ((p.FeedbackBoostedWinRate || 0) * 100).toFixed(2),
        image: `/pokemon/${p.Name.toLowerCase().replace(/ /g, "-")}.png`
      }));
  }, [selectedPokemon, pokemonData, stackSize]); // 🧠

  const isEmpty = suggestions.length === 0;

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mt-6 text-center w-full">
      <h2 className="text-white text-xl font-bold mb-2 [text-shadow:_1px_1px_0_#000]">
        Suggestioned Pokémon:
      </h2>

      {isEmpty ? (
        <p className="text-sm text-white">Add teammates to get suggestions.</p>
      ) : (
        <div className="flex gap-4 justify-center mt-4">
          {suggestions.map((pokemon, index) => (
            <div key={index} className="relative flex flex-col items-center">
              {/* Clickable Card */}
              <div
                onClick={() => toggleExpand(index)}
                className="cursor-pointer relative w-20 h-20 bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 rounded-md shadow-md overflow-hidden hover:scale-105 transition-transform border-4 border-blue-500"
                title={`${pokemon.name} – Lane: ${pokemon.lane}`}
              >
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-full h-full object-cover"
                />
                <img
                  src={`/lanes/${pokemon.lane.toLowerCase()}.png`}
                  alt={pokemon.lane}
                  className="absolute bottom-1 right-1 w-5 h-5"
                />
              </div>

              {/* Expansion Panel */}
              {expandedIndex === index && (
                <div className="mt-2 bg-black bg-opacity-80 hover:bg-opacity-30 text-white p-2 rounded-lg text-xs shadow-lg w-36 text-left z-10">
                  <p className="font-bold">{pokemon.name}</p>
                  <span>{pokemon.role}</span>
                  <div className="flex items-center gap-1">
                    <img
                      src={`/lanes/${pokemon.lane.toLowerCase()}.png`}
                      alt="lane"
                      className="w-4 h-4"
                    />
                    <span>{pokemon.lane}</span>
                  </div>
                  <p className="text-green-400">
                    Boosted Win Rate: {pokemon.winRate}%
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
