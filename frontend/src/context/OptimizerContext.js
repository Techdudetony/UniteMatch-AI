"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { submitUserFeedback } from "@/app/utils/api";

const OptimizerContext = createContext();

export function OptimizerProvider({ children }) {
    const [selectedPokemon, setSelectedPokemon] = useState([]);
    const [stackSize, setStackSize] = useState("3 Stack");
    const [role, setRole] = useState("Attacker");
    const [lane, setLane] = useState("Jungle");
    const [predictedDifficulties, setPredictedDifficulties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pokemonData, setPokemonData] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/data-preview")
            .then(res => res.json())
            .then(setPokemonData)
            .catch(console.error);
    }, []);

    function submitFeedback(result) {
        if (selectedPokemon.length === 0) {
            return Promise.reject("No team selected");
        }

        const feedbackPayload = {
            team: selectedPokemon.map(p => typeof p === "string" ? p : p.name),
            result: result.toLowerCase(),
            timestamp: new Date().toISOString(),
        };

        return submitUserFeedback(feedbackPayload);
    }

    function getSynergySummary() {
        if (!pokemonData || selectedPokemon.length === 0) {
            return { winRate: 0, synergy: "Unknown", message: "", warning: "" };
        }

        const tierWeights = {
            "S": 1.4,
            "A+": 1.2,
            "A": 1.0,
            "B+": 0.8,
            "B": 0.6,
            "C": 0.4,
            "D": 0.2,
            "Unknown": 0.8,
        };

        const teamData = selectedPokemon.map(({ name }) => {
            const formatted = name
                .split("-")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");

            return pokemonData.find(p =>
                p.Name.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
                formatted.toLowerCase().replace(/[^a-z0-9]/gi, "")
            );
        });

        if (teamData.length === 0) {
            return { winRate: 0, synergy: "Unknown", message: "No data available", warning: "" };
        }

        const adjustedWinRates = teamData.map(p => {
            const baseWinRate = p.WinRate || 0;
            const tier = (p.Tier || "Unknown").toUpperCase();
            const multiplier = tierWeights[tier] || tierWeights["Unknown"];
            return baseWinRate * multiplier
        })
        const avgWinRate = adjustedWinRates.reduce((sum, val) => sum + val, 0) / adjustedWinRates.length;

        let synergy = "Balanced";
        let message = "";
        if (avgWinRate < 35) {
            synergy = "Fragile";
            message = "Your team might struggle to hold objectives.";
        } else if (avgWinRate > 60) {
            synergy = "Overcrowded";
            message = "Too many damage dealers — consider adding support.";
        }

        return {
            winRate: Math.round(avgWinRate),
            synergy,
            message,
            warning: ""
        };
    }

    return (
        <OptimizerContext.Provider
            value={{
                selectedPokemon, setSelectedPokemon,
                stackSize, setStackSize,
                role, setRole,
                lane, setLane,
                predictedDifficulties, setPredictedDifficulties,
                isLoading, setIsLoading,
                pokemonData,
                submitFeedback,
                getSynergySummary
            }}
        >
            {children}
        </OptimizerContext.Provider>
    );
}

export const useOptimizer = () => useContext(OptimizerContext)