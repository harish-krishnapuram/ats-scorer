"""
Aggregates all v1 routers into a single APIRouter mounted by main.py.
"""
from fastapi import APIRouter

from app.api.v1 import analysis, auth, history, jobs, resumes, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(resumes.router)
api_router.include_router(jobs.router)
api_router.include_router(analysis.router)
api_router.include_router(history.router)
