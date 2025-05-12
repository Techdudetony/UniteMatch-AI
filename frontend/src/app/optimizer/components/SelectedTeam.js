"use client";

import { useState } from "react";

export default function SelectedTeam() {
  const [team, setTeam] = useState([
    { name: "", role: "", lane: "" },
    { name: "", role: "", lane: "" },
    { name: "", role: "", lane: "" }
  ]);

  // Optional: Fill this from global state or props later
  const addToTeam = (index, data) => {
    const updated = [...team];
    updated[index] = data;
    setTeam(updated);
  };

  const resetSlot = (index) => {
    const updated = [...team];
    updated[index] = { name: "", role: "", lane: "" };
    setTeam(updated);
  };

  return (
    <div className="bg-gradient-to-b from-orange-400 to-purple-600 rounded-xl p-4 shadow-md min-w-[300px]">
      <h2 className="text-white text-xl font-bold mb-4 text-center">Selected Team</h2>
      
      {team.map((member, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center bg-white text-black p-3 rounded-md mb-3 shadow"
        >
          <div>
            <p className="font-semibold">{member.name || "Empty Slot"}</p>
            {member.name && (
              <p className="text-sm text-gray-600">{member.role} – {member.lane}</p>
            )}
          </div>
          {member.name && (
            <button
              onClick={() => resetSlot(idx)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
            >
              Reset
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
