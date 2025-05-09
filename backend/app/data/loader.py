import pandas as pd
import os

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(DIRECTORY, "PokemonUniteData.csv")

def load_data():
    """Loads and returns cleaned Pokemon Data"""
    df = pd.read_csv(FILE)
    
    # No Cleaning of missing values because there is no missing values
    
    numeric_df = df.select_dtypes(include=['float64'])
    
    return df, numeric_df