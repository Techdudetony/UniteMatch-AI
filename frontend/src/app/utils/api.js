const BASE_URL = "http://127.0.0.1:8000"

export async function fetchDataPreview() {
    const res = await fetch(`${BASE_URL}/data-preview`);
    return await res.json();
}

export async function fetchTeamOptimization(team) {
    const formattedTeam = team.map(name =>
        name
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    );

    const res = await fetch(`${BASE_URL}/optimize-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: formattedTeam }),
    });
    return await res.json();
}

export async function fetchTrainModel() {
    const res = await fetch(`${BASE_URL}/train-model`);
    return await res.json();
}