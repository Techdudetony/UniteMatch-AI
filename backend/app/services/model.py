import os
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

from app.data.loader import load_data
from app.visuals import (
    plot_confusion_matrix,
    plot_feature_importance,
    plot_correlation
)

LOG_PATH = os.path.join(os.path.dirname(__file__), "../data/training_log.csv")


def build_model(tune: bool = False):
    df, _ = load_data()
    seed = 123845

    # Feature Engineering
    df["Mobility_Offense"] = df["Mobility"] * df["Offense"]

    # Define features and target
    features = ["Offense", "Endurance", "Mobility", "Scoring", "Support", "Mobility_Offense"]
    target = "UsageDifficulty"
    X = df[features]
    y = df[target]

    # Correlation heatmap
    plot_correlation(df, features)

    # Encode target
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, random_state=seed)

    # Model Comparison
    comparison_results = compare_models(X_train, X_test, y_train, y_test, encoder, features, df)

    # Train selected model: RandomForest (with optional tuning)
    if tune:
        param_grid = {
            "n_estimators": [100, 150],
            "max_depth": [3, 5],
            "min_samples_split": [2, 3],
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
    plot_confusion_matrix(y_test, y_pred, encoder.classes_)

    return {
        "model_comparisons": comparison_results,
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


def compare_models(X_train, X_test, y_train, y_test, encoder, features, df, log_path=LOG_PATH):
    models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=5, use_label_encoder=False, eval_metric="mlogloss", random_state=42),
        "LightGBM": LGBMClassifier(n_estimators=100, max_depth=5, random_state=42)
    }

    logs = []

    for name, model in models.items():
        print(f"Training Model: {name}")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)

        importance = model.feature_importances_ if hasattr(model, "feature_importances_") else [0] * len(features)

        logs.append({
            "Run_ID": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Model": name,
            "Accuracy": round(acc, 4),
            "Max_depth": 5,
            "N_estimators": 100,
            **{feat: round(score, 4) for feat, score in zip(features, importance)}
        })

    log_df = pd.DataFrame(logs)
    if os.path.exists(log_path):
        existing = pd.read_csv(log_path)
        log_df = pd.concat([existing, log_df], ignore_index=True)

    log_df.to_csv(log_path, index=False)
    print(f"✅ Logged results to: {log_path}")
    return logs


def optimize_team(team_list: list[str]):
    data = build_model()
    df = data["df"]
    clf = data["model"]
    encoder = data["encoder"]
    features = data["features"]

    team_df = df[df["Name"].isin(team_list)]
    if team_df.empty or len(team_df) != len(team_list):
        missing = set(team_list) - set(team_df["Name"].tolist())
        raise ValueError(f"Missing data for: {', '.join(missing)}")

    X_team = team_df[features]
    preds = clf.predict(X_team)
    decoded = encoder.inverse_transform(preds)

    return [{"name": name, "predicted_difficulty": diff} for name, diff in zip(team_df["Name"], decoded)]


def get_cleaned_data():
    df, _ = load_data()
    return df.to_dict(orient="records")
