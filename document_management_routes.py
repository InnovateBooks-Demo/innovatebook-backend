"""
INNOVATE BOOKS - DOCUMENT MANAGEMENT API
Attach files to any record across all modules
"""

from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid
import os
import shutil

router = APIRouter(prefix="/api/documents", tags=["documents"])

UPLOAD_DIR = "/app/backend/uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    from main import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    import jwt
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {
        "user_id": payload.get("user_id") or payload.get("sub"), 
        "org_id": payload.get("org_id", "default"), 
        "full_name": payload.get("full_name", "User")}

def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    entity_type: str = Form(...),
    entity_id: str = Form(...),
    folder: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user_simple)
):
    """Upload a document and attach it to an entity"""
    db = get_db()
    
    # Validate file size (max 50MB)
    file_content = await file.read()
    if len(file_content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
    
    # Generate unique filename
    doc_id = generate_id("DOC")
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    stored_filename = f"{doc_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Create document record
    document = {
        "document_id": doc_id,
        "org_id": current_user.get("org_id"),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "filename": file.filename,
        "stored_filename": stored_filename,
        "file_path": f"/uploads/documents/{stored_filename}",
        "file_size": len(file_content),
        "file_type": file.content_type,
        "folder": folder,
        "description": description,
        "version": 1,
        "versions": [{
            "version": 1,
            "filename": file.filename,
            "file_path": f"/uploads/documents/{stored_filename}",
            "file_size": len(file_content),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "uploaded_by": current_user.get("user_id"),
            "uploaded_by_name": current_user.get("full_name")
        }],
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": current_user.get("user_id"),
        "uploaded_by_name": current_user.get("full_name"),
        "tags": [],
        "metadata": {}
    }
    
    await db.documents.insert_one(document)
    
    # Log activity
    await db.activity_feed.insert_one({
        "activity_id": generate_id("ACT"),
        "module": "Documents",
        "action": "uploaded",
        "entity_type": "document",
        "entity_id": doc_id,
        "entity_name": file.filename,
        "description": f"Uploaded document to {entity_type}",
        "user_id": current_user.get("user_id"),
        "user_name": current_user.get("full_name"),
        "org_id": current_user.get("org_id"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": {"linked_to": f"{entity_type}/{entity_id}"}
    })
    
    document.pop("_id", None)
    return {"success": True, "document": document}

@router.post("/{document_id}/version")
async def upload_new_version(
    document_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_simple)
):
    """Upload a new version of an existing document"""
    db = get_db()
    
    doc = await db.documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_content = await file.read()
    if len(file_content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
    
    new_version = doc.get("version", 1) + 1
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    stored_filename = f"{document_id}_v{new_version}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    version_entry = {
        "version": new_version,
        "filename": file.filename,
        "file_path": f"/uploads/documents/{stored_filename}",
        "file_size": len(file_content),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": current_user.get("user_id"),
        "uploaded_by_name": current_user.get("full_name")
    }
    
    await db.documents.update_one(
        {"document_id": document_id},
        {
            "$set": {
                "version": new_version,
                "filename": file.filename,
                "stored_filename": stored_filename,
                "file_path": f"/uploads/documents/{stored_filename}",
                "file_size": len(file_content),
                "file_type": file.content_type
            },
            "$push": {"versions": version_entry}
        }
    )
    
    return {"success": True, "version": new_version, "document_id": document_id}

@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_documents(
    entity_type: str,
    entity_id: str,
    folder: Optional[str] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get all documents attached to an entity"""
    db = get_db()
    
    query = {"entity_type": entity_type, "entity_id": entity_id}
    if folder:
        query["folder"] = folder
    
    documents = await db.documents.find(query, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    
    # Get unique folders for this entity
    folders = await db.documents.distinct("folder", {"entity_type": entity_type, "entity_id": entity_id})
    folders = [f for f in folders if f]
    
    return {
        "documents": documents,
        "total": len(documents),
        "folders": folders
    }

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get document details"""
    db = get_db()
    
    doc = await db.documents.find_one({"document_id": document_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return doc

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Delete a document"""
    db = get_db()
    
    doc = await db.documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete all version files
    for version in doc.get("versions", []):
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(version.get("file_path", "")))
        if os.path.exists(file_path):
            os.remove(file_path)
    
    await db.documents.delete_one({"document_id": document_id})
    
    return {"success": True, "deleted": document_id}

@router.put("/{document_id}")
async def update_document(
    document_id: str,
    filename: Optional[str] = None,
    folder: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[List[str]] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """Update document metadata"""
    db = get_db()
    
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if filename:
        updates["filename"] = filename
    if folder is not None:
        updates["folder"] = folder
    if description is not None:
        updates["description"] = description
    if tags is not None:
        updates["tags"] = tags
    
    result = await db.documents.update_one(
        {"document_id": document_id},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"success": True}

@router.get("/")
async def list_documents(
    entity_type: Optional[str] = None,
    folder: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user_simple)
):
    """List all documents with filters"""
    db = get_db()
    
    query = {"org_id": current_user.get("org_id")}
    if entity_type:
        query["entity_type"] = entity_type
    if folder:
        query["folder"] = folder
    if search:
        query["filename"] = {"$regex": search, "$options": "i"}
    
    documents = await db.documents.find(query, {"_id": 0}).sort("uploaded_at", -1).limit(limit).to_list(limit)
    
    # Get stats
    total = await db.documents.count_documents({"org_id": current_user.get("org_id")})
    total_size = sum(d.get("file_size", 0) for d in documents)
    
    return {
        "documents": documents,
        "total": total,
        "total_size": total_size,
        "returned": len(documents)
    }

@router.post("/folder")
async def create_folder(
    entity_type: str,
    entity_id: str,
    folder_name: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Create a virtual folder for documents"""
    db = get_db()
    
    folder = {
        "folder_id": generate_id("FLD"),
        "org_id": current_user.get("org_id"),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "name": folder_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id")
    }
    
    await db.document_folders.insert_one(folder)
    folder.pop("_id", None)
    
    return {"success": True, "folder": folder}
