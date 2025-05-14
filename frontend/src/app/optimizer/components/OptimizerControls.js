"use client";

import { useState } from "react";
import { useOptimizer } from "@/context/OptimizerContext";
import { fetchTeamOptimization } from "@/app/utils/api";

const roles = ["Attacker", "Defender", "Speedster", "Support", "All-Rounder"];
const lanes = ["Top", "Jungle", "Bottom"];
const pokemonList = [
  "pikachu", "charizard", "armarouge", "ceruledge", "darkrai", "inteleon",
  "blastoise", "lapras", "falinks", "alolan-raichu", "galarian-rapidash",
  "alolan-ninetales", "blissey", "comfey", "ho-oh", "zeraora", "zoroark",
  "lucario"
];

export default function OptimizerControls() {
  const {
    selectedPokemon, setSelectedPokemon,
    stackSize, setStackSize,
    role, setRole,
    lane, setLane,
  } = useOptimizer();

  const [search, setSearch] = useState("");
  const limit = stackSize === "3 Stack" ? 3 : 5;

  const filteredPokemon = pokemonList.filter(p =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => {
    const isSelected = selectedPokemon.includes(name);
    if (isSelected) {
      setSelectedPokemon(selectedPokemon.filter(p => p !== name));
    } else if (selectedPokemon.length < limit) {
      setSelectedPokemon([...selectedPokemon, name]);
    }
  };

  return (
    <div className="rounded-2xl border-4 border-black p-8 bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 shadow-xl w-[420px]">
      {/* Role */}
      <label className="block text-white font-bold [text-shadow:_1px_1px_0_#000] mb-1">Pokemon Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full mb-4 p-2 rounded-lg border bg-white focus:outline-none text-black"
      >
        {roles.map((r) => <option key={r}>{r}</option>)}
      </select>

      {/* Lane */}
      <label className="block text-white font-bold [text-shadow:_1px_1px_0_#000] mb-1">Lane</label>
      <select
        value={lane}
        onChange={(e) => setLane(e.target.value)}
        className="w-full mb-4 p-2 rounded-lg border bg-white focus:outline-none text-black"
      >
        {lanes.map((l) => <option key={l}>{l}</option>)}
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
      <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredPokemon.map((name) => {
          const isSelected = selectedPokemon.includes(name);
          return (
            <div
              key={name}
              onClick={() => toggleSelect(name)}
              className={`
                rounded-lg border-4 overflow-hidden cursor-pointer transition-transform duration-200
                ${isSelected ? "border-purple-500 scale-105" : "border-black"}
                hover:border-orange-400 hover:scale-105
              `}
            >
              <img
                src={`/pokemon/${name}.png`}
                alt={name}
                className="object-cover w-full h-[80px] p-1"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
