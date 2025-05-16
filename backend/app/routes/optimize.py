from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.model import optimize_team, build_model, predict_synergy_winrate

router = APIRouter()

class TeamRequest(BaseModel):
    team: list[str]
    
@router.post("/optimize-team")
def optimize(request: TeamRequest):
    print("Received Team for Optimization:", request.team) # DEBUGGING
    try:
        result = optimize_team(request.team)
        return {"optimized": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/train-model")
def train_model():
    try:
        result = build_model(tune=True)
        return {
            "accuracy": result["accuracy"],
            "f1_score": result["f1_score"],
            "best_params": result["best_params"],
            "confusion_matrix": result["confusion_matrix"],
            "feature_importance": dict(zip(result["features"], result["feature_importance"])),
            "classes": result["classes"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/synergy-winrate")
def get_synergy_winrate(data: TeamRequest):
    try:
        return predict_synergy_winrate(data.team)
    except Exception as e:
        return {"error": str(e)}