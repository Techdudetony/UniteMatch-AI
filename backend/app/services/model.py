import os
import pandas as pd
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, classification_report
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from collections import Counter
from app.data.loader import load_data
from app.visuals import (
    plot_confusion_matrix,
    plot_feature_importance,
    plot_correlation
)

LOG_PATH = os.path.join(os.path.dirname(__file__), "../data/training_log.csv")

# Normalizes names in data
def normalize_name(name):
    return ' '.join(word.capitalize() for word in name.replace("-", " ").split())

# Train a LightGBM model on Pokémon Unite data and evaluate performance
def build_model(tune: bool = False):
    final_df, df = load_data()
    seed = 123845

    # Dropping low impact Columns
    features = final_df.drop(columns=final_df.filter(regex="^(Tier_|Role_|AttackStyle_)").columns)
    
    # Define features and target
    target = "UsageDifficulty"
    X = features
    y = df[target]

    # Correlation heatmap
    plot_correlation(final_df, X.columns)

    # Encode target labels
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, random_state=seed, stratify=y_encoded)
    
    # SMOTE
    smote = SMOTE(random_state=seed)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

    # Hyperparameter tuning
    if tune:
        param_grid = {
            "num_leaves": [15, 31, 64],
            "learning_rate": [0.05, 0.1],
            "boosting_type": ["gbdt", "dart"],
            "min_child_samples": [10, 20],
            "min_split_gain": [0.0, 0.1],
            "n_estimators": [100, 200, 300],
            "max_depth": [5, 7]
        }
        # StratifiedKFold
        cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=seed)
        grid = GridSearchCV(
            LGBMClassifier(class_weight='balanced', random_state=seed), 
            param_grid, 
            cv=cv
        )
        grid.fit(X_train_resampled, y_train_resampled)
        clf = grid.best_estimator_
        best_params = grid.best_params_
    else:
        clf = LGBMClassifier(n_estimators=100, learning_rate=0.05, max_depth=7, num_leaves=31, random_state=seed, class_weight='balanced')
        clf.fit(X_train_resampled, y_train_resampled)
        best_params = clf.get_params()

    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    cm = confusion_matrix(y_test, y_pred).tolist()
    print(classification_report(y_test, y_pred, target_names=encoder.classes_))
    print("Before SMOTE:", Counter(y_train))
    print("After SMOTE:", Counter(y_train_resampled))

    # Plot Visuals
    plot_feature_importance(clf.feature_importances_, X.columns)
    plot_confusion_matrix(y_test, y_pred, encoder.classes_)

    # Log results
    log_training_result(accuracy, best_params, dict(zip(X.columns, clf.feature_importances_)), f1)
    
    os.makedirs("backend/app/models", exist_ok=True)
    joblib.dump(clf, "backend/app/models/lightgbm_model.pkl")
    joblib.dump(encoder, "backend/app/models/label_encoder.pkl")

    return {
        "model": clf,
        "encoder": encoder,
        "features": X.columns.tolist(),
        "final_df": final_df,
        "accuracy": accuracy,
        "f1_score": f1,
        "confusion_matrix": cm,
        "classes": encoder.classes_.tolist(),
        "best_params": best_params,
        "feature_importance": clf.feature_importances_.tolist()
    }

def log_training_result(accuracy, params, feature_importance, f1):
    row = {
        "Run_ID": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Model": "LightGBM",
        "Accuracy": round(accuracy, 4),
        "F1_Score": round(f1, 4),
        "num_leaves": params.get("num_leaves", ""),
        "learning_rate": params.get("learning_rate", ""),
        "boosting_type": params.get("boosting_type", ""),
        "max_depth": params.get("max_depth", ""),
        "n_estimators": params.get("n_estimators", "")
    }

    for k, v in feature_importance.items():
        row[k] = round(v, 4)

    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    write_header = not os.path.exists(LOG_PATH)
    with open(LOG_PATH, mode="a", newline="") as file:
        writer = pd.DataFrame([row])
        if write_header:
            writer.to_csv(file, index=False)
        else:
            writer.to_csv(file, header=False, index=False)

