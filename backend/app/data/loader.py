import pandas as pd
import os

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(DIRECTORY, "PokemonUniteData.csv")

def load_data():
    """Loads adn returns cleaned Pokemon Data"""
    df = pd.read_csv(FILE)
    
    # No Cleaning of missing values because there is no missing values
    
    numeric_df = df.select_dtypes(include=['float64'])
    
    return df, numeric_df

def get_feature_sets():
    df, _ = load_data()
    
    # Customize these columns as needed
    in_features = ["Offense", "Endurance", "Mobility", "Scoring", "Support"]
    out_features = ["UsageDifficulty"]
    
    X = df[in_features]
    y = df[out_features]
    
    return X, y