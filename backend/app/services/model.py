import os
import pandas as pd
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
    """
    Predicts usage difficulty for a list of Pokémon based on the trained model.

    Args:
        team_list (list[str]): List of Pokémon names.

    Returns:
        list[dict]: Each Pokémon's name and predicted difficulty level.
    """
    # Load the full dataset and encoded features
    final_df, df = load_data()

    # Build the model and get components
    data = build_model()
    clf = data["model"]
    encoder = data["encoder"]
    features = data["features"]

    # Ensure matching name types
    df["Name"] = df["Name"].astype(str)
    team_list = [normalize_name(name) for name in team_list]

    #Boolean mask for team selection
    mask = df["Name"].isin(team_list)
    team_df = df[mask]
    X_team = final_df.loc[mask, features]

    # Check for missing Pokémon names
    if team_df.empty or len(team_df) != len(team_list):
        missing = set(team_list) - set(team_df["Name"])
        raise ValueError(f"Missing data for: {', '.join(missing)}")

    # Make predictions
    preds = clf.predict(X_team)
    decoded = encoder.inverse_transform(preds)

    # Return results
    return [{"name": name, "predicted_difficulty": diff} for name, diff in zip(team_df["Name"], decoded)]

def get_cleaned_data():
    final_df,df = load_data()
    return df.to_dict(orient="records")
