// src/app/optimizer/page.js

import OptimizerControls from "./components/OptimizerControls";
import PokemonSelector from "./components/PokemonSelector";
import SelectedTeam from "./components/SelectedTeam";
import Suggestions from "./components/Suggestions";
import SynergyMeter from "./components/SynergyMeter";

export default function OptimizerPage() {
  return (
    <main className="min-h-screen bg-[#480ad8] text-white font-spartan px-10 py-6">
      {/* Top Header */}
      <h1 className="text-4xl font-bold text-center mb-8">
        Team Optimizer
      </h1>

      {/* Main Layout */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <OptimizerControls />
          <PokemonSelector />
        </div>

        {/* Center Column */}
        <div className="space-y-6 items-center text-center">
          <SynergyMeter />
          <Suggestions />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SelectedTeam />
        </div>
      </div>
    </main>
  );
}
