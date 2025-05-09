from fastapi import FastAPI
from app.routes import data

app = FastAPI()

app.include_router(data.router)