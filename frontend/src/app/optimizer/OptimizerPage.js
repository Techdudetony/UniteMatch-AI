"use client";

import { useEffect, useMemo } from "react";
import { useOptimizer } from "@/context/OptimizerContext";
import { fetchTeamOptimization } from "@/app/utils/api";
import { debounce } from "lodash";

import OptimizerControls from "./components/OptimizerControls";
import SelectedTeam from "./components/SelectedTeam";
import SynergyMeter from "./components/SynergyMeter";
import Suggestions from "./components/Suggestions";

export default function OptimizerPage() {
  const {
    selectedPokemon,
    setPredictedDifficulties,
    setIsLoading
  } = useOptimizer();

  const debouncedFetch = useMemo(() =>
    debounce(async (team) => {
      setIsLoading(true);
      try {
        const data = await fetchTeamOptimization(team);
        setPredictedDifficulties(data.optimized);
      } catch (error) {
        console.error("Fetch error:", error);
        setPredictedDifficulties([]); // Fallback to empty
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [], []);

  useEffect(() => {
    if (selectedPokemon.length > 0) {
      debouncedFetch(selectedPokemon);
    }

    return () => {
      debouncedFetch.cancel(); // Memory leak clean up
    };
  }, [selectedPokemon, debouncedFetch]);

  return (
    <div className="grid grid-cols-3 gap-8 px-8 py-10">
      {/* Left Column */}
      <div className="space-y-6">
        <OptimizerControls />
        <Suggestions />
      </div>

      {/* Center Column */}
      <div className="flex items-center justify-center">
        <SynergyMeter winRate={40} synergy="Balanced" message="" />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <SelectedTeam />
      </div>
    </div>
  );
}
