"""
Declarative base for all SQLAlchemy models.
Import every model module here so Alembic autogenerate can see them.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so they're registered on Base.metadata (used by Alembic env.py)
from app.models import user, resume, job, analysis  # noqa: E402,F401
