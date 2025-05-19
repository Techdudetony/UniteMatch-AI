import pandas as pd
import os
from app.db import SessionLocal
from app.data.feedback_model import Feedback

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(DIRECTORY, "PokemonUniteData.csv")
META_FILE = os.path.join(DIRECTORY, "uniteapi_metadata.csv")

def normalize_name(name):
    # Converts "alolan-raichu" or "Alolan Raichu" to "Alolan Raichu"
    return ' '.join(word.capitalize() for word in name.replace("-", " ").split())

# Feedback Data Aggregate (PostgreSQL version)
def get_feedback_aggregates():
    db = SessionLocal()
    try:
        feedback_entries = db.query(Feedback).all()
        if not feedback_entries:
            return None

        feedback_df = pd.DataFrame([
            {"Name": normalize_name(fb.name), "Result": fb.result}
            for fb in feedback_entries
        ])

        feedback_agg = (
            feedback_df.pivot_table(index="Name", columns="Result", aggfunc="size", fill_value=0)
            .reset_index()
            .rename(columns={"win": "Win", "loss": "Loss"})
        )

        feedback_agg["Win"] = feedback_agg.get("Win", 0)
        feedback_agg["Loss"] = feedback_agg.get("Loss", 0)

        # Raw feedback win rate
        feedback_agg["AdjustedWinRate"] = (
            feedback_agg["Win"] / (feedback_agg["Win"] + feedback_agg["Loss"])
        ).fillna(0).round(4)

        return feedback_agg
    finally:
        db.close()

def load_data():
    """Loads and returns cleaned, merged Pokémon Unite data with blended feedback boost logic."""

    # Load CSVs
    base_df = pd.read_csv(FILE)
    meta_df = pd.read_csv(META_FILE)

    # Normalize WinRate from % to decimal
    meta_df["WinRate"] = meta_df["WinRate"] / 100.0

    # Normalize names
    base_df["Name"] = base_df["Name"].apply(normalize_name)
    meta_df["Name"] = meta_df["Name"].apply(normalize_name)

    # Drop redundant columns before merge
    base_df_cleaned = base_df.drop(columns=["UsageDifficulty", "Role", "Ranged_or_Melee"], errors="ignore")

    # Merge base + metadata
    merged_df = meta_df.merge(base_df_cleaned, on="Name", how="left")

    # Pull aggregated feedback
    feedback_agg = get_feedback_aggregates()

    if feedback_agg is not None:
        # Inject raw WinRate for blending
        feedback_agg = feedback_agg.merge(meta_df[["Name", "WinRate"]], on="Name", how="left")

        # BlendedWinRate: 70% API data, 30% player feedback
        feedback_agg["BlendedWinRate"] = (
            0.7 * feedback_agg["WinRate"] +
            0.3 * feedback_agg["AdjustedWinRate"]
        ).round(4)

        # Merge into main data
        merged_df = pd.merge(merged_df, feedback_agg, on="Name", how="left")

        # Use blended rate when possible, else fall back to raw WinRate
        merged_df["AdjustedWinRate"] = merged_df["BlendedWinRate"].fillna(merged_df["WinRate"])

        merged_df["Win"] = merged_df["Win"].fillna(0).astype(int)
        merged_df["Loss"] = merged_df["Loss"].fillna(0).astype(int)
    else:
        merged_df["AdjustedWinRate"] = merged_df["WinRate"]
        merged_df["Win"] = 0
        merged_df["Loss"] = 0

    # Clean out any unused fields
    merged_df.drop(columns=["Description"], inplace=True, errors="ignore")

    # Log unmatched Pokémon for debug
    unmatched = meta_df[~meta_df["Name"].isin(merged_df["Name"])]
    if not unmatched.empty:
        print("\n Unmatched Pokémon (from UniteAPI not found in base_df):")
        print(unmatched["Name"].unique())

    # Fill stats with averages
    average_columns = ["Offense", "Endurance", "Mobility", "Scoring", "Support"]
    for col in average_columns:
        merged_df[col] = merged_df[col].fillna(merged_df[col].mean()).round(1)

    # Feature engineering
    merged_df["Mobility_Offense"] = (merged_df["Mobility"] * merged_df["Offense"]).round(2)
    merged_df["Mobility_Endurance"] = (merged_df["Mobility"] * merged_df["Endurance"]).round(2)
    merged_df["Support_Scoring"] = (merged_df["Support"] * merged_df["Scoring"]).round(2)
    merged_df["MetaImpactScore"] = (merged_df["AdjustedWinRate"] * merged_df["UsageRate"]).round(2)

    # Difficulty mapping
    merged_df["AvgDifficulty"] = merged_df["UsageDifficulty"].map({
        "Novice": 1, "Intermediate": 2, "Expert": 3
    })

    # One-hot encode roles & lanes
    role_counts = pd.get_dummies(merged_df["Role"], prefix="Role")
    merged_df = pd.concat([merged_df, role_counts], axis=1)

    if "PreferredLane" not in merged_df.columns:
        merged_df["PreferredLane"] = "Unknown"
    lane_counts = pd.get_dummies(merged_df["PreferredLane"], prefix="Lane")
    merged_df = pd.concat([merged_df, lane_counts], axis=1)

    # FeedbackBoostedWinRate — Apply net win/loss impact (max ±30%)
    feedback_net = (merged_df["Win"] - merged_df["Loss"]).fillna(0).clip(-30, 30)
    merged_df["FeedbackBoostedWinRate"] = (
        merged_df["AdjustedWinRate"] + (feedback_net * 0.01)
    ).clip(0, 1)

    # Sort alphabetically
    merged_df.sort_values("Name", inplace=True)

    # Build final model input
    numeric_df = merged_df.select_dtypes(include=['float64', 'int64'])
    categorical_cols = ['Tier', 'Role', 'Style', 'AttackStyle']
    encoded_df = pd.get_dummies(merged_df[categorical_cols], prefix=categorical_cols)

    final_df = pd.concat([numeric_df, encoded_df], axis=1)

    return final_df, merged_df
