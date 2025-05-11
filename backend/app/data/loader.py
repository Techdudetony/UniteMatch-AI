import pandas as pd
import os

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(DIRECTORY, "PokemonUniteData.csv")
META_FILE = os.path.join(DIRECTORY, "uniteapi_metadata.csv")

# Returns: base_df (raw merged), final_df (numerical + encoded)
def load_data():
    """Loads and returns cleaned Pokemon Data"""
    base_df = pd.read_csv(FILE)
    
    # Import UniteAPI csv and clean
    meta_df = pd.read_csv(META_FILE)
    meta_df_clean = meta_df.drop(columns=['Role', 'Style'])
    
    # Merge datasets
    df = base_df.merge(meta_df_clean, on="Name", how="left")
    
    # Fill missing meta features with 0 or placeholders
    df['WinRate'] = df['WinRate'].fillna(0)
    df['UsageRate'] = df['UsageRate'].fillna(0)
    df['BanRate'] = df['BanRate'].fillna(0)
    df['Tier'] = df['Tier'].fillna("Unknown")
    df['AttackStyle'] = df['AttackStyle'].fillna("Unknown")

    numeric_df = df.select_dtypes(include=['float64'])
    categorical_cols = ['Tier', 'Role', 'Ranged_or_Melee', 'AttackStyle']
    
    # ONe-hot encode Categorical columns
    encoded_df = pd.get_dummies(df[categorical_cols], prefix=categorical_cols)
    
    # Combine numerical and encoded categorical features
    final_df = pd.concat([numeric_df, encoded_df], axis=1)
    
    return final_df, df