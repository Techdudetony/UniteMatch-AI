export const roleToLane = {
  Attacker: "Top",
  Defender: "Top",
  "All-Rounder": "Bottom",
  Supporter: "Bottom",
  Speedster: "Jungle",
};

// Optional: priority fallback if you're expanding logic later
export const lanePriority = ["Jungle", "Bottom", "Top"];

/**
 * Given a Pokémon role, return its ideal recommended lane.
 */
export function getRecommendedLane(role) {
  return roleToLane[role] || "Jungle";
}

/**
 * Scores a candidate Pokémon based on how well it fills missing team synergy gaps.
 */
export function scoreCandidate(candidate, team, laneCounts, roleCounts, stackSize) {
  let score = 0;

  const role = candidate.Role;
  const lane = candidate.PreferredLane;
  const winRate = candidate.FeedbackBoostedWinRate ?? 0;
  const recommendedLane = roleToLane[role];
  const is5Stack = stackSize === "5 Stack";

  // 1. Fill missing lane
  if (!laneCounts[lane]) score += 4;
  else if (laneCounts[lane] < 2) score += 2;

  // Bonus for filling the recommended lane even if not chosen yet
  if (!laneCounts[recommendedLane]) score += 1;

  // 2. Fill missing role
  if (!roleCounts[role]) score += 4;
  else if (roleCounts[role] < 2) score += 2;

  // 3. Strategic Role Preference
  if (role === "Supporter") score += is5Stack ? 2 : 1;
  if (role === "Speedster") score += !is5Stack ? 2 : 1;
  if (role === "Defender") score += 1;

  // 4. Balanced Comp Boost (not overstacked)
  const offenseRoles = ["Attacker", "All-Rounder"];
  const defenseRoles = ["Defender", "Supporter"];
  const offenseCount = offenseRoles.reduce((sum, r) => sum + (roleCounts[r] || 0), 0);
  const defenseCount = defenseRoles.reduce((sum, r) => sum + (roleCounts[r] || 0), 0);
  if (offenseCount > defenseCount && defenseRoles.includes(role)) score += 1;
  if (defenseCount > offenseCount && offenseRoles.includes(role)) score += 1;

  // 5. Overcrowding Penalty
  if (laneCounts[lane] >= 2) score -= 2;
  if (roleCounts[role] >= 3) score -= 3;

  // 6. Win Rate Bonus (capped at 10 pts)
  score += Math.min(winRate * 100, 10);

  return score;
}


