"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useOptimizer } from "@/context/OptimizerContext";

export default function SelectedTeam() {
  const { selectedPokemon, setSelectedPokemon, stackSize, lane, predictedDifficulties, isLoading, pokemonData } = useOptimizer();
  const [renderedTeam, setRenderedTeam] = useState([]);
  const prevLength = useRef(0);

  useEffect(() => {
    // Slice only newly added Pokémon
    if (selectedPokemon.length > prevLength.current) {
      const newEntries = selectedPokemon.slice(prevLength.current).map(filename => ({
        filename,
        displayName: filename
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }));
      setRenderedTeam(prev => [...prev, ...newEntries]);
    }
    // Team was trimmed (deselection), reset completely
    else if (selectedPokemon.length < prevLength.current) {
      const reset = selectedPokemon.map(filename => ({
        filename,
        displayName: filename
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }));
      setRenderedTeam(reset);
    }

    prevLength.current = selectedPokemon.length;
  }, [selectedPokemon]);

  const handleExport = () => {
    const exportData = renderedTeam.map((entry) => {
      const displayName = entry.displayName;
      const match = predictedDifficulties?.find(
        (p) =>
          p.name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
          displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
      );

      const info = pokemonData.find(
        (p) =>
          p.Name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
          displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
      );

      return {
        name: displayName,
        role: info?.Role || "Unknown",
        lane,
        predicted_difficulty: match?.predicted_difficulty ?? "?",
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "UniteMatch_Team.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // Selected Team Box
    <div className="w-[450px] rounded-2xl border-4 border-black p-8 bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 shadow-xl">
      <h2 className="text-white text-3xl font-extrabold mb-4 text-center [text-shadow:_2px_2px_0_#000]">
        Selected Team
      </h2>

      <div className="space-y-4">
        {renderedTeam
          .slice(0, stackSize === "3 Stack" ? 3 : 5)
          .map(({ filename }) => {
            const displayName = filename
              .split("-")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            const match = predictedDifficulties?.find(
              (p) =>
                p.name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
                displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
            );

            const pokemonInfo = pokemonData.find(
              (p) =>
                p.Name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
                displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
            );

            const role = pokemonInfo?.Role || "Unknown"

            return (
              <div key={filename} className="flex items-center gap-4">
                <div className="w-22 h-22 rounded-lg border-4 border-purple-500 overflow-hidden bg-gradient-to-b from-orange-600 to-purple-600">
                  <Image
                    src={`/pokemon/${filename}.png`}
                    alt={displayName}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="text-white font-bold leading-tight text-xl [text-shadow:_1px_1px_0_#000]">
                  <div>{displayName}</div>
                  <div className="text-lg">Role: {role} / {lane} Lane</div>
                  <div className="text-lg">
                    Difficulty:{" "}
                    {isLoading || !match
                      ? "Loading Difficulty..."
                      : match.predicted_difficulty ?? "?"}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleExport}
          disabled={selectedPokemon.length === 0}
          className={`${selectedPokemon.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            } bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition`}
        >
          Export
        </button>
        <button
          onClick={() => setSelectedPokemon([])}
          disabled={selectedPokemon.length === 0}
          className={`${selectedPokemon.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            } bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition`}
        >
          Reset
        </button>
      </div>
    </div >
  );
}
