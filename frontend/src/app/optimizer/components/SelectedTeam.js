"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useOptimizer } from "@/context/OptimizerContext";
import FeedbackModal from "./FeedbackModal";

export default function SelectedTeam() {
  const {
    selectedPokemon,
    setSelectedPokemon,
    stackSize,
    predictedDifficulties,
    isLoading,
    pokemonData,
  } = useOptimizer();

  const [renderedTeam, setRenderedTeam] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const entries = selectedPokemon.map(({ name, lane, role }) => ({
      filename: name,
      displayName: name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      lane,
      role,
    }));
    setRenderedTeam(entries);
  }, [selectedPokemon]);

  const handleExport = () => {
    const exportData = renderedTeam.map(({ displayName, lane, role }) => {
      const match = predictedDifficulties?.find(
        (p) =>
          p.name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
          displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
      );

      return {
        name: displayName,
        role: role ?? "Unknown",
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
    setTimeout(() => {
      a.click();
      URL.revokeObjectURL(url);
      setShowFeedbackModal(true);
    }, 500);
  };

  return (
    <>
      {/* Gradient Box */}
      <div className="w-[500px] rounded-2xl border-4 border-black p-8 bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 shadow-xl">
        <h2 className="text-white text-3xl font-extrabold mb-4 text-center [text-shadow:_2px_2px_0_#000]">
          Selected Team
        </h2>

        <div className="space-y-4">
          {renderedTeam
            .slice(0, stackSize === "3 Stack" ? 3 : 5)
            .map(({ filename, displayName, lane, role }) => {
              const match = predictedDifficulties?.find(
                (p) =>
                  p.name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
                  displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
              );

              return (
                <div
                  key={filename}
                  onClick={() =>
                    setSelectedPokemon((prev) => prev.filter((p) => p.name !== filename))
                  }
                  className="flex items-center gap-4 group cursor-pointer hover:opacity-90"
                  title="Click to remove this Pokémon from the team"
                >
                  {/* Image Box with Hover X */}
                  <div className="relative w-22 h-22 rounded-lg border-4 border-purple-500 overflow-hidden bg-gradient-to-b from-orange-600 to-purple-600">
                    <Image
                      src={`/pokemon/${filename}.png`}
                      alt={displayName}
                      width={56}
                      height={56}
                      unoptimized
                      className="object-contain w-full h-full"
                    />
                    <div className="absolute top-0 right-0 p-1 bg-red-600 text-white text-xs font-bold rounded-bl-md opacity-0 group-hover:opacity-100 transition">
                      X
                    </div>
                  </div>

                  {/* Text Block */}
                  <div className="text-white font-bold leading-tight text-xl [text-shadow:_1px_1px_0_#000]">
                    <div>{displayName}</div>
                    <div className="text-lg">
                      Role: {role ?? "Unknown"} / {lane} Lane
                    </div>
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

        {/* Export & Reset Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleExport}
            disabled={selectedPokemon.length === 0}
            className={`${selectedPokemon.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
              } bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition`}
          >
            Export
          </button>
          <button
            onClick={() => setSelectedPokemon([])}
            disabled={selectedPokemon.length === 0}
            className={`${selectedPokemon.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
              } bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition`}
          >
            Reset
          </button>
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          team={renderedTeam}
        />
      </div>

      {/* Team Record BELOW the box */}
      <div className="mt-4 w-[450px] px-2 space-y-2 text-white text-sm">
        <h3 className="text-lg font-bold [text-shadow:_1px_1px_0_#000] mb-1">
          Team Record
        </h3>
        {renderedTeam.map(({ displayName, filename }) => {
          const match = pokemonData.find(
            (p) =>
              p.Name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
              displayName.toLowerCase().replace(/[^a-z0-9]/gi, "")
          );
          const wins = match?.Win ?? 0;
          const losses = match?.Loss ?? 0;

          return (
            <div
              key={filename}
              className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/20 pb-1 items-center"
            >
              <span className="font-semibold">{displayName}</span>
              <span className="text-green-400">Wins: {wins}</span>
              <span className="text-red-400 ml-4">Losses: {losses}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
