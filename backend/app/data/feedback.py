from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import os

router = APIRouter()

FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "user_feedback.csv")

class FeedbackInput(BaseModel):
    team: list[str]
    result: str  # "win" or "loss"
    timestamp: str

@router.post("/feedback")
def submit_feedback(data: FeedbackInput):
    feedback_data = []

    for name in data.team:
        result_row = {
            "Name": name,
            "Win": 1 if data.result == "win" else 0,
            "Loss": 1 if data.result == "loss" else 0,
            "Timestamp": data.timestamp
        }
        feedback_data.append(result_row)

    new_df = pd.DataFrame(feedback_data)

    if os.path.exists(FEEDBACK_FILE):
        existing_df = pd.read_csv(FEEDBACK_FILE)
        full_df = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        full_df = new_df

    full_df.to_csv(FEEDBACK_FILE, index=False)
    return {"message": "Feedback submitted successfully", "entries": len(feedback_data)}
