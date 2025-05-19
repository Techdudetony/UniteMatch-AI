from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import data, optimize
from .data import feedback
from app.db import engine
from app.data.feedback_model import Base

app = FastAPI()

origins = [
    "https://unite-match-ai.vercel.app",  # your deployed frontend
    "http://localhost:3000",              # for local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,                # or ["*"] for all (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # will replace with domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Route files
app.include_router(data.router)
app.include_router(optimize.router)
app.include_router(feedback.router)


@app.get("/")
def root():
    return {"message": "UniteMatch AI Backend is live!"}