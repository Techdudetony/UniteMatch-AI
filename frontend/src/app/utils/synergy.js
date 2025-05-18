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
export function scoreCandidate(candidate, team, laneCounts, roleCounts) {
  let score = 0;

  const role = candidate.Role;
  const lane = candidate.PreferredLane;

  // 1. Fill missing lane
  if (lane && laneCounts[lane] === 0) score += 3;

  // 2. Fill underrepresented ideal lane
  const recommendedLane = getRecommendedLane(role);
  if (recommendedLane && laneCounts[recommendedLane] === 0) score += 2;

  // 3. Role coverage
  if (!roleCounts[role]) score += 2;
  else if (roleCounts[role] < 2) score += 1;

  // 4. Encourage adding a Supporter
  if (role === "Supporter") score += 2;

  // 5. Boosted Win Rate
  score += (candidate.FeedbackBoostedWinRate || 0) * 100;

  return score;
}
