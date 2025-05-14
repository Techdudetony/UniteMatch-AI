from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import data, optimize

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # will replace with domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route files
app.include_router(data.router)
app.include_router(optimize.router)
