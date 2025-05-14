"use client";

import { createContext, useContext, useState } from "react";

const OptimizerContext = createContext();

export function OptimizerProvider({ children }) {
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const [stackSize, setStackSize] = useState("3 Stack");
  const [role, setRole] = useState("Attacker");
  const [lane, setLane] = useState("Jungle");
  const [predictedDifficulties, setPredictedDifficulties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <OptimizerContext.Provider
      value={{
        selectedPokemon, setSelectedPokemon,
        stackSize, setStackSize,
        role, setRole,
        lane, setLane,
        predictedDifficulties, setPredictedDifficulties,
        isLoading, setIsLoading
      }}
    >
      {children}
    </OptimizerContext.Provider>
  );
}

export const useOptimizer = () => useContext(OptimizerContext)