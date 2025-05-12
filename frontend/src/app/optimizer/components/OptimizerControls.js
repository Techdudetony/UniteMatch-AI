"use client";

import { useState } from "react";

export default function OptimizerControls() {
  const [teamInput, setTeamInput] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (index, value) => {
    const updated = [...teamInput];
    updated[index] = value;
    setTeamInput(updated);
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/optimize-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_list: teamInput })
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.optimized);
      } else {
        setError(data.detail || "Optimization failed.");
      }
    } catch (err) {
      setError("Error connecting to server.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-b from-purple-600 to-black p-6 rounded-xl shadow-md">
      <h2 className="text-white text-xl font-bold mb-4">Enter Team (3 Pokémon)</h2>

      {/* Input Fields */}
      <div className="space-y-3 mb-4">
        {teamInput.map((name, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Pokémon ${i + 1}`}
            value={name}
            onChange={(e) => handleInputChange(i, e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white text-black"
          />
        ))}
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={loading}
        className="bg-[#f08922] text-black px-6 py-2 rounded-md font-bold hover:bg-orange-500 transition w-full"
      >
        {loading ? "Optimizing..." : "Optimize Team"}
      </button>

      {/* Error or Result */}
      {error && <p className="text-red-300 mt-3 text-sm">{error}</p>}

      {result && (
        <div className="mt-4">
          <h3 className="text-white font-semibold mb-2">Predicted Difficulties:</h3>
          <ul className="text-white text-sm space-y-1">
            {result.map((poke, i) => (
              <li key={i}>
                <span className="font-bold">{poke.name}:</span> {poke.predicted_difficulty}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
