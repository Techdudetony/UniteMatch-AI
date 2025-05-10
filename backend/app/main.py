from fastapi import FastAPI
from app.routes import data
from app.routes import optimize

app = FastAPI()

app.include_router(data.router)
app.include_router(optimize.router)