from app.data.loader import load_data, get_feature_sets

def get_cleaned_data():
    df, _ = load_data()
    return df.to_dict(orient="records")

def get_training_data():
    X, y = get_feature_sets()
    return {
        "X_columns": X.columns.tolist(),
        "y_columns": y.columns.tolist(),
            
        "X_samples": X.head().to_dict(orient="records"),
        "y_samples": y.head().to_dict(orient="records"),
    }