"use client";

import { useState, useRef, useEffect } from "react";
import { useOptimizer } from "@/context/OptimizerContext";

const roles = ["Attacker", "Defender", "Speedster", "Support", "All-Rounder"];
const lanes = ["Top", "Jungle", "Bottom"];
const roleColors = {
  Attacker: ["#FF6B6B", "#FFD93D"],
  Defender: ["#4D96FF", "#1B9AAA"],
  Support: ["#9C89B8", "#F0A6CA"],
  Speedster: ["#56C596", "#7FFFD4"],
  "All-Rounder": ["#9F5BFF", "#A43CC6"],
};

export default function OptimizerControls() {
  const {
    selectedPokemon, setSelectedPokemon,
    stackSize, setStackSize,
    role, setRole,
    lane, setLane,
    pokemonData
  } = useOptimizer();

  // Reset scroll when role changes
  const gridRef = useRef(null)

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  }, [role]);

  const allPokemon = pokemonData
    .map((p) => p.Name?.toLowerCase().replace(/ /g, "-"))
    .filter(Boolean);

  const [search, setSearch] = useState("");
  const limit = stackSize === "3 Stack" ? 3 : 5;

  const [showLaneModal, setShowLaneModal] = useState(false);

  // Search ignores role filter, shows from all Pokémon
  const searchFiltered = allPokemon.filter(name =>
    name.includes(search.toLowerCase())
  );

  // Role filter applies only when NOT searching
  const pokemonList = search
    ? searchFiltered
    : pokemonData
      .filter((p) => p.Role === role)
      .map((p) => p.Name?.toLowerCase().replace(/ /g, "-"))
      .filter(Boolean);

  const isSelectionValid = role && lane;

  const toggleSelect = (name) => {
    const isSelected = selectedPokemon.some(p => p.name === name);

    if (!isSelectionValid) return; // Block until both selected

    const matchedData = pokemonData.find(
      (p) => p.Name?.toLowerCase().replace(/ /g, "-") === name
    );

    if (isSelected) {
      setSelectedPokemon(selectedPokemon.filter(p => p.name !== name));
    } else if (selectedPokemon.length < limit && matchedData) {
      setSelectedPokemon([
        ...selectedPokemon,
        { name, lane, role: matchedData.Role }
      ]);
    }
  };

  return (
    <div className="rounded-2xl border-4 border-black p-8 bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 shadow-xl w-[500px]">
      {/* Role */}
      <div className="flex items-center gap-1 mb-1">
        <label className="text-white font-bold [text-shadow:_1px_1px_0_#000]">Pokemon Role</label>
        <div className="relative group">
          <span className="text-black cursor-pointer text-md font-bold bg-white bg-opacity-40 ml-2 px-2 rounded-full leading-none">?</span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-lg">
            Select a Pokémon role to filter which Pokémon appear below.
          </div>
        </div>
      </div>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full mb-4 p-2 rounded-lg border bg-white focus:outline-none text-black"
      >
        <option disabled value="">Select Role</option>
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Lane */}
      <div className="flex items-center gap-1 mb-1">
        <label className="text-white font-bold [text-shadow:_1px_1px_0_#000]">Lane</label>
        <div className="relative group">
          <button onClick={() => setShowLaneModal(true)} className="text-black cursor-pointer text-md font-bold bg-white bg-opacity-40 ml-2 py-1 px-2 rounded-full leading-none">
            ?
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-lg">
            Choose your preferred lane for this Pokémon.
            Click for more info.
          </div>
        </div>
      </div>
      <select
        value={lane}
        onChange={(e) => setLane(e.target.value)}
        className="w-full mb-4 p-2 rounded-lg border bg-white focus:outline-none text-black"
      >
        <option disabled value="">Select Lane</option>
        {lanes.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {/* Stack Toggle */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-white [text-shadow:_1px_1px_0_#000] font-bold">5 Stack</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={stackSize === "3 Stack"}
            onChange={() =>
              setStackSize(stackSize === "3 Stack" ? "5 Stack" : "3 Stack")
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-purple-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-purple-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
        <span className="text-white [text-shadow:_1px_1px_0_#000] font-bold">3 Stack</span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search Pokémon"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-3 rounded border text-black font-bold bg-white focus:outline-none"
        />
        <span className="absolute right-3 top-2.5 text-black">🔍</span>
      </div>

      {/* Pokémon Grid */}
      {isSelectionValid ? (
        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {pokemonList.map((name) => {
            const isSelected = selectedPokemon.some(p => p.name === name);
            const matchedData = pokemonData.find(
              (p) => p.Name?.toLowerCase().replace(/ /g, "-") === name
            );
            const role = matchedData?.Role;
            const [color1, color2] = roleColors[role];

            return (
              <div
                key={name}
                onClick={() => toggleSelect(name)}
                style={{
                  background: `linear-gradient(135deg, ${color1}, ${color2})`,
                }}
                className={`
                rounded-lg border-4 overflow-hidden cursor-pointer transition-transform duration-200
                ${isSelected ? "border-purple-500 scale-105" : "border-black"}
                hover:border-orange-400 hover:scale-105
              `}
              >
                <img
                  src={`/pokemon/${name}.png`}
                  alt={name}
                  className="object-contain w-full h-[80px] p-1 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-white text-sm italic text-center mt-4">
          Please select a role and lane to continue.
        </p>
      )}

      {showLaneModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full relative">
            <button
              onClick={() => setShowLaneModal(false)}
              className="absolute cursor-pointer top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2 text-center text-purple-700">What is a Lane?</h2>
            <p className="text-sm text-gray-700 mb-4 text-center">
              Lanes refer to the paths your Pokémon take in battle. Here&apos;s how they work on the map:
            </p>
            <img src="/map.png" alt="Unite Map Lanes" className="rounded shadow-md mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
