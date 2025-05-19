"use client";

import React from "react";
import { useOptimizer } from "@/context/OptimizerContext";
import { getSynergyBadges } from "../../utils/synergyBadges";

export default function SynergyMeter() {
  const { synergy, selectedPokemon } = useOptimizer();
  const winRate = synergy?.winRate ?? 0;

  const badges = getSynergyBadges(selectedPokemon);

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
          <span className="text-6xl font-bold">{isNaN(winRate) ? "?" : `${Math.min(winRate, 100).toFixed(2)}%`}</span> {/* Fix winRate to MAXIMUM 100% */}
        </div>
      </div>

      {/* Synergy Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {badges.map((badge, i) => (
            <span
              key={i}
              className={`text-white font-bold text-sm px-3 py-1 rounded-full ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Suggestion Comment */}
      {badges.length > 0 && (
        <div className="mt-2 text-md italic text-white max-w-[340px]">
          {generateBadgeMessage(badges)}
        </div>
      )}
    </div>
  );
}

// Dynamic suggestion comment based on badge presence
function generateBadgeMessage(badges) {
  const labels = badges.map(b => b.label);

  if (labels.includes("Lane Conflict")) return "Too many Pokémon may be contesting Jungle.";
  if (labels.includes("No Support")) return "You might want to add a Supporter for healing or backup.";
  if (labels.includes("No Defender")) return "Consider adding a tanky Defender to hold objectives.";
  if (labels.includes("Stacked Role")) return "Try diversifying your team roles for better synergy.";
  if (labels.includes("Perfect Lane Coverage")) return "Your team has great lane spread!";
  if (labels.includes("Balanced Core")) return "You've got strong foundation across all fronts.";
  if (labels.includes("Low Mobility")) return "Watch out for slow team rotation—consider faster roles.";

  return "Team synergy looks solid—optimize further based on strategy.";
}
