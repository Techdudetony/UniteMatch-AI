"use client";

import { useState } from "react";
import OptimizerControls from "./components/OptimizerControls";
import SelectedTeam from "./components/SelectedTeam";
import SynergyMeter from "./components/SynergyMeter";
import Suggestions from "./components/Suggestions";

export default function OptimizerPage() {
  const [stackSize, setStackSize] = useState("3 Stack");
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const [role, setRole] = useState("Attacker");
  const [lane, setLane] = useState("Jungle");

  return (
    <div className="grid grid-cols-3 gap-8 px-8 py-10">
      {/* Left Column */}
      <div className="space-y-6">
        <OptimizerControls
          stackSize={stackSize}
          setStackSize={setStackSize}
          selectedPokemon={selectedPokemon}
          setSelectedPokemon={setSelectedPokemon}
          role={role}
          setRole={setRole}
          lane={lane}
          setLane={setLane}
        />
        <Suggestions suggestedPokemon={[]} />
      </div>

      {/* Center Column */}
      <div className="flex items-center justify-center">
        <SynergyMeter
          winRate={40}
          synergy="Balanced"
          message=""
        />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <SelectedTeam
          stackSize={stackSize}
          selectedPokemon={selectedPokemon}
          lane={lane}
        />
      </div>
    </div>
  );

}
