from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.model import optimize_team

router = APIRouter()

class TeamRequest(BaseModel):
    team: list[str]
    
@router.post("/optimize-team")
def optimize(request: TeamRequest):
    try:
        result = optimize_team(request.team)
        return {"optimized": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))