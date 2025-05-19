from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.db import SessionLocal
from app.data.feedback_model import Feedback

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
class FeedbackInput(BaseModel):
    team: list[str]
    result: str  # "win" or "loss"
    timestamp: str

@router.post("/feedback")
def submit_feedback(data: FeedbackInput, db: Session = Depends(get_db)):
    feedback_data = []

    for name in data.team:
        entry = Feedback(
            name=name.title(),
            result=data.result,
            timestamp=datetime.fromisoformat(data.timestamp)
        )
        db.add(entry)
        feedback_data.append(entry)

    db.commit()

    return {
        "message": "Feedback submitted successfully",
        "entries": len(feedback_data)
    }

