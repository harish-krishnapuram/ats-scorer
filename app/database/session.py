"""
Session factory used by the get_db dependency.
"""
from sqlalchemy.orm import sessionmaker

from app.database.database import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
