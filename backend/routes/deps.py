# from fastapi import Depends
# import logging

# def get_db():
#     from app_state import db
#     return db

# async def get_current_user_admin(db = Depends(get_db)):
#     """Verify user has admin permissions - simplified for now"""
#     # In a real app, you would verify the token and check roles
#     return {"user_id": "admin", "org_id": "org_demo", "role": "admin"}



from fastapi import Depends

def get_db():
    from app_state import db
    return db

async def get_current_user_admin(db=Depends(get_db)):
    # TEMP (until JWT is added)
    return {
        "user_id": "75aa8f5a-7351-4851-b94a-3a4283c5b7a7",
        "org_id": "org_default_innovate",
        "role_id": "admin",
        "is_super_admin": False
    }
