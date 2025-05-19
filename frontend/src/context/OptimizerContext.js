"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { submitUserFeedback, fetchSynergyWinrate } from "@/app/utils/api";

const OptimizerContext = createContext();

export function OptimizerProvider({ children }) {
    const [selectedPokemon, setSelectedPokemon] = useState([]);
    const [stackSize, setStackSize] = useState("3 Stack");
    const [role, setRole] = useState("");
    const [lane, setLane] = useState("");
    const [predictedDifficulties, setPredictedDifficulties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pokemonData, setPokemonData] = useState([]);
    const [synergy, setSynergy] = useState({ winRate: 0, individualRates: [] });

    // Fetch metadata
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data-preview`)
            .then(res => res.json())
            .then(setPokemonData)
            .catch(console.error);
    }, []);

    console.log("Backend URL: ", process.env.NEXT_PUBLIC_BACKEND_URL);

    function refreshPokemonData() {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data-preview`)
            .then(res => res.json())
            .then(setPokemonData)
            .catch(console.error);
    }

    async function submitFeedback(result) {
        if (selectedPokemon.length === 0) {
            return Promise.reject("No team selected");
        }

        const feedbackPayload = {
            team: selectedPokemon.map(p => typeof p === "string" ? p : p.name),
            result: result.toLowerCase(),
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await submitUserFeedback(feedbackPayload);
            await refetchPokemonData(); // <- Important to refresh the feedback aggregation
            return response;
        } catch (err) {
            console.error("Error submitting feedback:", err);
            throw err;
        }
    }

    const refetchPokemonData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data-preview`);
            const updatedData = await res.json();
            setPokemonData(updatedData);
        } catch (err) {
            console.error("Error fetching updated data:", err);
        }
    }

    function getSynergySummary() {
        if (!pokemonData || selectedPokemon.length === 0) {
            return { winRate: 0, synergy: "Unknown", message: "", warning: "" };
        }

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

        if (teamData.some(p => !p)) {
            return { winRate: 0, synergy: "Unknown", message: "Missing Pokémon data", warning: "" };
        }

        // Use FeedbackBoostedWinRate if available, fallback to Adjusted/Raw WinRate
        const adjustedWinRates = teamData.map(p =>
            p.FeedbackBoostedWinRate ?? p.AdjustedWinRate ?? (p.WinRate / 100) ?? 0
        );

        const avgWinRate = adjustedWinRates.reduce((sum, val) => sum + val, 0) / adjustedWinRates.length;

        let synergy = "Balanced";
        let message = "";

        if (avgWinRate < 0.35) {
            synergy = "Fragile";
            message = "Your team might struggle to hold objectives.";
        } else if (avgWinRate > 0.6) {
            synergy = "Overcrowded";
            message = "Too many damage dealers — consider adding support.";
        }

        return {
            winRate: Math.round(avgWinRate * 10000) / 100, // 0.528 → 52.8%
            synergy,
            message,
            warning: ""
        };
    }

    // Auto-fetch synergy prediction when team changes
    useEffect(() => {
        if (selectedPokemon.length === 0) {
            setSynergy({ winRate: 0, individualRates: [] });
            return;
        }

        const fetchSynergy = async () => {
            try {
                const result = await fetchSynergyWinrate(selectedPokemon);
                setSynergy({
                    winRate: result.estimated_win_rate,
                    individualRates: result.individual_rates
                });
            } catch (err) {
                console.error("Failed to fetch synergy:", err);
                setSynergy({ winRate: 0, individualRates: [] });
            }
        };

        fetchSynergy();
    }, [selectedPokemon]);

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
                refreshPokemonData,
                submitFeedback,
                getSynergySummary,
                synergy,
            }}
        >
            {children}
        </OptimizerContext.Provider>
    );
}

export const useOptimizer = () => useContext(OptimizerContext)