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

  // 1. Lane Diversity Bonus
  if (!laneCounts[lane]) score += 3;
  else if (laneCounts[lane] < 2) score += 1;
  if (!laneCounts[recommendedLane]) score += 1;

  // 2. Role Diversity Bonus
  if (!roleCounts[role]) score += 2;
  else if (roleCounts[role] < 2) score += 1;

  // 3. Strategic Role Priority
  if (role === "Supporter") score += 2;
  if (role === "Defender") score += 1;

  // 4. Stack Synergy
  if (!is5Stack && role === "Speedster") score += 1; // for quick jungle control
  if (is5Stack && role === "Supporter") score += 1; // team scaling

  // 5. Overcrowding Penalty
  if (laneCounts[lane] >= 2) score -= 2;
  if (roleCounts[role] >= 3) score -= 3;

  // 6. Win Rate Bonus
  score += winRate * 100;

  return score;
}

