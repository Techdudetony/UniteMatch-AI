from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix
from app.data.loader import load_data
from app.visuals import plot_confusion_matrix, plot_feature_importance

def build_model(tune: bool = False):
    df, _ = load_data()
    seed=123845
    
    # Define features and target
    features = ["Offense", "Endurance", "Mobility", "Scoring", "Support"]
    target = "UsageDifficulty"
    
    X = df[features]
    y = df[target]
    
    # Encode target labels
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    
    # Train-Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, random_state=seed)
    
    # Train model
    if tune:
        param_grid = {
            "n_estimators": [100, 150],
            "max_depth": [3, 5],
            "min_samples_split": [2, 3]
        }
        
        grid = GridSearchCV(RandomForestClassifier(random_state=seed), param_grid, cv=3)
        grid.fit(X_train, y_train)
        clf = grid.best_estimator_
        best_params = grid.best_params_
    else:
        clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=seed)
        clf.fit(X_train, y_train)
        best_params = clf.get_params()
        
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    plot_feature_importance(clf.feature_importances_, features)
    plot_confusion_matrix(y_test, clf.predict(X_test), encoder.classes_)
    
    return {
        "model": clf,
        "encoder": encoder,
        "features": features,
        "df": df,
        "accuracy": accuracy,
        "confusion_matrix": cm,
        "classes": encoder.classes_.tolist(),
        "best_params": best_params,
        "feature_importance": clf.feature_importances_.tolist()
    }
    
def optimize_team(team_list: list[str]):
    """
    Accepts a list of Pokemon stats (dicts), averages them, and predicts usage difficulty. 
    Each dict must contain Offense, Endurance, Mobility, Scoring, and Support.
    """
    data = build_model()
    df = data["df"]
    clf = data["model"]
    encoder = data["encoder"]
    features = data["features"]
    
    # Filter the dataframe to only include selected Pokémon
    team_df = df[df["Name"].isin(team_list)]

    if team_df.empty or len(team_df) != len(team_list):
        missing = set(team_list) - set(team_df["Name"].tolist())
        raise ValueError(f"Missing data for: {', '.join(missing)}")

    # Extract features and predict
    X_team = team_df[features]
    predictions = clf.predict(X_team)
    decoded_preds = encoder.inverse_transform(predictions)

    # Build response
    return [
        {"name": name, "predicted_difficulty": diff}
        for name, diff in zip(team_df["Name"], decoded_preds)
    ]
        
def get_cleaned_data():
    df, _ = load_data()
    return df.to_dict(orient="records")