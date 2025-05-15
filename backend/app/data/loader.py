import pandas as pd
import os

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(DIRECTORY, "PokemonUniteData.csv")
META_FILE = os.path.join(DIRECTORY, "uniteapi_metadata.csv")

def normalize_name(name):
    # Converts "alolan-raichu" or "Alolan Raichu" to "Alolan Raichu"
    return ' '.join(word.capitalize() for word in name.replace("-", " ").split())

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
    FEEDBACK_FILE = os.path.join(DIRECTORY, "user_feedback.csv")
    if os.path.exists(FEEDBACK_FILE):
        feedback_df = pd.read_csv(FEEDBACK_FILE)
        feedback_agg = (
            feedback_df.groupby("Name")[["Win", "Loss"]].sum().reset_index()
        )
        feedback_agg["AdjustedWinRate"] = (
            feedback_agg["Win"] / (feedback_agg["Win"] + feedback_agg["Loss"])
        ).fillna(0).round(2)

        merged_df = pd.merge(merged_df, feedback_agg, on="Name", how="left")
        merged_df["AdjustedWinRate"] = merged_df["AdjustedWinRate"].fillna(merged_df["WinRate"])
    else:
        merged_df["AdjustedWinRate"] = merged_df["WinRate"]
    
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
    
    # Sort data by "Name"
    merged_df.sort_values("Name", inplace=True)

    # Prepare final model input
    numeric_df = merged_df.select_dtypes(include=['float64', 'int64'])
    categorical_cols = ['Tier', 'Role', 'Style', 'AttackStyle']
    encoded_df = pd.get_dummies(merged_df[categorical_cols], prefix=categorical_cols)

    final_df = pd.concat([numeric_df, encoded_df], axis=1)

    return final_df, merged_df
