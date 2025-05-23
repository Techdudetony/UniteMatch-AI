import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
import pandas as pd
from pandas import DataFrame

CHART_DIR = os.path.join(os.path.dirname(__file__), "charts")
os.makedirs(CHART_DIR, exist_ok=True)

def save_chart(fig, filename):
    """Saves chart to /charts only if it doesn't already exist."""
    path = os.path.join(CHART_DIR, filename)
    if os.path.exists(path):
        print(f"Chart already exists: {filename}")
        return path
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)
    print(f"Chart save: {path}")
    return path

def plot_feature_importance(importances, feature_names):
    fig, ax = plt.subplots()
    sns.barplot(x=importances, y=feature_names, ax=ax)
    ax.set_title("Feature Importance")
    ax.set_xlabel("Importance Score")
    ax.set_ylabel("Feature")
    return save_chart(fig, "feature_importance.png")

def plot_confusion_matrix(y_true, y_pred, labels):
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots()
    sns.heatmap(cm, annot=True, xticklabels=labels, yticklabels=labels)
    ax.set_title("Confusion Matrix")
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    return save_chart(fig, "confusion_matrix.png")

def plot_correlation(df: DataFrame, features: list[str], save_path: str = "correlation_heatmap.png") -> None:
    corr = df[features].corr()
    
    # Save numeric correlation matrix as CSV
    csv_path = save_path.replace(".png", ".csv")
    corr.to_csv(csv_path)
    
    fig, ax = plt.subplots()
    sns.heatmap(corr, annot=True, ax=ax)
    plt.title("Feature correlation Matrix")
    plt.tight_layout()
    save_chart(fig, save_path)
    plt.close()