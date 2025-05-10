from fastapi import APIRouter
from app.services.model import get_cleaned_data

router = APIRouter()

@router.get("/data-preview")
def data_preview():
    return get_cleaned_data()