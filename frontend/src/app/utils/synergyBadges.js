export function getSynergyBadges(team) {
    const badges = [];

    if (!team || team.length === 0) return badges;

    const laneCount = {};
    const roleCount = {};

    team.forEach(p => {
        if (p.lane) laneCount[p.lane] = (laneCount[p.lane] || 0) + 1;
        if (p.role) roleCount[p.role] = (roleCount[p.role] || 0) + 1;
    });

    const uniqueLanes = Object.keys(laneCount);
    const uniqueRoles = Object.keys(roleCount);
    const total = team.length;

    // Lane Coverage
    if (uniqueLanes.length === 1) {
        badges.push({ label: "One-Lane Focus", color: "bg-orange-500" });
    } else if (uniqueLanes.length === 3) {
        badges.push({ label: "Perfect Lane Coverage", color: "bg-green-500" });
    }

    // Role Diversity
    if (uniqueRoles.length >= 4) {
        badges.push({ label: "Role Diversity", color: "bg-purple-500" });
    } else if (Object.values(roleCount).some(count => count >= 3)) {
        badges.push({ label: "Stacked Role", color: "bg-red-600" });
    }

    // Balanced Core
    if (["Attacker", "Defender", "Supporter"].every(r => roleCount[r])) {
        badges.push({ label: "Balanced Core", color: "bg-yellow-500" });
    }

    // Meta Core
    const metaCore = team.some(p => p.role === "Speedster" && p.lane === "Jungle") &&
        team.some(p => p.role === "Defender" && p.lane === "Top") &&
        team.some(p => p.role === "Supporter" && p.lane === "Bottom");
    if (metaCore) {
        badges.push({ label: "Meta Core", color: "bg-cyan-500" });
    }

    // Missing Role Types
    const allRoles = ["Support", "Defender", "Attacker", "Speedster"];
    allRoles.forEach(role => {
        if (!roleCount[role]) {
            badges.push({ label: `No ${role}`, color: "bg-pink-600" });
        }
    });

    // Lane Conflict
    if (laneCount["Jungle"] >= 2) {
        badges.push({ label: "Lane Conflict", color: "bg-amber-700" });
    }

    // Overcrowded Lane (Top/Bottom)
    if (laneCount["Top"] >= 3 || laneCount["Bottom"] >= 3) {
        badges.push({ label: "Overstacked Lane", color: "bg-amber-800" });
    }

    // Composition Bias
    const offenseCount = (roleCount["Attacker"] || 0) + (roleCount["All-Rounder"] || 0);
    const defenseCount = (roleCount["Defender"] || 0) + (roleCount["Supporter"] || 0);
    if (offenseCount >= total / 2) {
        badges.push({ label: "High Offense", color: "bg-red-500" });
    }
    if (defenseCount >= total / 2) {
        badges.push({ label: "High Defense", color: "bg-blue-500" });
    }

    // Low Mobility
    if (!team.some(p => ["Speedster", "All-Rounder"].includes(p.role))) {
        badges.push({ label: "Low Mobility", color: "bg-gray-600" });
    }

    // No Offense
    if ((roleCount["Attacker"] || 0) === 0 && (roleCount["All-Rounder"] || 0) === 0) {
        badges.push({ label: "No Offense", color: "bg-pink-700" });
    }

    // No Defense
    if ((roleCount["Defender"] || 0) === 0 && (roleCount["Supporter"] || 0) === 0) {
        badges.push({ label: "No Defense", color: "bg-pink-700" });
    }

    // Double Support / Double Jungle
    if ((roleCount["Supporter"] || 0) >= 2) {
        badges.push({ label: "Double Support", color: "bg-fuchsia-600" });
    }
    if (laneCount["Jungle"] >= 2) {
        badges.push({ label: "Double Jungle", color: "bg-orange-700" });
    }

    return badges;
}
