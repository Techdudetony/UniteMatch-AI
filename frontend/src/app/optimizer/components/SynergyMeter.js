"use client";

import React from "react";

export default function SynergyMeter({ winRate = 0, synergy = "Balanced", message = "" }) {
  // Dynamic color feedback based on synergy level
  const getSynergyColor = (type) => {
    switch (type) {
      case "Overcrowded":
        return "bg-red-600 text-white";
      case "Fragile":
        return "bg-yellow-400 text-black";
      case "Balanced":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 text-center">
      {/* Win Rate Meter */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-[#f08922]"
            strokeDasharray={`${winRate}, 100`}
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-sm">Win Rate</span>
          <span className="text-3xl font-bold">{Math.round(winRate)}%</span>
        </div>
      </div>

      {/* Synergy Feedback */}
      <div className={`mt-4 px-6 py-2 rounded-lg font-bold text-xl ${getSynergyColor(synergy)}`}>
        {synergy}
      </div>

      {/* Sub-message */}
      {message && (
        <p className="text-sm mt-2 text-white max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}
