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

from app.db import SessionLocal
from app.data.feedback_model import Feedback

# Feedback Data Aggregate (PostgreSQL version)
def get_feedback_aggregates():
    db = SessionLocal()
    try:
        # Query all feedback entries
        feedback_entries = db.query(Feedback).all()

        # Convert to DataFrame
        if not feedback_entries:
            return None

        import pandas as pd
        feedback_df = pd.DataFrame([
            {"Name": fb.name.title(), "Result": fb.result}
            for fb in feedback_entries
        ])

        # Pivot to aggregate win/loss
        feedback_agg = (
            feedback_df.pivot_table(index="Name", columns="Result", aggfunc="size", fill_value=0)
            .reset_index()
            .rename(columns={"win": "Win", "loss": "Loss"})
        )

        # Calculate Adjusted Win Rate (safe fallback if Win or Loss doesn't exist)
        feedback_agg["Win"] = feedback_agg.get("Win", 0)
        feedback_agg["Loss"] = feedback_agg.get("Loss", 0)

        feedback_agg["AdjustedWinRate"] = (
            feedback_agg["Win"] / (feedback_agg["Win"] + feedback_agg["Loss"])
        ).fillna(0).round(2)

        return feedback_agg
    finally:
        db.close()

def load_data():
    """Loads and returns cleaned, merged Pokémon Unite data"""
    
    # Load main and meta data
    base_df = pd.read_csv(FILE)
    meta_df = pd.read_csv(META_FILE)

    # Normalize names for matching
    base_df["Name"] = base_df["Name"].apply(normalize_name)
    meta_df["Name"] = meta_df["Name"].apply(normalize_name)

    # Drop columns that already exist in meta_df or aren't needed
    base_df_cleaned = base_df.drop(columns=["UsageDifficulty", "Role", "Ranged_or_Melee"], errors="ignore")

    # Merge on normalized names
    merged_df = meta_df.merge(base_df_cleaned, on="Name", how="left")
    
    # Feedback Data Aggregate
    feedback_agg = get_feedback_aggregates()

    if feedback_agg is not None:
        merged_df = pd.merge(merged_df, feedback_agg, on="Name", how="left")
        merged_df["AdjustedWinRate"] = merged_df["AdjustedWinRate"].fillna(merged_df["WinRate"])
        merged_df["Win"] = merged_df["Win"].fillna(0).astype(int)
        merged_df["Loss"] = merged_df["Loss"].fillna(0).astype(int)
    else:
        merged_df["AdjustedWinRate"] = merged_df["WinRate"]
        merged_df["Win"] = 0
        merged_df["Loss"] = 0
    
    # Drop unnecessary description column
    merged_df.drop(columns=["Description"], inplace=True)

    # Debugging: log unmatched entries
    unmatched = meta_df[~meta_df["Name"].isin(merged_df["Name"])]
    if not unmatched.empty:
        print("\n Unmatched Pokémon (from UniteAPI not found in base_df):") 
        print(unmatched["Name"].unique())

    # Fill missing metadata columns with Average
    average_columns = ["Offense", "Endurance", "Mobility", "Scoring", "Support"]
    
    # Fill missing Win / Loss with 0
    merged_df["Win"] = merged_df["Win"].fillna(0).astype(int)
    merged_df["Loss"] = merged_df["Loss"].fillna(0).astype(int)
    
    for col in average_columns:
        merged_df[col] = merged_df[col].fillna(merged_df[col].mean()).round(1)

    # Feature engineering
    merged_df["Mobility_Offense"] = (merged_df["Mobility"] * merged_df["Offense"]).round(2)
    merged_df["Mobility_Endurance"] = (merged_df["Mobility"] * merged_df["Endurance"]).round(2)
    merged_df["Support_Scoring"] = (merged_df["Support"] * merged_df["Scoring"]).round(2)
    merged_df["MetaImpactScore"] = (merged_df["AdjustedWinRate"] * merged_df["UsageRate"]).round(2)
    
        # Extended Feature Engineering
    merged_df["AvgDifficulty"] = merged_df["UsageDifficulty"].map({
        "Novice": 1, "Intermediate": 2, "Expert": 3
    })

    role_counts = pd.get_dummies(merged_df["Role"], prefix="Role")
    merged_df = pd.concat([merged_df, role_counts], axis=1)

    if "PreferredLane" not in merged_df.columns:
        merged_df["PreferredLane"] = "Unknown"
        
    lane_counts = pd.get_dummies(merged_df["PreferredLane"], prefix="Lane")
    merged_df = pd.concat([merged_df, lane_counts], axis=1)

    # Feedback boosted win rate (simple adjustment for now)
    merged_df["FeedbackBoostedWinRate"] = (
        merged_df["AdjustedWinRate"] +
        (merged_df["Win"].fillna(0) * 0.01) -
        (merged_df["Loss"].fillna(0) * 0.01)
    ).clip(0, 1)
    
    # Sort data by "Name"
    merged_df.sort_values("Name", inplace=True)

    # Prepare final model input
    numeric_df = merged_df.select_dtypes(include=['float64', 'int64'])
    categorical_cols = ['Tier', 'Role', 'Style', 'AttackStyle']
    encoded_df = pd.get_dummies(merged_df[categorical_cols], prefix=categorical_cols)

    final_df = pd.concat([numeric_df, encoded_df], axis=1)

    return final_df, merged_df
