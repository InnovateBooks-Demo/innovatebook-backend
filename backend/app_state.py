# backend/app_state.py
"""
Shared app state / dependencies.
Move anything that routes import (db, pwd_context, get_database, get_current_user) here.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Replace these with your real DB/client initialization that was in server.py
db = None

def get_database():
    return db

def get_current_user(*args, **kwargs):
    # ✅ Move your existing logic here (previously in server.py or auth deps)
    raise NotImplementedError("Move get_current_user logic here from previous server.py")