def optimize_team(team_list: list[str]):
    final_df, df = load_data()

    # Load pretrained model
    clf, encoder = load_model()
    features = clf.feature_name_  # Retrieves feature names used during training

    df["Name"] = df["Name"].astype(str)
    team_list = [normalize_name(name) for name in team_list]

    mask = df["Name"].isin(team_list)
    team_df = df[mask]
    X_team = final_df.loc[mask, features]

    if team_df.empty or len(team_df) != len(team_list):
        missing = set(team_list) - set(team_df["Name"])
        raise ValueError(f"Missing data for: {', '.join(missing)}")

    preds = clf.predict(X_team)
    decoded = encoder.inverse_transform(preds)

    return [{"name": name, "predicted_difficulty": diff} for name, diff in zip(team_df["Name"], decoded)]

def get_cleaned_data():
    _, merged_df = load_data()
    return merged_df.to_dict(orient="records")

def predict_synergy_winrate(team_list: list[str]):
    """
    Predicts estimated win rate for a given team using synergy-related features 
    from both individual and team-level stats.
    """
    from sklearn.ensemble import RandomForestRegressor

    # Load full dataset
    final_df, df = load_data()

    # Normalize and filter selected team
    team_list = [normalize_name(name) for name in team_list]
    df["Name"] = df["Name"].astype(str)
    mask = df["Name"].isin(team_list)
    team_df = df[mask]
    X_team = final_df[mask]

    if team_df.empty or len(team_df) != len(team_list):
        missing = set(team_list) - set(team_df["Name"])
        raise ValueError(f"Missing data for: {', '.join(missing)}")

    # Features to use
    synergy_individual_features = [
        "AvgDifficulty", "FeedbackBoostedWinRate", "MetaImpactScore",
        "Mobility_Offense", "Mobility_Endurance", "Support_Scoring"
    ]
    synergy_categorical_features = [
        col for col in final_df.columns if col.startswith("Role_") or col.startswith("Lane_")
    ]
    synergy_team_features = [
        "num_unique_roles", "most_common_role_count", "has_support",
        "num_unique_lanes", "has_jungle", "avg_difficulty",
        "avg_winrate", "synergy_variance"
    ]
    synergy_features = synergy_individual_features + synergy_team_features + synergy_categorical_features

    # Compute synergy features for full dataset (simulate grouping by team of 1)
    all_synergy = []
    for i in range(len(final_df)):
        row = df.iloc[i:i+1]
        indiv = final_df.iloc[i:i+1][synergy_individual_features + synergy_categorical_features]
        team_feats = compute_synergy_features(row)
        merged = pd.concat([indiv.reset_index(drop=True), team_feats.reset_index(drop=True)], axis=1)
        all_synergy.append(merged)

    training_df = pd.concat(all_synergy, axis=0)
    X = training_df[synergy_features]
    y = df["AdjustedWinRate"]

    # Train regressor
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Compute team input features
    team_indiv = X_team[synergy_individual_features + synergy_categorical_features]
    team_avg = team_indiv.mean().to_frame().T.reset_index(drop=True)
    synergy_df = compute_synergy_features(team_df)
    X_input = pd.concat([team_avg, synergy_df], axis=1)[synergy_features]

    # Predict
    team_preds = model.predict(X_input)
    avg_win_rate = round(team_preds.mean(), 2)

    return {
        "team": team_list,
        "estimated_win_rate": avg_win_rate,
        "individual_rates": [round(p * 100, 2) for p in team_preds]
    }
    
def compute_synergy_features(team_df: pd.DataFrame) -> pd.DataFrame:
    features = {}

    # Role diversity
    role_counts = team_df["Role"].value_counts()
    features["num_unique_roles"] = len(role_counts)
    features["most_common_role_count"] = role_counts.max()
    features["has_support"] = int("Support" in team_df["Role"].values)

    # Lane coverage
    lane_counts = team_df["PreferredLane"].value_counts()
    features["num_unique_lanes"] = len(lane_counts)
    features["has_jungle"] = int("Jungle" in team_df["PreferredLane"].values)

    # Composition averages
    features["avg_difficulty"] = team_df["AvgDifficulty"].mean()
    features["avg_winrate"] = team_df["AdjustedWinRate"].mean()
    features["synergy_variance"] = team_df[["Offense", "Support", "Mobility", "Endurance"]].var().mean()

    return pd.DataFrame([features])

def load_model():
    model_path = "backend/app/models/lightgbm_model.pkl"
    encoder_path = "backend/app/models/label_encoder.pkl"
    
    if not os.path.exists(model_path) or not os.path.exists(encoder_path):
        raise FileNotFoundError("Pretrained model or encoder not found. Please train and save the model first.")
    
    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
    
    return model, encoder

