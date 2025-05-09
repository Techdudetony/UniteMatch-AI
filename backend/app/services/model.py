from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from app.data.loader import load_data

def build_model():
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
    clf = DecisionTreeClassifier(max_depth=5, random_state=seed)
    clf.fit(X_train, y_train)
    
    accuracy = clf.score(X_test, y_test)
    return {
        "model": clf,
        "accuracy": accuracy,
        "classes": encoder.classes_.tolist()
    }
    
def optimize_team(team_stats):
    """
    Accepts a list of Pokemon stats (dicts), averages them, and predicts usage difficulty. 
    Each dict must contain Offense, Endurance, Mobility, Scoring, and Support.
    """
    model_data = build_model()
    clf = model_data["model"]
    classes = model_data["classes"]
    
    # Convert list of stat dicts into a single averaged feature row
    df = pd.DataFrame(team_stats)
    features = ["Offense", "Endurance", "Mobility", "Scoring", "Support"]
    
    if not all(f in df.columns for f in features):
        raise ValueError(f"Each team member must include the following keys: {features}")
    
    # Average the stats across the team
    team_avg = df[features].mean().values.reshape(1,-1)
    
    # Predict usage difficulty index, then decode to label
    pred_index = clf.predict(team_avg)[0]
    prediction = classes[pred_index]
    
    return prediction
        
def get_cleaned_data():
    df, _ = load_data()
    return df.to_dict(orient="records")