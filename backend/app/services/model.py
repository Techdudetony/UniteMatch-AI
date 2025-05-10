import os
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix
from lightgbm import LGBMClassifier

from app.data.loader import load_data
from app.visuals import (
    plot_confusion_matrix,
    plot_feature_importance,
    plot_correlation
)

LOG_PATH = os.path.join(os.path.dirname(__file__), "../data/training_log.csv")

def build_model(tune: bool = False):
    final_df, _ = load_data()
    seed = 123845

    # 🎯 Feature Engineering
    final_df["Mobility_Offense"] = final_df["Mobility"] * final_df["Offense"]
    final_df["Mobility_Endurance"] = final_df["Mobility"] * final_df["Endurance"]
    final_df["Support_Scoring"] = final_df["Support"] * final_df["Scoring"]

    # Define features and target
    features = final_df.drop(columns=["UsageDifficulty"])
    target = "UsageDifficulty"
    X = features
    y = final_df[target]

    # 📊 Correlation heatmap
    plot_correlation(final_df, features.columns)

    # Encode target labels
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, random_state=seed)

    # 🧪 Hyperparameter tuning (optional)
    if tune:
        param_grid = {
            "num_leaves": [15, 31, 63],
            "learning_rate": [0.05, 0.1, 0.2],
            "boosting_type": ["gbdt", "dart"],
            "n_estimators": [100],
            "max_depth": [5]
        }
        grid = GridSearchCV(LGBMClassifier(random_state=seed), param_grid, cv=3)
        grid.fit(X_train, y_train)
        clf = grid.best_estimator_
        best_params = grid.best_params_
    else:
        clf = LGBMClassifier(n_estimators=100, max_depth=5, random_state=seed)
        clf.fit(X_train, y_train)
        best_params = clf.get_params()

    # 🎯 Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()

    # 📊 Visuals
    plot_feature_importance(clf.feature_importances_, features.columns)
    plot_confusion_matrix(y_test, y_pred, encoder.classes_)

    # ✅ Log
    log_training_result(accuracy, best_params, dict(zip(features.columns, clf.feature_importances_)))

    return {
        "model": clf,
        "encoder": encoder,
        "features": features.columns.tolist(),
        "final_df": final_df,
        "accuracy": accuracy,
        "confusion_matrix": cm,
        "classes": encoder.classes_.tolist(),
        "best_params": best_params,
        "feature_importance": clf.feature_importances_.tolist()
    }

def log_training_result(accuracy, params, feature_importance):
    row = {
        "Run_ID": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Model": "LightGBM",
        "Accuracy": round(accuracy, 4),
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
    data = build_model()
    final_df = data["final_df"]
    clf = data["model"]
    encoder = data["encoder"]
    features = data["features"]

    team_final_df = final_df[final_df["Name"].isin(team_list)]
    if team_final_df.empty or len(team_final_df) != len(team_list):
        missing = set(team_list) - set(team_final_df["Name"].tolist())
        raise ValueError(f"Missing data for: {', '.join(missing)}")

    X_team = team_final_df[features]
    preds = clf.predict(X_team)
    decoded = encoder.inverse_transform(preds)

    return [{"name": name, "predicted_difficulty": diff} for name, diff in zip(team_final_df["Name"], decoded)]

def get_cleaned_data():
    final_df, _ = load_data()
    return final_df.to_dict(orient="records")
