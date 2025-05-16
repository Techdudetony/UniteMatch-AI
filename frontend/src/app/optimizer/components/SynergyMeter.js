"use client";

import React from "react";
import { useOptimizer } from "@/context/OptimizerContext";

export default function SynergyMeter() {
  const { synergy } = useOptimizer();
  const winRate = synergy?.winRate ?? 0;

  // Interpret synergy label
  let synergyLabel = "Unknown";
  let message = "";

  if (winRate < 35) {
    synergyLabel = "Fragile";
    message = "Your team might struggle to hold objectives.";
  } else if (winRate > 60) {
    synergyLabel = "Overcrowded";
    message = "Too many damage dealers — consider adding support.";
  } else {
    synergyLabel = "Balanced";
  }

  const getSynergyColor = (type) => {
    switch (type) {
      case "Overcrowded":
        return "bg-red-600 text-white";
      case "Fragile":
        return "bg-yellow-300 text-black border-4 border-black";
      case "Balanced":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Circular Win Rate Meter */}
      <div className="relative w-80 h-80">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            strokeDasharray={`${winRate}, 100`}
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f08922"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-4xl">Win Rate</span>
          <span className="text-6xl font-bold">{isNaN(winRate) ? "?" : `${winRate}%`}</span>
        </div>
      </div>

      {/* Synergy Tag */}
      <div className={`text-3xl font-bold px-8 py-2 rounded ${getSynergyColor(synergyLabel)}`}>
        {synergyLabel}
      </div>

      {/* Message */}
      {message && (
        <p className="italic text-sm text-white mt-2 max-w-[300px]">{message}</p>
      )}
    </div>
  );
}
