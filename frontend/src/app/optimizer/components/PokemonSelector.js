"use client";

import { useState } from "react";

export default function PokemonSelector() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLane, setSelectedLane] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const roles = ["Attacker", "Defender", "Speedster", "Support", "All-Rounder"];
  const lanes = ["Top", "Jungle", "Bottom"];

  // TODO: Dummy Pokémon data (replace with API later)
  const allPokemon = [
    "Pikachu", "Charizard", "Blastoise", "Garchomp", "Snorlax", "Greninja", "Lucario", "Decidueye", "Zeraora"
  ];

  const filteredPokemon = allPokemon.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-orange-400 to-purple-600 rounded-xl p-4 shadow-md">
      {/* Role Dropdown */}
      <label className="block font-bold text-white mb-1">Pokemon Role</label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="w-full px-3 py-2 mb-4 rounded-md bg-white text-black"
      >
        <option value="">Select Role</option>
        {roles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      {/* Lane Dropdown */}
      <label className="block font-bold text-white mb-1">Lane</label>
      <select
        value={selectedLane}
        onChange={(e) => setSelectedLane(e.target.value)}
        className="w-full px-3 py-2 mb-4 rounded-md bg-white text-black"
      >
        <option value="">Select Lane</option>
        {lanes.map(lane => (
          <option key={lane} value={lane}>{lane}</option>
        ))}
      </select>

      {/* Stack Radio Buttons */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <label className="text-white font-semibold">
          <input type="radio" name="stack" value="5" className="mr-1" /> 5 Stack
        </label>
        <label className="text-white font-semibold">
          <input type="radio" name="stack" value="3" className="mr-1" defaultChecked /> 3 Stack
        </label>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search Pokémon"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white text-black"
        />
        <span className="absolute right-3 top-2 text-black">🔍</span>
      </div>

      {/* Pokémon Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filteredPokemon.map((name) => (
          <div
            key={name}
            className="bg-white text-black text-center p-2 rounded-md font-semibold cursor-pointer hover:bg-orange-200 transition"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
