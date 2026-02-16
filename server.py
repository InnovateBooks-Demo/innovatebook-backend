from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
# from emergentintegrations.llm.chat import LlmChat, UserMessage
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None



import asyncio
import pandas as pd
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection with error handling
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'innovate_books_db')

try:
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    logger.info(f"MongoDB client initialized for database: {db_name}")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB client: {e}")
    client = None
    db = None







# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'fallback-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 43200))

# Create the main app without a prefix
app = FastAPI()




from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
         "http://127.0.0.1:3000", # React dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== HEALTH CHECK ENDPOINT ====================
@app.get("/health")
async def health_check():
    """
    Health check endpoint for Kubernetes liveness/readiness probes.
    Returns 200 OK if the application is running.
    """
    return {
        "status": "healthy",
        "service": "innovate-books-api",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/health")
async def api_health_check():
    """
    Alternative health check endpoint under /api prefix.
    """
    return {
        "status": "healthy",
        "service": "innovate-books-api",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==================== MODELS ====================

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "Finance Manager"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Customer Models
class CustomerCreate(BaseModel):
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    credit_limit: float
    payment_terms: str
    address: Optional[str] = None

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: Optional[str] = None  # Sequential ID like CUST-001
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    credit_limit: float
    payment_terms: str
    address: Optional[str] = None
    outstanding_amount: float = 0.0
    overdue_amount: float = 0.0
    avg_payment_days: float = 0.0
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Vendor Models
class VendorCreate(BaseModel):
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    payment_terms: str
    bank_account: Optional[str] = None
    ifsc: Optional[str] = None
    address: Optional[str] = None

class Vendor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    payment_terms: str
    bank_account: Optional[str] = None
    ifsc: Optional[str] = None
    address: Optional[str] = None
    total_payable: float = 0.0
    overdue_amount: float = 0.0
    avg_payment_days: float = 0.0
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Invoice Models
class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_date: datetime
    due_date: datetime
    base_amount: float
    gst_percent: Optional[float] = None  # Made optional for backward compatibility
    gst_amount: float
    tds_percent: float = 0.0
    tds_amount: float = 0.0
    total_amount: float
    category_id: str  # Phase 2: Required for new invoices
    status: str = "Draft"  # Phase 2: Default status
    internal_poc_name: Optional[str] = None
    internal_poc_email: Optional[str] = None
    internal_poc_phone: Optional[str] = None
    external_poc_name: Optional[str] = None
    external_poc_email: Optional[str] = None
    external_poc_phone: Optional[str] = None
    items: List[Dict[str, Any]] = []

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    customer_id: str
    customer_name: str = ""
    invoice_date: datetime
    due_date: datetime
    base_amount: float
    gst_percent: Optional[float] = None  # Made optional for backward compatibility
    gst_amount: float
    tds_percent: float = 0.0
    tds_amount: float = 0.0
    total_amount: float
    amount_received: float = 0.0
    amount_outstanding: float = 0.0
    net_receivable: Optional[float] = None  # Calculated field: total_amount - tds_amount
    balance_due: Optional[float] = None     # Calculated field: net_receivable - amount_received
    status: str = "Unpaid"
    payment_date: Optional[datetime] = None  # Date when invoice was fully paid
    category_id: Optional[str] = None  # Phase 2: Link to Category Master
    coa_account: Optional[str] = None  # Phase 2: Chart of Accounts
    journal_entry_id: Optional[str] = None  # Phase 2: Link to journal entry
    owner: Optional[str] = None
    internal_poc_name: Optional[str] = None
    internal_poc_email: Optional[str] = None
    internal_poc_phone: Optional[str] = None
    external_poc_name: Optional[str] = None
    external_poc_email: Optional[str] = None
    external_poc_phone: Optional[str] = None
    items: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Bill Models
class BillCreate(BaseModel):
    vendor_id: str
    bill_date: datetime
    due_date: datetime
    base_amount: float
    gst_percent: Optional[float] = None  # Made optional for backward compatibility
    gst_amount: float
    tds_percent: float = 0.0
    tds_amount: float = 0.0
    total_amount: float
    category_id: str  # Phase 2: Required for new bills
    status: str = "Draft"  # Phase 2: Default status
    expense_category: Optional[str] = None  # Legacy field, made optional
    items: List[Dict[str, Any]] = []

class Bill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bill_number: str
    vendor_id: str
    vendor_name: str = ""
    bill_date: datetime
    due_date: datetime
    base_amount: float
    gst_percent: Optional[float] = None  # Made optional for backward compatibility
    gst_amount: float
    tds_percent: float = 0.0
    tds_amount: float = 0.0
    total_amount: float
    amount_paid: float = 0.0
    amount_outstanding: float = 0.0
    status: str = "Pending"
    category_id: Optional[str] = None  # Phase 2: Link to Category Master
    coa_account: Optional[str] = None  # Phase 2: Chart of Accounts
    journal_entry_id: Optional[str] = None  # Phase 2: Link to journal entry
    expense_category: Optional[str] = None  # Legacy field, made optional
    items: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Bank Account Models
class BankAccountCreate(BaseModel):
    bank_name: str
    account_number: str
    account_type: str
    ifsc: str
    branch: Optional[str] = None
    opening_balance: float

class BankAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bank_name: str
    account_number: str
    account_type: str
    ifsc: str
    branch: Optional[str] = None
    opening_balance: float
    current_balance: float
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Transaction Models
class TransactionCreate(BaseModel):
    bank_account_id: str
    transaction_date: datetime
    description: str
    transaction_type: str  # Credit or Debit
    amount: float
    reference_no: Optional[str] = None

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bank_account_id: str
    bank_name: str = ""
    transaction_date: datetime
    description: str
    transaction_type: str
    amount: float
    reference_no: Optional[str] = None
    balance: float = 0.0
    status: str = "New"
    linked_entity: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Cash Flow Models
class CashFlowEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime
    type: str  # Inflow or Outflow
    category: str
    amount: float
    source: str
    description: str
    is_actual: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Category Master Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    category_name: str
    coa_account: str
    fs_head: str
    statement_type: str  # "Profit & Loss" or "Balance Sheet"
    cashflow_activity: str  # Operating, Investing, Financing, etc.
    cashflow_flow: str  # Inflow, Outflow, Non-Cash
    cashflow_category: str
    industry_tags: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# Journal Entry Models
class JournalLineItem(BaseModel):
    account: str  # COA Account name
    description: str
    debit: float = 0.0
    credit: float = 0.0

class JournalEntryCreate(BaseModel):
    transaction_id: str  # Reference to invoice/bill ID
    transaction_type: str  # "Invoice", "Bill", "Payment", "Receipt"
    entry_date: datetime
    description: str
    line_items: List[JournalLineItem]
    total_debit: float
    total_credit: float

class JournalEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_id: str
    transaction_type: str
    entry_date: datetime
    description: str
    line_items: List[JournalLineItem]
    total_debit: float
    total_credit: float
    posted_by: Optional[str] = None
    status: str = "Posted"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Adjustment Entry Models
class AdjustmentLineItem(BaseModel):
    account: str  # COA Account name
    description: str
    debit: float = 0.0
    credit: float = 0.0

class AdjustmentEntryCreate(BaseModel):
    entry_date: datetime
    description: str
    line_items: List[AdjustmentLineItem]
    notes: Optional[str] = None

class AdjustmentEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entry_number: str  # Format: ADJ-XXXX
    entry_date: datetime
    description: str
    line_items: List[AdjustmentLineItem]
    total_debit: float
    total_credit: float
    status: str = "Draft"  # Draft, Review, Approved, Posted
    notes: Optional[str] = None
    journal_entry_id: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None


# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_database():
    """Dependency to get database instance"""
    return db

# async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
#     try:
#         token = credentials.credentials
#         payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
#         # Support both 'sub' and 'user_id' for compatibility
#         user_id = payload.get("sub") or payload.get("user_id")
#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#         # Try multiple lookup methods
#         user = await db.users.find_one({"_id": user_id})
#         if user is None:
#             user = await db.users.find_one({"user_id": user_id})
#         if user is None:
#             user = await db.users.find_one({"id": user_id})
#         if user is None:
#             # Create a minimal user dict for API compatibility
#             user = {
#                 "_id": user_id,
#                 "id": user_id,
#                 "user_id": user_id,
#                 "email": payload.get("email") or f"{user_id}@system.local",
#                 "full_name": payload.get("full_name") or "System User",
#                 "role": payload.get("role_id", "user"),
#                 "org_id": payload.get("org_id")
#             }
#         # Fix: Explicitly set id to _id to avoid UUID generation
#         user["id"] = user.get("_id") or user.get("user_id") or user_id
#         return User(**user)
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token expired")
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        user_id = payload.get("sub") or payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await db.users.find_one({"_id": user_id})
        if user is None:
            user = await db.users.find_one({"user_id": user_id})
        if user is None:
            user = await db.users.find_one({"id": user_id})

        if user is None:
            user = {
                "_id": user_id,
                "email": payload.get("email") or f"{user_id}@system.local",
                "full_name": payload.get("full_name") or "System User",
                "role": payload.get("role_id", "user"),
                "org_id": payload.get("org_id"),
            }

        mongo_id = user.get("_id") or user.get("user_id") or user_id

        user_data = {
            "id": str(mongo_id),
            "email": user.get("email"),
            "full_name": user.get("full_name", "System User"),
            "role": user.get("role"),
            "org_id": user.get("org_id"),
        }

        return User(**user_data)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# async def generate_ai_insight(prompt: str) -> str:
#     """Generate AI insights using OpenAI GPT-5"""
#     try:
#         chat = LlmChat(
#             api_key=os.environ.get('EMERGENT_LLM_KEY'),
#             session_id=str(uuid.uuid4()),
#             system_message="You are a financial analysis expert. Provide concise, actionable insights."
#         ).with_model("openai", "gpt-5")
        
#         message = UserMessage(text=prompt)
#         response = await chat.send_message(message)
#         return response
#     except Exception as e:
#         logging.error(f"AI insight generation error: {e}")
#         return "AI insights temporarily unavailable"




async def generate_ai_insight(prompt: str) -> str:
    """Generate AI insights using OpenAI GPT-5 (Emergent cloud only)"""

    # 🔹 Local fallback (Emergent SDK not available)
    if LlmChat is None or UserMessage is None:
        return "AI insights are disabled in local development mode"

    try:
        chat = (
            LlmChat(
                api_key=os.environ.get("EMERGENT_LLM_KEY"),
                session_id=str(uuid.uuid4()),
                system_message=(
                    "You are a financial analysis expert. "
                    "Provide concise, actionable insights."
                ),
            )
            .with_model("openai", "gpt-5")
        )

        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        return response

    except Exception as e:
        logging.error(f"AI insight generation error: {e}")
        return "AI insights temporarily unavailable"


# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role or "Finance Manager"
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token({"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

# OLD LOGIN ROUTE - COMMENTED OUT TO USE NEW AUTH SYSTEM
# @api_router.post("/auth/login", response_model=Token)
# async def login(credentials: UserLogin):
#     user_doc = await db.users.find_one({"email": credentials.email})
#     if not user_doc or not verify_password(credentials.password, user_doc.get('password_hash', user_doc.get('password', ''))):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     
#     # Map _id to id for User model compatibility
#     user_data = {k: v for k, v in user_doc.items() if k not in ['password', 'password_hash']}
#     if '_id' in user_data:
#         user_data['id'] = user_data.pop('_id')
#     
#     user = User(**user_data)
#     access_token = create_access_token({"sub": user_doc['_id']})
#     
#     return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== DASHBOARD ROUTES ====================

@api_router.post("/admin/fix-invoice-totals")
async def fix_invoice_totals(current_user: User = Depends(get_current_user)):
    """Fix invoice total_amount for all invoices: total_amount = base_amount + gst_amount"""
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(None)
    
    fixed_count = 0
    fixes = []
    
    for invoice in invoices:
        try:
            base_amount = float(invoice.get('base_amount', 0))
            gst_amount = float(invoice.get('gst_amount', 0))
            current_total = float(invoice.get('total_amount', 0))
            
            # Calculate correct total
            correct_total = base_amount + gst_amount
            
            # Check if needs fixing (allow for small float differences)
            if abs(correct_total - current_total) > 0.01:
                invoice_number = invoice.get('invoice_number')
                
                # Also recalculate amount_receivable
                tds_amount = float(invoice.get('tds_amount', 0))
                correct_receivable = correct_total - tds_amount
                
                # Update the invoice
                update_data = {"total_amount": correct_total}
                
                # Only update amount_outstanding if invoice is not paid
                if invoice.get('status') != 'Paid':
                    update_data["amount_outstanding"] = correct_receivable
                
                await db.invoices.update_one(
                    {"id": invoice['id']},
                    {"$set": update_data}
                )
                
                fixes.append({
                    "invoice_number": invoice_number,
                    "old_total": current_total,
                    "new_total": correct_total,
                    "base": base_amount,
                    "gst": gst_amount
                })
                
                fixed_count += 1
                
        except Exception as e:
            continue
    
    return {
        "success": True,
        "total_invoices": len(invoices),
        "fixed_count": fixed_count,
        "fixes": fixes
    }

@api_router.get("/cashflow/actuals/summary")
async def get_cashflow_summary(
    month: int = None,
    year: int = None,
    account_id: str = None,
    current_user: User = Depends(get_current_user)
):
    """Get cash flow actuals summary for selected period"""
    from datetime import datetime, timezone
    import calendar
    
    # Default to current month/year if not provided
    now = datetime.now(timezone.utc)
    month = month or now.month
    year = year or now.year
    
    # Calculate date range
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    last_day = calendar.monthrange(year, month)[1]
    end_date = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)
    
    # Get opening balance (sum of all transactions before period start)
    opening_query = {"transaction_date": {"$lt": start_date.isoformat()}}
    if account_id:
        opening_query["account_id"] = account_id
    
    opening_txns = await db.transactions.find(opening_query, {"_id": 0}).to_list(None)
    opening_balance = sum(
        t.get('amount', 0) if t.get('transaction_type') == 'Credit' else -t.get('amount', 0)
        for t in opening_txns
    )
    
    # Get transactions for the period
    period_query = {
        "transaction_date": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }
    if account_id:
        period_query["account_id"] = account_id
    
    period_txns = await db.transactions.find(period_query, {"_id": 0}).to_list(None)
    
    inflows = sum(t.get('amount', 0) for t in period_txns if t.get('transaction_type') == 'Credit')
    outflows = sum(t.get('amount', 0) for t in period_txns if t.get('transaction_type') == 'Debit')
    
    net_cash_flow = inflows - outflows
    closing_balance = opening_balance + net_cash_flow
    
    return {
        "opening_balance": opening_balance,
        "inflows": inflows,
        "outflows": outflows,
        "net_cash_flow": net_cash_flow,
        "closing_balance": closing_balance
    }


@api_router.get("/cashflow/actuals/transactions")
async def get_cashflow_transactions(
    month: int = None,
    year: int = None,
    account_id: str = None,
    category: str = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get detailed cash flow transactions"""
    from datetime import datetime, timezone
    import calendar
    
    now = datetime.now(timezone.utc)
    month = month or now.month
    year = year or now.year
    
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    last_day = calendar.monthrange(year, month)[1]
    end_date = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)
    
    # Build query
    query = {
        "transaction_date": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }
    if account_id:
        query["account_id"] = account_id
    
    # Get transactions
    skip = (page - 1) * limit
    transactions = await db.transactions.find(query, {"_id": 0}).sort("transaction_date", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with linked document data
    enriched = []
    for txn in transactions:
        linked_doc_id = txn.get('linked_entity')
        counterparty = None
        subcategory = "General"
        flow_category = "Operating"
        
        if linked_doc_id:
            if txn.get('transaction_type') == 'Credit':
                # Check invoices
                invoice = await db.invoices.find_one({"invoice_number": linked_doc_id}, {"_id": 0})
                if invoice:
                    counterparty = invoice.get('customer_name')
                    subcategory = "Receipts from Customers"
            else:
                # Check bills
                bill = await db.bills.find_one({"bill_number": linked_doc_id}, {"_id": 0})
                if bill:
                    counterparty = bill.get('vendor_name')
                    bill_category = bill.get('category', 'General')
                    
                    # Map category to cash flow type
                    if bill_category in ['Salary', 'Rent', 'Purchase', 'Utilities']:
                        flow_category = "Operating"
                        subcategory = f"Payment for {bill_category}"
                    elif bill_category in ['Asset', 'Equipment', 'Property']:
                        flow_category = "Investing"
                        subcategory = "Purchase of Fixed Assets"
                    elif bill_category in ['Loan', 'Interest']:
                        flow_category = "Financing"
                        subcategory = "Loan Repayment"
        
        enriched.append({
            "date": txn.get('transaction_date'),
            "account": txn.get('account_name', 'Bank Account'),
            "type": "Inflow" if txn.get('transaction_type') == 'Credit' else "Outflow",
            "amount": txn.get('amount', 0),
            "category": flow_category,
            "subcategory": subcategory,
            "counterparty": counterparty or "N/A",
            "linked_doc": linked_doc_id or "N/A",
            "description": txn.get('description', 'N/A')
        })
    
    total_count = await db.transactions.count_documents(query)
    
    return {
        "transactions": enriched,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit
    }


@api_router.get("/cashflow/actuals/statement")
async def get_cashflow_statement(
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_user)
):
    """Get Companies Act 2013 compliant cash flow statement"""
    from datetime import datetime, timezone
    import calendar
    
    now = datetime.now(timezone.utc)
    month = month or now.month
    year = year or now.year
    
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    last_day = calendar.monthrange(year, month)[1]
    end_date = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)
    
    query = {
        "transaction_date": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }
    
    transactions = await db.transactions.find(query, {"_id": 0}).to_list(None)
    
    # Initialize statement structure
    statement = {
        "Operating Activities": {},
        "Investing Activities": {},
        "Financing Activities": {}
    }
    
    for txn in transactions:
        amount = txn.get('amount', 0)
        txn_type = txn.get('transaction_type')
        linked_doc = txn.get('linked_entity')
        
        category = "Operating Activities"
        line_item = "Cash receipts from customers" if txn_type == 'Credit' else "Cash paid to suppliers"
        
        # Determine category based on linked document
        if linked_doc:
            if txn_type == 'Debit':
                bill = await db.bills.find_one({"bill_number": linked_doc}, {"_id": 0})
                if bill:
                    bill_cat = bill.get('category', '').lower()
                    if 'asset' in bill_cat or 'equipment' in bill_cat:
                        category = "Investing Activities"
                        line_item = "Purchase of fixed assets"
                    elif 'loan' in bill_cat or 'interest' in bill_cat:
                        category = "Financing Activities"
                        line_item = "Repayment of borrowings"
                    elif 'salary' in bill_cat:
                        line_item = "Cash paid to employees"
                    elif 'rent' in bill_cat:
                        line_item = "Cash paid for rent"
        
        # Add to statement
        if line_item not in statement[category]:
            statement[category][line_item] = 0
        
        statement[category][line_item] += amount if txn_type == 'Credit' else -amount
    
    # Calculate net flows
    operating_net = sum(statement["Operating Activities"].values())
    investing_net = sum(statement["Investing Activities"].values())
    financing_net = sum(statement["Financing Activities"].values())
    
    return {
        "statement": statement,
        "summary": {
            "operating_net": operating_net,
            "investing_net": investing_net,
            "financing_net": financing_net,
            "net_increase": operating_net + investing_net + financing_net
        }
    }


@api_router.get("/cashflow/actuals/charts")
async def get_cashflow_charts(
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_user)
):
    """Get chart data for cash flow actuals"""
    from datetime import datetime, timezone, timedelta
    import calendar
    
    now = datetime.now(timezone.utc)
    month = month or now.month
    year = year or now.year
    
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    last_day = calendar.monthrange(year, month)[1]
    end_date = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)
    
    query = {
        "transaction_date": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }
    
    transactions = await db.transactions.find(query, {"_id": 0}).to_list(None)
    
    # Group by date for line chart
    daily_data = {}
    category_data = {"Operating": 0, "Investing": 0, "Financing": 0}
    
    for txn in transactions:
        txn_date = txn.get('transaction_date', '')[:10]
        amount = txn.get('amount', 0)
        txn_type = txn.get('transaction_type')
        
        if txn_date not in daily_data:
            daily_data[txn_date] = {"inflow": 0, "outflow": 0}
        
        if txn_type == 'Credit':
            daily_data[txn_date]["inflow"] += amount
            category_data["Operating"] += amount
        else:
            daily_data[txn_date]["outflow"] += amount
            category_data["Operating"] -= amount
    
    # Convert to array for charts
    line_chart_data = [
        {"date": date, "inflow": data["inflow"], "outflow": data["outflow"]}
        for date, data in sorted(daily_data.items())
    ]
    
    pie_chart_data = [
        {"name": cat, "value": val}
        for cat, val in category_data.items()
        if val != 0
    ]
    
    return {
        "line_chart": line_chart_data,
        "pie_chart": pie_chart_data
    }


@api_router.get("/dashboard/metrics")
async def get_dashboard_metrics(current_user: User = Depends(get_current_user)):
    # Get cash on hand
    bank_accounts = await db.bank_accounts.find({"status": "Active"}, {"_id": 0}).to_list(100)
    cash_on_hand = sum(acc.get('current_balance', 0) for acc in bank_accounts)
    
    # Get AR outstanding
    invoices = await db.invoices.find({"status": {"$in": ["Unpaid", "Partially Paid"]}}, {"_id": 0}).to_list(1000)
    ar_outstanding = sum(inv.get('amount_outstanding', 0) for inv in invoices)
    
    overdue_invoices = []
    for inv in invoices:
        due_date = inv.get('due_date')
        if due_date:
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date)
            if isinstance(due_date, datetime) and due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            if due_date < datetime.now(timezone.utc):
                overdue_invoices.append(inv)
    
    ar_overdue_amount = sum(inv.get('amount_outstanding', 0) for inv in overdue_invoices)
    ar_overdue_percent = (len(overdue_invoices) / len(invoices) * 100) if invoices else 0
    
    # Get AP outstanding
    bills = await db.bills.find({"status": {"$in": ["Pending", "Partially Paid"]}}, {"_id": 0}).to_list(1000)
    ap_outstanding = sum(bill.get('amount_outstanding', 0) for bill in bills)
    
    overdue_bills = []
    for bill in bills:
        due_date = bill.get('due_date')
        if due_date:
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date)
            if isinstance(due_date, datetime) and due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            if due_date < datetime.now(timezone.utc):
                overdue_bills.append(bill)
    
    ap_overdue_amount = sum(bill.get('amount_outstanding', 0) for bill in overdue_bills)
    
    # Calculate DSO (simplified)
    dso = 45.5  # Placeholder
    dpo = 38.2  # Placeholder
    
    # Cash flow metrics
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    cash_inflows = await db.cash_flow.find({
        "type": "Inflow",
        "is_actual": True,
        "date": {"$gte": thirty_days_ago}
    }, {"_id": 0}).to_list(1000)
    
    cash_outflows = await db.cash_flow.find({
        "type": "Outflow",
        "is_actual": True,
        "date": {"$gte": thirty_days_ago}
    }, {"_id": 0}).to_list(1000)
    
    total_inflow = sum(cf.get('amount', 0) for cf in cash_inflows)
    total_outflow = sum(cf.get('amount', 0) for cf in cash_outflows)
    net_cash_flow = total_inflow - total_outflow
    
    # Burn rate (monthly)
    burn_rate = total_outflow
    runway = (cash_on_hand / burn_rate) * 30 if burn_rate > 0 else 999
    
    # Generate AI insights
    insight_prompt = f"""Analyze this financial snapshot and provide 2-3 key insights:
    - Cash on Hand: ₹{cash_on_hand:,.0f}
    - AR Outstanding: ₹{ar_outstanding:,.0f} ({ar_overdue_percent:.1f}% overdue)
    - AP Outstanding: ₹{ap_outstanding:,.0f}
    - Net Cash Flow (30 days): ₹{net_cash_flow:,.0f}
    - Runway: {runway:.0f} days
    """
    
    ai_insights = await generate_ai_insight(insight_prompt)
    
    return {
        "cash_on_hand": cash_on_hand,
        "net_cash_flow": net_cash_flow,
        "revenue_mtd": total_inflow,
        "expenses_mtd": total_outflow,
        "profit_margin": ((total_inflow - total_outflow) / total_inflow * 100) if total_inflow > 0 else 0,
        "runway_days": runway,
        "ar_outstanding": ar_outstanding,
        "ar_overdue_percent": ar_overdue_percent,
        "ar_overdue_amount": ar_overdue_amount,
        "dso": dso,
        "ap_outstanding": ap_outstanding,
        "ap_overdue_amount": ap_overdue_amount,
        "dpo": dpo,
        "current_ratio": 2.1,
        "quick_ratio": 1.8,
        "ai_insights": ai_insights,
        "alerts": [
            {"type": "warning", "message": f"{len(overdue_invoices)} invoices overdue"},
            {"type": "info", "message": f"Cash runway: {runway:.0f} days"}
        ]
    }

# ==================== CUSTOMER ROUTES ====================

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    # Generate sequential customer_id
    count = await db.parties_customers.count_documents({})
    customer_id = f"CUST-{str(count + 1).zfill(3)}"
    
    customer = Customer(**customer_data.model_dump(), customer_id=customer_id)
    doc = customer.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.parties_customers.insert_one(doc)
    return customer

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user)):
    customers = await db.parties_customers.find({}, {"_id": 0}).to_list(1000)
    for c in customers:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customer = await db.parties_customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if isinstance(customer.get('created_at'), str):
        customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    return Customer(**customer)

@api_router.get("/customers/{customer_id}/details")
async def get_customer_details(customer_id: str, current_user: User = Depends(get_current_user)):
    """Get complete customer details with invoices and payment history"""
    customer = await db.parties_customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get all invoices for this customer
    invoices = await db.invoices.find({"customer_id": customer_id}, {"_id": 0}).to_list(1000)
    
    # Get payment history (from matched transactions)
    payments = await db.transactions.find({
        "transaction_type": "Credit",
        "linked_entity": {"$regex": f".*{customer['name']}.*"}
    }, {"_id": 0}).to_list(1000)
    
    return {
        "customer": customer,
        "invoices": invoices,
        "payments": payments,
        "total_invoiced": sum(inv.get('total_amount', 0) for inv in invoices),
        "total_paid": sum(inv.get('amount_received', 0) for inv in invoices),
        "documents": [],
        "notes": []
    }

@api_router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    """Update customer"""
    result = await db.parties_customers.update_one(
        {"id": customer_id},
        {"$set": customer_data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer updated successfully"}

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    """Delete customer"""
    result = await db.parties_customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# ==================== VENDOR ROUTES ====================

@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(vendor_data: VendorCreate, current_user: User = Depends(get_current_user)):
    vendor = Vendor(**vendor_data.model_dump())
    doc = vendor.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.parties_vendors.insert_one(doc)
    return vendor

@api_router.get("/vendors", response_model=List[Vendor])
async def get_vendors(current_user: User = Depends(get_current_user)):
    vendors = await db.parties_vendors.find({}, {"_id": 0}).to_list(1000)
    for v in vendors:
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vendors

@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str, current_user: User = Depends(get_current_user)):
    vendor = await db.parties_vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if isinstance(vendor.get('created_at'), str):
        vendor['created_at'] = datetime.fromisoformat(vendor['created_at'])
    return Vendor(**vendor)

@api_router.get("/vendors/{vendor_id}/details")
async def get_vendor_details(vendor_id: str, current_user: User = Depends(get_current_user)):
    """Get complete vendor details with bills and payment history"""
    vendor = await db.parties_vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Get all bills for this vendor
    bills = await db.bills.find({"vendor_id": vendor_id}, {"_id": 0}).to_list(1000)
    
    # Get payment history
    payments = await db.transactions.find({
        "transaction_type": "Debit",
        "linked_entity": {"$regex": f".*{vendor['name']}.*"}
    }, {"_id": 0}).to_list(1000)
    
    return {
        "vendor": vendor,
        "bills": bills,
        "payments": payments,
        "total_billed": sum(bill.get('total_amount', 0) for bill in bills),
        "total_paid": sum(bill.get('amount_paid', 0) for bill in bills),
        "documents": [],
        "notes": []
    }

@api_router.put("/vendors/{vendor_id}")
async def update_vendor(vendor_id: str, vendor_data: VendorCreate, current_user: User = Depends(get_current_user)):
    """Update vendor"""
    result = await db.parties_vendors.update_one(
        {"id": vendor_id},
        {"$set": vendor_data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor updated successfully"}

@api_router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str, current_user: User = Depends(get_current_user)):
    """Delete vendor"""
    result = await db.parties_vendors.delete_one({"id": vendor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}

# ==================== INVOICE ROUTES ====================

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate, current_user: User = Depends(get_current_user)):
    # Phase 2: Validate and fetch category
    category = await db.category_master.find_one({"id": invoice_data.category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Validate category is an Operating Inflow
    if category['cashflow_activity'] != "Operating" or category['cashflow_flow'] != "Inflow":
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be Operating Inflow. Selected: {category['cashflow_activity']} - {category['cashflow_flow']}"
        )
    
    # Get customer
    customer = await db.parties_customers.find_one({"id": invoice_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate invoice number
    count = await db.invoices.count_documents({})
    invoice_number = f"INV-{count + 1001}"
    
    invoice = Invoice(
        invoice_number=invoice_number,
        customer_name=customer['name'],
        amount_outstanding=invoice_data.total_amount,
        coa_account=category['coa_account'],  # Phase 2: Set COA from category
        **invoice_data.model_dump()
    )
    
    doc = invoice.model_dump()
    doc['invoice_date'] = doc['invoice_date'].isoformat()
    doc['due_date'] = doc['due_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.invoices.insert_one(doc)
    
    # Phase 2: Auto-post journal entry if status is "Finalized"
    if invoice_data.status == "Finalized":
        journal = await create_invoice_journal_entry(
            invoice.id,
            {
                'invoice_number': invoice_number,
                'customer_name': customer['name'],
                'invoice_date': invoice.invoice_date,
                'base_amount': invoice.base_amount,
                'gst_amount': invoice.gst_amount,
                'total_amount': invoice.total_amount,
                'coa_account': category['coa_account']
            },
            current_user.id
        )
        
        # Update invoice with journal_entry_id
        await db.invoices.update_one(
            {"id": invoice.id},
            {"$set": {"journal_entry_id": journal['id']}}
        )
        invoice.journal_entry_id = journal['id']
    
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    for inv in invoices:
        for date_field in ['invoice_date', 'due_date', 'created_at', 'payment_date']:
            if isinstance(inv.get(date_field), str):
                inv[date_field] = datetime.fromisoformat(inv[date_field])
        
        # Calculate net_receivable and balance_due for frontend display
        total_amount = inv.get('total_amount', 0)
        tds_amount = inv.get('tds_amount', 0)
        amount_received = inv.get('amount_received', 0)
        
        inv['net_receivable'] = total_amount - tds_amount
        inv['balance_due'] = max(0, inv['net_receivable'] - amount_received)
        
        # Fix status logic: if amount_received is 0, status should be Unpaid
        if amount_received == 0:
            inv['status'] = 'Unpaid'
        elif amount_received >= inv['net_receivable']:
            inv['status'] = 'Paid'
        else:
            inv['status'] = 'Partially Paid'
    
    return invoices

@api_router.get("/invoices/{invoice_id}/details")
async def get_invoice_details(invoice_id: str, current_user: User = Depends(get_current_user)):
    """Get complete invoice details with activity timeline"""
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Calculate net receivable = total_amount - tds_amount
    net_receivable = invoice.get('total_amount', 0) - invoice.get('tds_amount', 0)
    amount_received = invoice.get('amount_received', 0)
    balance_due = max(0, net_receivable - amount_received)
    
    # Update invoice with calculated values
    invoice['net_receivable'] = net_receivable
    invoice['balance_due'] = balance_due
    
    # Get status and payment date
    status = invoice.get('status', 'Unpaid')
    payment_date = invoice.get('payment_date')
    
    # Calculate days overdue and bucket - only for unpaid/partially paid invoices
    now = datetime.now(timezone.utc)
    due_date = invoice.get('due_date')
    if isinstance(due_date, str):
        due_date = datetime.fromisoformat(due_date)
        if due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)
    elif isinstance(due_date, datetime):
        if due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)
    
    # For fully paid invoices, no days overdue and no bucket
    if status == "Paid":
        days_overdue = 0
        bucket = None  # Fully paid invoices don't belong to any bucket
    else:
        days_overdue = max(0, (now - due_date).days) if due_date else 0
        
        if days_overdue == 0:
            bucket = "Current"
        elif days_overdue <= 30:
            bucket = "0-30 Days"
        elif days_overdue <= 60:
            bucket = "31-60 Days"
        elif days_overdue <= 90:
            bucket = "61-90 Days"
        else:
            bucket = "90+ Days"
    
    # Get activity timeline
    activities = await db.invoice_activities.find({"invoice_id": invoice_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Calculate DSO for this invoice
    invoice_date = invoice.get('invoice_date')
    if isinstance(invoice_date, str):
        invoice_date = datetime.fromisoformat(invoice_date)
        if invoice_date.tzinfo is None:
            invoice_date = invoice_date.replace(tzinfo=timezone.utc)
    elif isinstance(invoice_date, datetime):
        if invoice_date.tzinfo is None:
            invoice_date = invoice_date.replace(tzinfo=timezone.utc)
    
    # DSO calculation: 
    # - For fully paid invoices, use (payment_date - invoice_date)
    # - For unpaid/partially paid, use (current_date - invoice_date)
    if status == "Paid" and payment_date:
        # Parse payment_date if it's a string
        if isinstance(payment_date, str):
            payment_date = datetime.fromisoformat(payment_date)
            if payment_date.tzinfo is None:
                payment_date = payment_date.replace(tzinfo=timezone.utc)
        elif isinstance(payment_date, datetime):
            # Ensure payment_date is timezone-aware
            if payment_date.tzinfo is None:
                payment_date = payment_date.replace(tzinfo=timezone.utc)
        
        dso = (payment_date - invoice_date).days if invoice_date else 0
    else:
        dso = (now - invoice_date).days if invoice_date else 0
    
    return {
        "invoice": invoice,
        "days_overdue": days_overdue,
        "bucket": bucket,
        "dso": dso,
        "activities": activities
    }

@api_router.get("/invoices/aging")
async def get_invoice_aging(current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({"status": {"$in": ["Unpaid", "Partially Paid"]}}, {"_id": 0}).to_list(1000)
    
    aging = {
        "0-30": {"amount": 0, "count": 0, "invoices": []},
        "31-60": {"amount": 0, "count": 0, "invoices": []},
        "61-90": {"amount": 0, "count": 0, "invoices": []},
        "90+": {"amount": 0, "count": 0, "invoices": []}
    }
    now = datetime.now(timezone.utc)
    
    for inv in invoices:
        due_date = inv.get('due_date')
        if isinstance(due_date, str):
            due_date = datetime.fromisoformat(due_date)
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
        
        days_overdue = (now - due_date).days if due_date else 0
        amount = inv.get('amount_outstanding', 0)
        
        inv_summary = {
            "id": inv.get('id'),
            "invoice_number": inv.get('invoice_number'),
            "customer_name": inv.get('customer_name'),
            "amount": amount,
            "days_overdue": days_overdue
        }
        
        if days_overdue <= 30:
            aging["0-30"]["amount"] += amount
            aging["0-30"]["count"] += 1
            aging["0-30"]["invoices"].append(inv_summary)
        elif days_overdue <= 60:
            aging["31-60"]["amount"] += amount
            aging["31-60"]["count"] += 1
            aging["31-60"]["invoices"].append(inv_summary)
        elif days_overdue <= 90:
            aging["61-90"]["amount"] += amount
            aging["61-90"]["count"] += 1
            aging["61-90"]["invoices"].append(inv_summary)
        else:
            aging["90+"]["amount"] += amount
            aging["90+"]["count"] += 1
            aging["90+"]["invoices"].append(inv_summary)
    
    return aging

@api_router.put("/invoices/{invoice_id}")
async def update_invoice(invoice_id: str, invoice_data: InvoiceCreate, current_user: User = Depends(get_current_user)):
    """Update invoice and auto-post journal entry on status change to Finalized"""
    
    # Get existing invoice
    existing_invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not existing_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Phase 2: Validate and fetch category if provided
    if invoice_data.category_id:
        category = await db.category_master.find_one({"id": invoice_data.category_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Validate category is an Operating Inflow
        if category['cashflow_activity'] != "Operating" or category['cashflow_flow'] != "Inflow":
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category. Must be Operating Inflow."
            )
    
    update_data = invoice_data.model_dump()
    
    # Phase 2: Add COA account if category provided
    if invoice_data.category_id:
        update_data['coa_account'] = category['coa_account']
    
    # Phase 2: Check if status changed to "Finalized" and no journal entry exists
    old_status = existing_invoice.get('status', 'Draft')
    new_status = invoice_data.status
    has_journal = existing_invoice.get('journal_entry_id')
    
    if new_status == "Finalized" and old_status != "Finalized" and not has_journal:
        # Get customer for journal entry
        customer = await db.parties_customers.find_one({"id": invoice_data.customer_id}, {"_id": 0})
        if customer:
            # Auto-post journal entry
            journal = await create_invoice_journal_entry(
                invoice_id,
                {
                    'invoice_number': existing_invoice.get('invoice_number', ''),
                    'customer_name': customer['name'],
                    'invoice_date': invoice_data.invoice_date,
                    'base_amount': invoice_data.base_amount,
                    'gst_amount': invoice_data.gst_amount,
                    'total_amount': invoice_data.total_amount,
                    'coa_account': update_data.get('coa_account', 'Sales Revenue')
                },
                current_user.id
            )
            update_data['journal_entry_id'] = journal['id']
    
    result = await db.invoices.update_one(
        {"id": invoice_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found or no changes made")
    
    return {"message": "Invoice updated successfully", "journal_posted": bool(update_data.get('journal_entry_id'))}

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    """Delete invoice"""
    result = await db.invoices.delete_one({"id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted successfully"}


@api_router.get("/invoices/{invoice_id}/journal")
async def get_invoice_journal(invoice_id: str, current_user: User = Depends(get_current_user)):
    """Get journal entry for an invoice"""
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    journal_entry_id = invoice.get('journal_entry_id')
    if not journal_entry_id:
        return {"message": "No journal entry posted for this invoice", "journal_entry": None}
    
    journal = await db.journal_entries.find_one({"id": journal_entry_id}, {"_id": 0})
    return {"journal_entry": journal}

# ==================== BILL ROUTES ====================

@api_router.post("/bills", response_model=Bill)
async def create_bill(bill_data: BillCreate, current_user: User = Depends(get_current_user)):
    # Phase 2: Validate and fetch category
    category = await db.category_master.find_one({"id": bill_data.category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Validate category is an Operating Outflow
    if category['cashflow_activity'] != "Operating" or category['cashflow_flow'] != "Outflow":
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be Operating Outflow. Selected: {category['cashflow_activity']} - {category['cashflow_flow']}"
        )
    
    # Get vendor
    vendor = await db.parties_vendors.find_one({"id": bill_data.vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Generate bill number
    count = await db.bills.count_documents({})
    bill_number = f"BILL-{count + 2001}"
    
    bill = Bill(
        bill_number=bill_number,
        vendor_name=vendor['name'],
        amount_outstanding=bill_data.total_amount,
        coa_account=category['coa_account'],  # Phase 2: Set COA from category
        **bill_data.model_dump()
    )
    
    doc = bill.model_dump()
    doc['bill_date'] = doc['bill_date'].isoformat()
    doc['due_date'] = doc['due_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.bills.insert_one(doc)
    
    # Phase 2: Auto-post journal entry if status is "Approved"
    if bill_data.status == "Approved":
        journal = await create_bill_journal_entry(
            bill.id,
            {
                'bill_number': bill_number,
                'vendor_name': vendor['name'],
                'bill_date': bill.bill_date,
                'base_amount': bill.base_amount,
                'gst_amount': bill.gst_amount,
                'total_amount': bill.total_amount,
                'coa_account': category['coa_account']
            },
            current_user.id
        )
        
        # Update bill with journal_entry_id
        await db.bills.update_one(
            {"id": bill.id},
            {"$set": {"journal_entry_id": journal['id']}}
        )
        bill.journal_entry_id = journal['id']
    
    return bill

@api_router.get("/bills", response_model=List[Bill])
async def get_bills(current_user: User = Depends(get_current_user)):
    bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    for bill in bills:
        for date_field in ['bill_date', 'due_date', 'created_at']:
            if isinstance(bill.get(date_field), str):
                bill[date_field] = datetime.fromisoformat(bill[date_field])
    return bills

@api_router.get("/bills/{bill_id}/details")
async def get_bill_details(bill_id: str, current_user: User = Depends(get_current_user)):
    """Get complete bill details"""
    bill = await db.bills.find_one({"id": bill_id}, {"_id": 0})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Calculate days overdue
    now = datetime.now(timezone.utc)
    due_date = bill.get('due_date')
    if isinstance(due_date, str):
        due_date = datetime.fromisoformat(due_date)
    
    days_overdue = max(0, (now - due_date).days) if due_date else 0
    
    if days_overdue == 0:
        bucket = "Current"
    elif days_overdue <= 30:
        bucket = "0-30 Days"
    elif days_overdue <= 60:
        bucket = "31-60 Days"
    elif days_overdue <= 90:
        bucket = "61-90 Days"
    else:
        bucket = "90+ Days"
    
    return {
        "bill": bill,
        "days_overdue": days_overdue,
        "bucket": bucket
    }

@api_router.get("/bills/aging")
async def get_bill_aging(current_user: User = Depends(get_current_user)):
    bills = await db.bills.find({"status": {"$in": ["Pending", "Partially Paid"]}}, {"_id": 0}).to_list(1000)
    
    aging = {
        "0-30": {"amount": 0, "count": 0, "bills": []},
        "31-60": {"amount": 0, "count": 0, "bills": []},
        "61-90": {"amount": 0, "count": 0, "bills": []},
        "90+": {"amount": 0, "count": 0, "bills": []}
    }
    now = datetime.now(timezone.utc)
    
    for bill in bills:
        due_date = bill.get('due_date')
        if isinstance(due_date, str):
            due_date = datetime.fromisoformat(due_date)
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
        
        days_overdue = (now - due_date).days if due_date else 0
        amount = bill.get('amount_outstanding', 0)
        
        bill_summary = {
            "id": bill.get('id'),
            "bill_number": bill.get('bill_number'),
            "vendor_name": bill.get('vendor_name'),
            "amount": amount,
            "days_overdue": days_overdue
        }
        
        if days_overdue <= 30:
            aging["0-30"]["amount"] += amount
            aging["0-30"]["count"] += 1
            aging["0-30"]["bills"].append(bill_summary)
        elif days_overdue <= 60:
            aging["31-60"]["amount"] += amount
            aging["31-60"]["count"] += 1
            aging["31-60"]["bills"].append(bill_summary)
        elif days_overdue <= 90:
            aging["61-90"]["amount"] += amount
            aging["61-90"]["count"] += 1
            aging["61-90"]["bills"].append(bill_summary)
        else:
            aging["90+"]["amount"] += amount
            aging["90+"]["count"] += 1
            aging["90+"]["bills"].append(bill_summary)
    
    return aging

@api_router.put("/bills/{bill_id}")
async def update_bill(bill_id: str, bill_data: BillCreate, current_user: User = Depends(get_current_user)):
    """Update bill and auto-post journal entry on status change to Approved"""
    
    # Get existing bill
    existing_bill = await db.bills.find_one({"id": bill_id}, {"_id": 0})
    if not existing_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Phase 2: Validate and fetch category if provided
    if bill_data.category_id:
        category = await db.category_master.find_one({"id": bill_data.category_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Validate category is an Operating Outflow
        if category['cashflow_activity'] != "Operating" or category['cashflow_flow'] != "Outflow":
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category. Must be Operating Outflow."
            )
    
    update_data = bill_data.model_dump()
    
    # Phase 2: Add COA account if category provided
    if bill_data.category_id:
        update_data['coa_account'] = category['coa_account']
    
    # Phase 2: Check if status changed to "Approved" and no journal entry exists
    old_status = existing_bill.get('status', 'Draft')
    new_status = bill_data.status
    has_journal = existing_bill.get('journal_entry_id')
    
    if new_status == "Approved" and old_status != "Approved" and not has_journal:
        # Get vendor for journal entry
        vendor = await db.parties_vendors.find_one({"id": bill_data.vendor_id}, {"_id": 0})
        if vendor:
            # Auto-post journal entry
            journal = await create_bill_journal_entry(
                bill_id,
                {
                    'bill_number': existing_bill.get('bill_number', ''),
                    'vendor_name': vendor['name'],
                    'bill_date': bill_data.bill_date,
                    'base_amount': bill_data.base_amount,
                    'gst_amount': bill_data.gst_amount,
                    'total_amount': bill_data.total_amount,
                    'coa_account': update_data.get('coa_account', 'Expense')
                },
                current_user.id
            )
            update_data['journal_entry_id'] = journal['id']
    
    result = await db.bills.update_one(
        {"id": bill_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found or no changes made")
    
    return {"message": "Bill updated successfully", "journal_posted": bool(update_data.get('journal_entry_id'))}

@api_router.delete("/bills/{bill_id}")
async def delete_bill(bill_id: str, current_user: User = Depends(get_current_user)):
    """Delete bill"""
    result = await db.bills.delete_one({"id": bill_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"message": "Bill deleted successfully"}


@api_router.get("/bills/{bill_id}/journal")
async def get_bill_journal(bill_id: str, current_user: User = Depends(get_current_user)):
    """Get journal entry for a bill"""
    bill = await db.bills.find_one({"id": bill_id}, {"_id": 0})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    journal_entry_id = bill.get('journal_entry_id')
    if not journal_entry_id:
        return {"message": "No journal entry posted for this bill", "journal_entry": None}
    
    journal = await db.journal_entries.find_one({"id": journal_entry_id}, {"_id": 0})
    return {"journal_entry": journal}

# ==================== BANK ACCOUNT ROUTES ====================

@api_router.post("/bank-accounts", response_model=BankAccount)
async def create_bank_account(account_data: BankAccountCreate, current_user: User = Depends(get_current_user)):
    account = BankAccount(
        **account_data.model_dump(),
        current_balance=account_data.opening_balance
    )
    doc = account.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bank_accounts.insert_one(doc)
    return account

@api_router.get("/bank-accounts", response_model=List[BankAccount])
async def get_bank_accounts(current_user: User = Depends(get_current_user)):
    accounts = await db.bank_accounts.find({}, {"_id": 0}).to_list(100)
    for acc in accounts:
        if isinstance(acc.get('created_at'), str):
            acc['created_at'] = datetime.fromisoformat(acc['created_at'])
    return accounts

# ==================== TRANSACTION ROUTES ====================

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(trans_data: TransactionCreate, current_user: User = Depends(get_current_user)):
    # Get bank account
    account = await db.bank_accounts.find_one({"id": trans_data.bank_account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    transaction = Transaction(
        bank_name=account['bank_name'],
        **trans_data.model_dump()
    )
    
    # Update balance
    if trans_data.transaction_type == "Credit":
        new_balance = account['current_balance'] + trans_data.amount
    else:
        new_balance = account['current_balance'] - trans_data.amount
    
    transaction.balance = new_balance
    
    doc = transaction.model_dump()
    doc['transaction_date'] = doc['transaction_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.transactions.insert_one(doc)
    
    # Update bank account balance
    await db.bank_accounts.update_one(
        {"id": trans_data.bank_account_id},
        {"$set": {"current_balance": new_balance}}
    )
    
    return transaction

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({}, {"_id": 0}).sort("transaction_date", -1).to_list(1000)
    for trans in transactions:
        for date_field in ['transaction_date', 'created_at']:
            if isinstance(trans.get(date_field), str):
                trans[date_field] = datetime.fromisoformat(trans[date_field])
    return transactions

@api_router.get("/transactions/{transaction_id}/match-suggestions")
async def get_match_suggestions(transaction_id: str, current_user: User = Depends(get_current_user)):
    """Get invoice/bill suggestions for transaction matching"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    amount = transaction.get('amount', 0)
    trans_type = transaction.get('transaction_type')
    
    suggestions = []
    
    if trans_type == "Credit":
        # Match with unpaid invoices
        invoices = await db.invoices.find({
            "status": {"$in": ["Unpaid", "Partially Paid"]},
            "amount_outstanding": {"$gte": amount * 0.95, "$lte": amount * 1.05}  # ±5% tolerance
        }, {"_id": 0}).to_list(50)
        
        for inv in invoices:
            suggestions.append({
                "type": "invoice",
                "id": inv['id'],
                "reference": inv['invoice_number'],
                "party": inv['customer_name'],
                "amount": inv['amount_outstanding'],
                "match_score": 100 - abs(amount - inv['amount_outstanding']) / amount * 100
            })
    
    elif trans_type == "Debit":
        # Match with pending bills
        bills = await db.bills.find({
            "status": {"$in": ["Pending", "Partially Paid"]},
            "amount_outstanding": {"$gte": amount * 0.95, "$lte": amount * 1.05}
        }, {"_id": 0}).to_list(50)
        
        for bill in bills:
            suggestions.append({
                "type": "bill",
                "id": bill['id'],
                "reference": bill['bill_number'],
                "party": bill['vendor_name'],
                "amount": bill['amount_outstanding'],
                "match_score": 100 - abs(amount - bill['amount_outstanding']) / amount * 100
            })
    
    # Sort by match score
    suggestions.sort(key=lambda x: x['match_score'], reverse=True)
    
    return suggestions[:10]  # Top 10 matches

@api_router.post("/transactions/{transaction_id}/match")
async def match_transaction(
    transaction_id: str,
    entity_type: str,  # "invoice" or "bill"
    entity_id: str,
    current_user: User = Depends(get_current_user)
):
    """Match transaction with invoice or bill"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    amount = transaction.get('amount', 0)
    
    if entity_type == "invoice":
        invoice = await db.invoices.find_one({"id": entity_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Update invoice
        new_received = invoice['amount_received'] + amount
        # Calculate net receivable for accurate status
        net_receivable = invoice['total_amount'] - invoice.get('tds_amount', 0)
        new_outstanding = net_receivable - new_received
        
        # Fix status logic
        if new_received == 0:
            new_status = "Unpaid"
        elif new_outstanding <= 0:
            new_status = "Paid"
        else:
            new_status = "Partially Paid"
        
        # Prepare update data
        update_data = {
            "amount_received": new_received,
            "amount_outstanding": max(0, new_outstanding),
            "status": new_status
        }
        
        # Set payment_date when invoice is fully paid
        if new_status == "Paid":
            update_data["payment_date"] = datetime.now(timezone.utc)
        
        await db.invoices.update_one(
            {"id": entity_id},
            {"$set": update_data}
        )
        
        # Update transaction
        await db.transactions.update_one(
            {"id": transaction_id},
            {
                "$set": {
                    "status": "Matched",
                    "linked_entity": f"Invoice {invoice['invoice_number']}",
                    "entity_id": entity_id,
                    "entity_type": "invoice"
                }
            }
        )
        
        # Add activity
        await db.invoice_activities.insert_one({
            "id": str(uuid.uuid4()),
            "invoice_id": entity_id,
            "activity_type": "payment_received",
            "comment": f"Payment received ₹{amount:,.2f} via {transaction['description']}",
            "user": current_user.full_name,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    elif entity_type == "bill":
        bill = await db.bills.find_one({"id": entity_id}, {"_id": 0})
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        # Update bill
        new_paid = bill['amount_paid'] + amount
        new_outstanding = bill['total_amount'] - new_paid
        new_status = "Paid" if new_outstanding <= 0 else "Partially Paid"
        
        await db.bills.update_one(
            {"id": entity_id},
            {
                "$set": {
                    "amount_paid": new_paid,
                    "amount_outstanding": max(0, new_outstanding),
                    "status": new_status
                }
            }
        )
        
        # Update transaction
        await db.transactions.update_one(
            {"id": transaction_id},
            {
                "$set": {
                    "status": "Matched",
                    "linked_entity": f"Bill {bill['bill_number']}",
                    "entity_id": entity_id,
                    "entity_type": "bill"
                }
            }
        )
    
    return {"message": "Transaction matched successfully"}


@api_router.put("/bank-accounts/{account_id}")
async def update_bank_account(account_id: str, account_data: dict, current_user: User = Depends(get_current_user)):
    """Update bank account details"""
    account = await db.bank_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    # Update only allowed fields
    allowed_fields = ['bank_name', 'account_type', 'ifsc', 'branch']
    update_data = {k: v for k, v in account_data.items() if k in allowed_fields}
    
    await db.bank_accounts.update_one(
        {"id": account_id},
        {"$set": update_data}
    )
    
    return {"message": "Bank account updated successfully"}

@api_router.delete("/bank-accounts/{account_id}")
async def delete_bank_account(account_id: str, current_user: User = Depends(get_current_user)):
    """Delete bank account and all its transactions"""
    account = await db.bank_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    # Delete all transactions for this account
    await db.transactions.delete_many({"bank_account_id": account_id})
    
    # Delete the account
    await db.bank_accounts.delete_one({"id": account_id})
    
    return {"message": "Bank account and transactions deleted successfully"}

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, current_user: User = Depends(get_current_user)):
    """Delete a transaction (only if not reconciled)"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.get('is_reconciled'):
        raise HTTPException(status_code=400, detail="Cannot delete reconciled transaction. Please de-reconcile first.")
    
    # Update bank balance
    account = await db.bank_accounts.find_one({"id": transaction['bank_account_id']}, {"_id": 0})
    if account:
        if transaction['transaction_type'] == "Credit":
            new_balance = account['current_balance'] - transaction['amount']
        else:
            new_balance = account['current_balance'] + transaction['amount']
        
        await db.bank_accounts.update_one(
            {"id": transaction['bank_account_id']},
            {"$set": {"current_balance": new_balance}}
        )
    
    # Delete the transaction
    await db.transactions.delete_one({"id": transaction_id})
    
    return {"message": "Transaction deleted successfully"}

@api_router.post("/transactions/reconcile")
async def reconcile_transactions(transaction_ids: List[str], period: dict, current_user: User = Depends(get_current_user)):
    """Reconcile multiple transactions"""
    for trans_id in transaction_ids:
        await db.transactions.update_one(
            {"id": trans_id},
            {"$set": {"is_reconciled": True, "reconciled_date": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": f"Successfully reconciled {len(transaction_ids)} transactions"}

@api_router.post("/transactions/{transaction_id}/de-reconcile")
async def de_reconcile_transaction(transaction_id: str, current_user: User = Depends(get_current_user)):
    """De-reconcile a transaction"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {"is_reconciled": False}, "$unset": {"reconciled_date": ""}}
    )
    
    return {"message": "Transaction de-reconciled successfully"}

@api_router.get("/transactions/{transaction_id}/match-suggestions-enhanced")
async def get_enhanced_match_suggestions(transaction_id: str, current_user: User = Depends(get_current_user)):
    """Enhanced AI matching - prioritizes description text matching with customer/vendor names, then amount"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    amount = transaction.get('amount', 0)
    trans_type = transaction.get('transaction_type')
    description = transaction.get('description', '').lower()
    
    def calculate_name_match_score(name, description):
        """Calculate how well a name matches the description using fuzzy logic"""
        name_lower = name.lower()
        
        # Exact full name match
        if name_lower in description:
            return 100
        
        # Split name into words and check partial matches
        name_words = set(name_lower.split())
        desc_words = set(description.split())
        
        # Calculate word overlap
        if name_words:
            common_words = name_words.intersection(desc_words)
            word_overlap_ratio = len(common_words) / len(name_words)
            
            if word_overlap_ratio >= 0.8:  # 80% words match
                return 95
            elif word_overlap_ratio >= 0.6:  # 60% words match
                return 85
            elif word_overlap_ratio >= 0.4:  # 40% words match
                return 70
            elif word_overlap_ratio > 0:  # Any words match
                return 50
        
        # Check for substring matches (for abbreviations)
        for word in name_words:
            if len(word) >= 3:  # Only check meaningful words
                for desc_word in desc_words:
                    if word in desc_word or desc_word in word:
                        return 40
        
        return 0
    
    suggestions = []
    
    if trans_type == "Credit":
        # Match with unpaid invoices - prioritize customer name matching
        invoices = await db.invoices.find({
            "status": {"$in": ["Unpaid", "Partially Paid"]}
        }, {"_id": 0}).to_list(100)
        
        # First, identify potential customers from description
        customer_matches = []
        
        for inv in invoices:
            customer_name = inv.get('customer_name', '')
            invoice_amount = inv.get('amount_outstanding', 0)
            invoice_date = inv.get('invoice_date')
            
            # Calculate name match score (70% weight for description matching)
            name_match = calculate_name_match_score(customer_name, description)
            
            # Calculate amount match score (30% weight)
            amount_match = 0
            if invoice_amount > 0:
                amount_diff = abs(amount - invoice_amount) / invoice_amount
                if amount_diff == 0:
                    amount_match = 100
                elif amount_diff <= 0.02:  # Within 2%
                    amount_match = 98
                elif amount_diff <= 0.05:  # Within 5%
                    amount_match = 95
                elif amount_diff <= 0.10:  # Within 10%
                    amount_match = 85
                elif amount_diff <= 0.20:  # Within 20%
                    amount_match = 70
                else:
                    amount_match = max(0, 50 - (amount_diff * 50))
            
            # Weighted match score: 70% name, 30% amount
            match_score = (name_match * 0.7) + (amount_match * 0.3)
            
            # If name matches well (>50%), show even if amount doesn't match perfectly
            # This allows matching by customer first, then amount
            if name_match >= 50 or match_score > 25:
                suggestions.append({
                    "type": "invoice",
                    "id": inv['id'],
                    "reference": inv['invoice_number'],
                    "party": inv['customer_name'],
                    "amount": inv['total_amount'],
                    "pending_amount": invoice_amount,
                    "date": invoice_date,
                    "match_score": round(match_score, 1),
                    "name_match": round(name_match, 1),
                    "amount_match": round(amount_match, 1),
                    "match_reason": "Customer name found in description" if name_match >= 50 else "Amount similarity"
                })
    
    elif trans_type == "Debit":
        # Match with pending bills - prioritize vendor name matching
        bills = await db.bills.find({
            "status": {"$in": ["Pending", "Partially Paid"]}
        }, {"_id": 0}).to_list(100)
        
        for bill in bills:
            vendor_name = bill.get('vendor_name', '')
            bill_amount = bill.get('amount_outstanding', 0)
            bill_date = bill.get('bill_date')
            
            # Calculate name match score (70% weight for description matching)
            name_match = calculate_name_match_score(vendor_name, description)
            
            # Calculate amount match score (30% weight)
            amount_match = 0
            if bill_amount > 0:
                amount_diff = abs(amount - bill_amount) / bill_amount
                if amount_diff == 0:
                    amount_match = 100
                elif amount_diff <= 0.02:
                    amount_match = 98
                elif amount_diff <= 0.05:
                    amount_match = 95
                elif amount_diff <= 0.10:
                    amount_match = 85
                elif amount_diff <= 0.20:
                    amount_match = 70
                else:
                    amount_match = max(0, 50 - (amount_diff * 50))
            
            # Weighted match score: 70% name, 30% amount
            match_score = (name_match * 0.7) + (amount_match * 0.3)
            
            # If name matches well (>50%), show even if amount doesn't match perfectly
            if name_match >= 50 or match_score > 25:
                suggestions.append({
                    "type": "bill",
                    "id": bill['id'],
                    "reference": bill['bill_number'],
                    "party": bill['vendor_name'],
                    "amount": bill['total_amount'],
                    "pending_amount": bill_amount,
                    "date": bill_date,
                    "match_score": round(match_score, 1),
                    "name_match": round(name_match, 1),
                    "amount_match": round(amount_match, 1),
                    "match_reason": "Vendor name found in description" if name_match >= 50 else "Amount similarity"
                })
    
    # Sort by match score (highest first), then by name match
    suggestions.sort(key=lambda x: (x['match_score'], x.get('name_match', 0)), reverse=True)
    
    return suggestions[:20]  # Top 20 matches

@api_router.post("/transactions/{transaction_id}/match-manual")
async def match_transaction_manual(
    transaction_id: str,
    matches: List[dict],  # [{"entity_type": "invoice", "entity_id": "inv-123", "amount": 50000}]
    current_user: User = Depends(get_current_user)
):
    """Manual matching with multiple invoices/bills"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    trans_amount = transaction.get('amount', 0)
    total_matched = sum(m.get('amount', 0) for m in matches)
    
    if total_matched > trans_amount:
        raise HTTPException(status_code=400, detail="Total matched amount exceeds transaction amount")
    
    matched_entities = []
    
    for match in matches:
        entity_type = match.get('entity_type')
        entity_id = match.get('entity_id')
        match_amount = match.get('amount', 0)
        
        if entity_type == "invoice":
            invoice = await db.invoices.find_one({"id": entity_id}, {"_id": 0})
            if not invoice:
                continue
            
            # Update invoice
            new_received = invoice['amount_received'] + match_amount
            # Calculate net receivable for accurate status
            net_receivable = invoice['total_amount'] - invoice.get('tds_amount', 0)
            new_outstanding = net_receivable - new_received
            
            # Fix status logic
            if new_received == 0:
                new_status = "Unpaid"
            elif new_outstanding <= 0:
                new_status = "Paid"
            else:
                new_status = "Partially Paid"
            
            # Prepare update data
            update_data = {
                "amount_received": new_received,
                "amount_outstanding": max(0, new_outstanding),
                "status": new_status
            }
            
            # Set payment_date when invoice is fully paid
            if new_status == "Paid":
                update_data["payment_date"] = datetime.now(timezone.utc)
            
            await db.invoices.update_one(
                {"id": entity_id},
                {"$set": update_data}
            )
            
            matched_entities.append(f"Invoice {invoice['invoice_number']}")
            
            # Add activity
            await db.invoice_activities.insert_one({
                "id": str(uuid.uuid4()),
                "invoice_id": entity_id,
                "activity_type": "payment_received",
                "comment": f"Payment received ₹{match_amount:,.2f} via {transaction['description']}",
                "user": current_user.full_name,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        elif entity_type == "bill":
            bill = await db.bills.find_one({"id": entity_id}, {"_id": 0})
            if not bill:
                continue
            
            # Update bill
            new_paid = bill['amount_paid'] + match_amount
            new_outstanding = bill['total_amount'] - new_paid
            new_status = "Paid" if new_outstanding <= 0 else "Partially Paid"
            
            await db.bills.update_one(
                {"id": entity_id},
                {
                    "$set": {
                        "amount_paid": new_paid,
                        "amount_outstanding": max(0, new_outstanding),
                        "status": new_status
                    }
                }
            )
            
            matched_entities.append(f"Bill {bill['bill_number']}")
    
    # Update transaction status
    if total_matched == trans_amount:
        status = "Matched"
    elif total_matched > 0:
        status = "Partially Matched"
    else:
        status = "Pending"
    
    await db.transactions.update_one(
        {"id": transaction_id},
        {
            "$set": {
                "status": status,
                "matched_amount": total_matched,
                "linked_entity": ", ".join(matched_entities) if matched_entities else None
            }
        }
    )
    
    return {
        "message": "Transaction matched successfully",
        "matched_count": len(matched_entities),
        "total_matched": total_matched,
        "status": status
    }

@api_router.post("/transactions/{transaction_id}/dematch")
async def dematch_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
):
    """Dematch/uncategorize a matched transaction"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.get('status') not in ['Matched', 'Partially Matched']:
        raise HTTPException(status_code=400, detail="Transaction is not matched")
    
    # Get the linked entity info from transaction
    linked_entity = transaction.get('linked_entity', '')
    amount = transaction.get('amount', 0)
    entity_id = transaction.get('entity_id')  # If stored
    entity_type = transaction.get('entity_type')  # If stored
    
    # Reverse the matching - decrease amount_received
    if 'Invoice' in linked_entity or entity_type == 'invoice':
        # Find the invoice by searching for it
        if entity_id:
            invoice = await db.invoices.find_one({"id": entity_id}, {"_id": 0})
        else:
            # Try to find by invoice number from linked_entity string
            invoice_number = linked_entity.replace('Invoice ', '').strip()
            invoice = await db.invoices.find_one({"invoice_number": invoice_number}, {"_id": 0})
        
        if invoice:
            # Reverse the payment
            new_received = max(0, invoice['amount_received'] - amount)
            net_receivable = invoice['total_amount'] - invoice.get('tds_amount', 0)
            new_outstanding = net_receivable - new_received
            
            # Update status
            if new_received == 0:
                new_status = "Unpaid"
            elif new_outstanding <= 0:
                new_status = "Paid"
            else:
                new_status = "Partially Paid"
            
            # Prepare update - remove payment_date if going back to unpaid/partially paid
            update_data = {
                "amount_received": new_received,
                "amount_outstanding": max(0, new_outstanding),
                "status": new_status
            }
            
            if new_status != "Paid":
                update_data["payment_date"] = None
            
            await db.invoices.update_one(
                {"id": invoice['id']},
                {"$set": update_data}
            )
            
            # Add activity
            await db.invoice_activities.insert_one({
                "id": str(uuid.uuid4()),
                "invoice_id": invoice['id'],
                "activity_type": "payment_reversed",
                "comment": f"Payment dematched ₹{amount:,.2f} from transaction",
                "user": current_user.full_name,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    
    elif 'Bill' in linked_entity or entity_type == 'bill':
        # Find the bill
        if entity_id:
            bill = await db.bills.find_one({"id": entity_id}, {"_id": 0})
        else:
            bill_number = linked_entity.replace('Bill ', '').strip()
            bill = await db.bills.find_one({"bill_number": bill_number}, {"_id": 0})
        
        if bill:
            # Reverse the payment
            new_paid = max(0, bill['amount_paid'] - amount)
            new_outstanding = bill['total_amount'] - new_paid
            
            if new_paid == 0:
                new_status = "Pending"
            elif new_outstanding <= 0:
                new_status = "Paid"
            else:
                new_status = "Partially Paid"
            
            await db.bills.update_one(
                {"id": bill['id']},
                {"$set": {
                    "amount_paid": new_paid,
                    "amount_outstanding": max(0, new_outstanding),
                    "status": new_status
                }}
            )
    
    # Update transaction to uncategorized
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {
            "status": "Uncategorized",
            "linked_entity": None,
            "entity_id": None,
            "entity_type": None
        }}
    )
    
    return {"message": "Transaction dematched successfully", "transaction_id": transaction_id}

@api_router.get("/transactions/{transaction_id}/details")
async def get_transaction_details(transaction_id: str, current_user: User = Depends(get_current_user)):
    """Get transaction details with matched invoices/bills"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # If matched, get the matched entities details
    matched_details = []
    if transaction.get('status') in ['Matched', 'Partially Matched']:
        # This is a simplified version - in production, store entity IDs in transaction
        # For now, return the linked_entity string
        matched_details = [{
            "reference": transaction.get('linked_entity', 'N/A'),
            "amount": transaction.get('matched_amount', transaction.get('amount'))
        }]
    
    return {
        **transaction,
        "matched_details": matched_details
    }


# ==================== PAYMENTS ROUTES ====================

@api_router.get("/payments")
async def get_payments_due(current_user: User = Depends(get_current_user)):
    """Get all bills due for payment"""
    now = datetime.now(timezone.utc)
    
    # Get all pending and partially paid bills
    bills = await db.bills.find({"status": {"$in": ["Pending", "Partially Paid"]}}, {"_id": 0}).to_list(1000)
    
    payments = []
    for bill in bills:
        due_date = bill.get('due_date')
        if isinstance(due_date, str):
            due_date = datetime.fromisoformat(due_date)
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
        
        days_overdue = (now - due_date).days if due_date else 0
        
        # Get payment status
        payment_status = await db.payment_status.find_one({"bill_id": bill['id']}, {"_id": 0})
        
        payments.append({
            **bill,
            "days_overdue": days_overdue,
            "payment_status": payment_status.get('status', 'Pending') if payment_status else 'Pending',
            "last_follow_up": payment_status.get('last_follow_up') if payment_status else None,
            "scheduled_payment_date": payment_status.get('scheduled_date') if payment_status else None
        })
    
    # Sort by days overdue (descending)
    payments.sort(key=lambda x: x.get('days_overdue', 0), reverse=True)
    
    return payments

@api_router.post("/payments/{bill_id}/status")
async def update_payment_status(
    bill_id: str,
    status: str,
    comment: str,
    scheduled_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Update payment status for a bill"""
    now = datetime.now(timezone.utc)
    
    update_data = {
        "bill_id": bill_id,
        "status": status,
        "last_follow_up": now.isoformat(),
        "updated_by": current_user.full_name,
        "updated_at": now.isoformat()
    }
    
    if scheduled_date:
        update_data["scheduled_date"] = scheduled_date
    
    await db.payment_status.update_one(
        {"bill_id": bill_id},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "Payment status updated successfully"}

# ==================== COLLECTIONS ROUTES ====================

@api_router.get("/collections")
async def get_collections(current_user: User = Depends(get_current_user)):
    """Get all invoices due for collection"""
    now = datetime.now(timezone.utc)
    
    # Get all unpaid and partially paid invoices
    invoices = await db.invoices.find({"status": {"$in": ["Unpaid", "Partially Paid"]}}, {"_id": 0}).to_list(1000)
    
    collections = []
    for inv in invoices:
        due_date = inv.get('due_date')
        if isinstance(due_date, str):
            due_date = datetime.fromisoformat(due_date)
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
        
        days_overdue = (now - due_date).days if due_date else 0
        
        # Get collection status
        collection_status = await db.collection_status.find_one({"invoice_id": inv['id']}, {"_id": 0})
        
        collections.append({
            **inv,
            "days_overdue": days_overdue,
            "collection_status": collection_status.get('status', 'Pending') if collection_status else 'Pending',
            "last_follow_up": collection_status.get('last_follow_up') if collection_status else None,
            "next_follow_up": collection_status.get('next_follow_up') if collection_status else None
        })
    
    # Sort by days overdue (descending)
    collections.sort(key=lambda x: x.get('days_overdue', 0), reverse=True)
    
    return collections

@api_router.post("/collections/{invoice_id}/status")
async def update_collection_status(
    invoice_id: str,
    status: str,
    comment: str,
    current_user: User = Depends(get_current_user)
):
    """Update collection status for an invoice"""
    now = datetime.now(timezone.utc)
    
    # Update or create collection status
    await db.collection_status.update_one(
        {"invoice_id": invoice_id},
        {
            "$set": {
                "invoice_id": invoice_id,
                "status": status,
                "last_follow_up": now.isoformat(),
                "updated_by": current_user.full_name,
                "updated_at": now.isoformat()
            }
        },
        upsert=True
    )
    
    # Add to activity log
    await db.invoice_activities.insert_one({
        "id": str(uuid.uuid4()),
        "invoice_id": invoice_id,
        "activity_type": "status_change",
        "status": status,
        "comment": comment,
        "user": current_user.full_name,
        "created_at": now.isoformat()
    })
    
    return {"message": "Collection status updated successfully"}

# ==================== CASH FLOW ROUTES ====================

@api_router.get("/cashflow/summary")
async def get_cashflow_summary(current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # Actual inflows
    actual_inflows = await db.cash_flow.find({
        "type": "Inflow",
        "is_actual": True,
        "date": {"$gte": thirty_days_ago}
    }, {"_id": 0}).to_list(1000)
    
    # Actual outflows
    actual_outflows = await db.cash_flow.find({
        "type": "Outflow",
        "is_actual": True,
        "date": {"$gte": thirty_days_ago}
    }, {"_id": 0}).to_list(1000)
    
    # Expected inflows (from unpaid invoices)
    unpaid_invoices = await db.invoices.find({
        "status": {"$in": ["Unpaid", "Partially Paid"]}
    }, {"_id": 0}).to_list(1000)
    
    expected_inflow = sum(inv.get('amount_outstanding', 0) for inv in unpaid_invoices)
    
    # Expected outflows (from pending bills)
    pending_bills = await db.bills.find({
        "status": {"$in": ["Pending", "Partially Paid"]}
    }, {"_id": 0}).to_list(1000)
    
    expected_outflow = sum(bill.get('amount_outstanding', 0) for bill in pending_bills)
    
    # Bank balance
    bank_accounts = await db.bank_accounts.find({"status": "Active"}, {"_id": 0}).to_list(100)
    opening_balance = sum(acc.get('opening_balance', 0) for acc in bank_accounts)
    current_balance = sum(acc.get('current_balance', 0) for acc in bank_accounts)
    
    total_actual_inflow = sum(cf.get('amount', 0) for cf in actual_inflows)
    total_actual_outflow = sum(cf.get('amount', 0) for cf in actual_outflows)
    
    return {
        "opening_balance": opening_balance,
        "actual_inflow": total_actual_inflow,
        "actual_outflow": total_actual_outflow,
        "net_actual_flow": total_actual_inflow - total_actual_outflow,
        "expected_inflow_30d": expected_inflow * 0.3,
        "expected_inflow_60d": expected_inflow * 0.6,
        "expected_inflow_90d": expected_inflow,
        "expected_outflow_30d": expected_outflow * 0.4,
        "expected_outflow_60d": expected_outflow * 0.7,
        "expected_outflow_90d": expected_outflow,
        "projected_closing_balance": current_balance + (expected_inflow * 0.3) - (expected_outflow * 0.4),
        "runway_days": (current_balance / (total_actual_outflow / 30)) if total_actual_outflow > 0 else 999
    }

@api_router.get("/cashflow/forecast")
async def get_cashflow_forecast(current_user: User = Depends(get_current_user)):
    """Get 3-month cash flow forecast"""
    # Get bank balance
    bank_accounts = await db.bank_accounts.find({"status": "Active"}, {"_id": 0}).to_list(100)
    current_balance = sum(acc.get('current_balance', 0) for acc in bank_accounts)
    
    # Get outstanding invoices
    unpaid_invoices = await db.invoices.find({
        "status": {"$in": ["Unpaid", "Partially Paid"]}
    }, {"_id": 0}).to_list(1000)
    expected_inflow_total = sum(inv.get('amount_outstanding', 0) for inv in unpaid_invoices)
    
    # Get pending bills
    pending_bills = await db.bills.find({
        "status": {"$in": ["Pending", "Partially Paid"]}
    }, {"_id": 0}).to_list(1000)
    expected_outflow_total = sum(bill.get('amount_outstanding', 0) for bill in pending_bills)
    
    # Calculate monthly forecast
    month_1_inflow = expected_inflow_total * 0.30
    month_1_outflow = expected_outflow_total * 0.40
    month_1_net = month_1_inflow - month_1_outflow
    month_1_closing = current_balance + month_1_net
    
    month_2_inflow = expected_inflow_total * 0.30
    month_2_outflow = expected_outflow_total * 0.30
    month_2_net = month_2_inflow - month_2_outflow
    month_2_closing = month_1_closing + month_2_net
    
    month_3_inflow = expected_inflow_total * 0.25
    month_3_outflow = expected_outflow_total * 0.25
    month_3_net = month_3_inflow - month_3_outflow
    month_3_closing = month_2_closing + month_3_net
    
    return {
        "current_balance": current_balance,
        "projected_balance_90d": month_3_closing,
        "month_1": {
            "expected_inflow": month_1_inflow,
            "expected_outflow": month_1_outflow,
            "net_flow": month_1_net,
            "closing_balance": month_1_closing,
            "confidence": 85
        },
        "month_2": {
            "expected_inflow": month_2_inflow,
            "expected_outflow": month_2_outflow,
            "net_flow": month_2_net,
            "closing_balance": month_2_closing,
            "confidence": 70
        },
        "month_3": {
            "expected_inflow": month_3_inflow,
            "expected_outflow": month_3_outflow,
            "net_flow": month_3_net,
            "closing_balance": month_3_closing,
            "confidence": 55
        },
        "ai_insights": None
    }

@api_router.post("/cashflow/forecast/generate")
async def generate_ai_forecast(current_user: User = Depends(get_current_user)):
    """Generate AI-powered cash flow forecast"""
    try:
        # Get the base forecast data
        base_forecast = await get_cashflow_forecast(current_user)
        
        # Get historical data for AI analysis
        invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
        bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
        transactions = await db.transactions.find({}, {"_id": 0}).to_list(1000)
        
        # Prepare context for AI
        context = f"""
        Analyze the following financial data and provide 3-5 key insights about cash flow forecast:
        
        Current Cash Balance: ₹{base_forecast['current_balance']:,.0f}
        
        3-Month Forecast:
        - Month 1: Inflow ₹{base_forecast['month_1']['expected_inflow']:,.0f}, Outflow ₹{base_forecast['month_1']['expected_outflow']:,.0f}, Net ₹{base_forecast['month_1']['net_flow']:,.0f}
        - Month 2: Inflow ₹{base_forecast['month_2']['expected_inflow']:,.0f}, Outflow ₹{base_forecast['month_2']['expected_outflow']:,.0f}, Net ₹{base_forecast['month_2']['net_flow']:,.0f}
        - Month 3: Inflow ₹{base_forecast['month_3']['expected_inflow']:,.0f}, Outflow ₹{base_forecast['month_3']['expected_outflow']:,.0f}, Net ₹{base_forecast['month_3']['net_flow']:,.0f}
        
        Outstanding Invoices: {len([i for i in invoices if i.get('status') in ['Unpaid', 'Partially Paid']])}
        Pending Bills: {len([b for b in bills if b.get('status') in ['Pending', 'Partially Paid']])}
        
        Provide specific, actionable insights about:
        1. Cash flow health and trends
        2. Potential risks or concerns
        3. Opportunities for improvement
        4. Recommendations for better cash management
        """
        
        # Get AI insights
        ai_insights_text = await generate_ai_insight(context)
        
        # Split into bullet points
        insights = [insight.strip() for insight in ai_insights_text.split('\n') if insight.strip() and len(insight.strip()) > 20]
        base_forecast['ai_insights'] = insights[:5]
        
        return base_forecast
    
    except Exception as e:
        logger.error(f"AI forecast generation failed: {str(e)}")
        # Return base forecast without AI insights
        return await get_cashflow_forecast(current_user)

@api_router.get("/cashflow/variance")
async def get_cashflow_variance(period: str = "monthly", current_user: User = Depends(get_current_user)):
    """Get budget vs actual variance analysis"""
    try:
        # Validate period parameter
        valid_periods = ["monthly", "quarterly", "yearly"]
        if period not in valid_periods:
            raise HTTPException(status_code=400, detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}")
        
        # For MVP, we'll create sample variance data
        # In production, this would compare against actual budget entries
        
        # Get actual data
        now = datetime.now(timezone.utc)
        period_days = 30 if period == "monthly" else (90 if period == "quarterly" else 365)
        start_date = now - timedelta(days=period_days)
        
        # Actual inflows
        actual_inflows = await db.cash_flow.find({
            "type": "Inflow",
            "is_actual": True,
            "date": {"$gte": start_date}
        }, {"_id": 0}).to_list(1000)
        
        actual_outflows = await db.cash_flow.find({
            "type": "Outflow",
            "is_actual": True,
            "date": {"$gte": start_date}
        }, {"_id": 0}).to_list(1000)
        
        total_actual_inflow = sum(cf.get('amount', 0) for cf in actual_inflows)
        total_actual_outflow = sum(cf.get('amount', 0) for cf in actual_outflows)
        
        # Generate budgeted amounts (in production, fetch from budget collection)
        budget_inflow = total_actual_inflow * 1.1  # Assume budget was 10% higher
        budget_outflow = total_actual_outflow * 0.95  # Assume budget was 5% lower
        
        inflow_variance = total_actual_inflow - budget_inflow
        outflow_variance = total_actual_outflow - budget_outflow
        
        inflow_variance_pct = (inflow_variance / budget_inflow * 100) if budget_inflow > 0 else 0
        outflow_variance_pct = (outflow_variance / budget_outflow * 100) if budget_outflow > 0 else 0
        
        # Category breakdown (sample data for MVP)
        inflow_categories = [
            {
                "category": "Customer Payments",
                "budgeted": budget_inflow * 0.7,
                "actual": total_actual_inflow * 0.7,
                "variance": (total_actual_inflow * 0.7) - (budget_inflow * 0.7),
                "variance_pct": ((total_actual_inflow * 0.7) - (budget_inflow * 0.7)) / (budget_inflow * 0.7) * 100 if budget_inflow > 0 else 0
            },
            {
                "category": "Other Income",
                "budgeted": budget_inflow * 0.3,
                "actual": total_actual_inflow * 0.3,
                "variance": (total_actual_inflow * 0.3) - (budget_inflow * 0.3),
                "variance_pct": ((total_actual_inflow * 0.3) - (budget_inflow * 0.3)) / (budget_inflow * 0.3) * 100 if budget_inflow > 0 else 0
            }
        ]
        
        outflow_categories = [
            {
                "category": "Vendor Payments",
                "budgeted": budget_outflow * 0.6,
                "actual": total_actual_outflow * 0.6,
                "variance": (total_actual_outflow * 0.6) - (budget_outflow * 0.6),
                "variance_pct": ((total_actual_outflow * 0.6) - (budget_outflow * 0.6)) / (budget_outflow * 0.6) * 100 if budget_outflow > 0 else 0
            },
            {
                "category": "Operating Expenses",
                "budgeted": budget_outflow * 0.4,
                "actual": total_actual_outflow * 0.4,
                "variance": (total_actual_outflow * 0.4) - (budget_outflow * 0.4),
                "variance_pct": ((total_actual_outflow * 0.4) - (budget_outflow * 0.4)) / (budget_outflow * 0.4) * 100 if budget_outflow > 0 else 0
            }
        ]
        
        # Calculate accuracies
        inflow_accuracy = 100 - min(abs(inflow_variance_pct), 100)
        outflow_accuracy = 100 - min(abs(outflow_variance_pct), 100)
        
        # Count categories by status
        all_categories = inflow_categories + outflow_categories
        categories_on_track = len([c for c in all_categories if abs(c['variance_pct']) < 5])
        categories_to_monitor = len([c for c in all_categories if 5 <= abs(c['variance_pct']) < 15])
        categories_at_risk = len([c for c in all_categories if abs(c['variance_pct']) >= 15])
        
        # Generate AI analysis
        try:
            context = f"""
            Analyze this budget variance data and provide:
            1. A brief summary (2-3 sentences) of the variance situation
            2. 3-4 specific recommendations for improvement
            
            Period: {period}
            Inflow Variance: {inflow_variance_pct:.1f}%
            Outflow Variance: {outflow_variance_pct:.1f}%
            Categories on track: {categories_on_track}
            Categories at risk: {categories_at_risk}
            """
            
            ai_text = await generate_ai_insight(context)
            
            # Parse summary and recommendations
            lines = [l.strip() for l in ai_text.split('\n') if l.strip()]
            summary = ' '.join(lines[:3])
            recommendations = [l for l in lines[3:] if len(l) > 20][:4]
            
            ai_analysis = {
                "summary": summary,
                "recommendations": recommendations
            }
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            ai_analysis = {
                "summary": "Variance analysis completed. Review the detailed breakdown above.",
                "recommendations": ["Monitor cash flow regularly", "Improve budget accuracy", "Review category performance"]
            }
        
        return {
            "period": period,
            "budget_inflow": budget_inflow,
            "actual_inflow": total_actual_inflow,
            "inflow_variance": inflow_variance,
            "inflow_variance_pct": inflow_variance_pct,
            "budget_outflow": budget_outflow,
            "actual_outflow": total_actual_outflow,
            "outflow_variance": outflow_variance,
            "outflow_variance_pct": outflow_variance_pct,
            "budget_net_flow": budget_inflow - budget_outflow,
            "actual_net_flow": total_actual_inflow - total_actual_outflow,
            "net_variance_pct": ((total_actual_inflow - total_actual_outflow) - (budget_inflow - budget_outflow)) / (budget_inflow - budget_outflow) * 100 if (budget_inflow - budget_outflow) != 0 else 0,
            "inflow_categories": inflow_categories,
            "outflow_categories": outflow_categories,
            "inflow_accuracy": inflow_accuracy,
            "outflow_accuracy": outflow_accuracy,
            "categories_on_track": categories_on_track,
            "categories_to_monitor": categories_to_monitor,
            "categories_at_risk": categories_at_risk,
            "ai_analysis": ai_analysis
        }
    
    except Exception as e:
        logger.error(f"Variance calculation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# ==================== REPORTS ROUTES ====================

@api_router.get("/reports/ar-summary")
async def get_ar_report(current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    
    total_receivables = sum(inv.get('total_amount', 0) for inv in invoices)
    total_collected = sum(inv.get('amount_received', 0) for inv in invoices)
    total_outstanding = sum(inv.get('amount_outstanding', 0) for inv in invoices)
    
    return {
        "total_receivables": total_receivables,
        "total_collected": total_collected,
        "total_outstanding": total_outstanding,
        "collection_rate": (total_collected / total_receivables * 100) if total_receivables > 0 else 0
    }

@api_router.get("/reports/ap-summary")
async def get_ap_report(current_user: User = Depends(get_current_user)):
    bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    
    total_payables = sum(bill.get('total_amount', 0) for bill in bills)
    total_paid = sum(bill.get('amount_paid', 0) for bill in bills)
    total_outstanding = sum(bill.get('amount_outstanding', 0) for bill in bills)
    
    return {
        "total_payables": total_payables,
        "total_paid": total_paid,
        "total_outstanding": total_outstanding,
        "payment_rate": (total_paid / total_payables * 100) if total_payables > 0 else 0
    }


# ==================== FINANCIAL REPORTING ENDPOINTS ====================

@api_router.get("/reports/profit-loss")
async def get_profit_loss_statement(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate Profit & Loss Statement from journal entries
    Groups by fs_head: Revenue, Expense, Other Income, Other Expense
    """
    query = {}
    
    if start_date and end_date:
        # Convert date strings to datetime objects for comparison
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999)
        query['entry_date'] = {
            "$gte": start_dt,
            "$lte": end_dt
        }
    
    # Get all journal entries
    journal_entries = await db.journal_entries.find(query, {"_id": 0}).to_list(length=None)
    
    # Initialize P&L structure
    pl_statement = {
        "period": {
            "from": start_date or "Inception",
            "to": end_date or datetime.now(timezone.utc).isoformat()
        },
        "revenue": {"items": [], "total": 0},
        "cogs": {"items": [], "total": 0},
        "operating_expenses": {"items": [], "total": 0},
        "other_income": {"items": [], "total": 0},
        "other_expenses": {"items": [], "total": 0},
        "gross_profit": 0,
        "operating_profit": 0,
        "net_profit_before_tax": 0,
        "net_profit": 0
    }
    
    # Aggregate amounts by account
    account_totals = {}
    
    for entry in journal_entries:
        for line_item in entry.get('line_items', []):
            account = line_item['account']
            
            # Calculate net amount (credit - debit for income, debit - credit for expenses)
            if account not in account_totals:
                account_totals[account] = {"debit": 0, "credit": 0, "net": 0}
            
            account_totals[account]["debit"] += line_item.get('debit', 0)
            account_totals[account]["credit"] += line_item.get('credit', 0)
    
    # Calculate net and categorize accounts
    for account, amounts in account_totals.items():
        net_amount = amounts["credit"] - amounts["debit"]
        
        # Categorize based on account name (simple classification)
        account_lower = account.lower()
        
        if any(keyword in account_lower for keyword in ['revenue', 'sales', 'income', 'service']):
            if 'other' not in account_lower and 'non-operating' not in account_lower:
                pl_statement["revenue"]["items"].append({"account": account, "amount": net_amount})
                pl_statement["revenue"]["total"] += net_amount
            else:
                pl_statement["other_income"]["items"].append({"account": account, "amount": net_amount})
                pl_statement["other_income"]["total"] += net_amount
        
        elif any(keyword in account_lower for keyword in ['cogs', 'cost of goods', 'cost of sales']):
            pl_statement["cogs"]["items"].append({"account": account, "amount": abs(net_amount)})
            pl_statement["cogs"]["total"] += abs(net_amount)
        
        elif any(keyword in account_lower for keyword in ['expense', 'salary', 'rent', 'utilities', 'marketing', 'payroll', 'purchase', 'material', 'supplies', 'cost']):
            if 'other' not in account_lower:
                pl_statement["operating_expenses"]["items"].append({"account": account, "amount": abs(net_amount)})
                pl_statement["operating_expenses"]["total"] += abs(net_amount)
            else:
                pl_statement["other_expenses"]["items"].append({"account": account, "amount": abs(net_amount)})
                pl_statement["other_expenses"]["total"] += abs(net_amount)
    
    # Calculate totals
    pl_statement["gross_profit"] = pl_statement["revenue"]["total"] - pl_statement["cogs"]["total"]
    pl_statement["operating_profit"] = pl_statement["gross_profit"] - pl_statement["operating_expenses"]["total"]
    pl_statement["net_profit_before_tax"] = (
        pl_statement["operating_profit"] + 
        pl_statement["other_income"]["total"] - 
        pl_statement["other_expenses"]["total"]
    )
    pl_statement["net_profit"] = pl_statement["net_profit_before_tax"]  # Assuming no tax for now
    
    return pl_statement

@api_router.get("/reports/balance-sheet")
async def get_balance_sheet(
    as_of_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate Balance Sheet from journal entries
    Assets = Liabilities + Equity
    """
    query = {}
    
    if as_of_date:
        # Convert date string to datetime object for comparison
        end_dt = datetime.strptime(as_of_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999)
        query['entry_date'] = {"$lte": end_dt}
    
    # Get all journal entries up to the date
    journal_entries = await db.journal_entries.find(query, {"_id": 0}).to_list(length=None)
    
    # Initialize Balance Sheet structure
    balance_sheet = {
        "as_of_date": as_of_date or datetime.now(timezone.utc).date().isoformat(),
        "assets": {
            "current_assets": {"items": [], "total": 0},
            "non_current_assets": {"items": [], "total": 0},
            "total": 0
        },
        "liabilities": {
            "current_liabilities": {"items": [], "total": 0},
            "non_current_liabilities": {"items": [], "total": 0},
            "total": 0
        },
        "equity": {"items": [], "total": 0},
        "total_liabilities_equity": 0
    }
    
    # Aggregate amounts by account
    account_balances = {}
    
    for entry in journal_entries:
        for line_item in entry.get('line_items', []):
            account = line_item['account']
            
            if account not in account_balances:
                account_balances[account] = {"debit": 0, "credit": 0, "balance": 0}
            
            account_balances[account]["debit"] += line_item.get('debit', 0)
            account_balances[account]["credit"] += line_item.get('credit', 0)
    
    # Calculate balances and categorize
    for account, amounts in account_balances.items():
        # Assets have debit balance, Liabilities/Equity have credit balance
        balance = amounts["debit"] - amounts["credit"]
        account_lower = account.lower()
        
        # Assets (debit balance)
        if balance > 0:
            if any(keyword in account_lower for keyword in ['cash', 'bank', 'receivable', 'inventory', 'prepaid']):
                balance_sheet["assets"]["current_assets"]["items"].append({"account": account, "amount": balance})
                balance_sheet["assets"]["current_assets"]["total"] += balance
            elif any(keyword in account_lower for keyword in ['property', 'equipment', 'investment', 'intangible']):
                balance_sheet["assets"]["non_current_assets"]["items"].append({"account": account, "amount": balance})
                balance_sheet["assets"]["non_current_assets"]["total"] += balance
            else:
                # Default to current assets
                balance_sheet["assets"]["current_assets"]["items"].append({"account": account, "amount": balance})
                balance_sheet["assets"]["current_assets"]["total"] += balance
        
        # Liabilities and Equity (credit balance)
        elif balance < 0:
            abs_balance = abs(balance)
            
            if any(keyword in account_lower for keyword in ['payable', 'accrued', 'short-term']):
                balance_sheet["liabilities"]["current_liabilities"]["items"].append({"account": account, "amount": abs_balance})
                balance_sheet["liabilities"]["current_liabilities"]["total"] += abs_balance
            elif any(keyword in account_lower for keyword in ['loan', 'long-term', 'bonds']):
                balance_sheet["liabilities"]["non_current_liabilities"]["items"].append({"account": account, "amount": abs_balance})
                balance_sheet["liabilities"]["non_current_liabilities"]["total"] += abs_balance
            elif any(keyword in account_lower for keyword in ['equity', 'capital', 'retained']):
                balance_sheet["equity"]["items"].append({"account": account, "amount": abs_balance})
                balance_sheet["equity"]["total"] += abs_balance
            else:
                # Default to current liabilities
                balance_sheet["liabilities"]["current_liabilities"]["items"].append({"account": account, "amount": abs_balance})
                balance_sheet["liabilities"]["current_liabilities"]["total"] += abs_balance
    
    # Calculate totals
    balance_sheet["assets"]["total"] = (
        balance_sheet["assets"]["current_assets"]["total"] + 
        balance_sheet["assets"]["non_current_assets"]["total"]
    )
    balance_sheet["liabilities"]["total"] = (
        balance_sheet["liabilities"]["current_liabilities"]["total"] + 
        balance_sheet["liabilities"]["non_current_liabilities"]["total"]
    )
    balance_sheet["total_liabilities_equity"] = (
        balance_sheet["liabilities"]["total"] + 
        balance_sheet["equity"]["total"]
    )
    
    return balance_sheet

@api_router.get("/reports/trial-balance")
async def get_trial_balance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate Trial Balance from journal entries
    List all accounts with debit and credit balances
    """
    query = {}
    
    if start_date and end_date:
        # Convert date strings to datetime objects for comparison
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999)
        query['entry_date'] = {
            "$gte": start_dt,
            "$lte": end_dt
        }
    
    journal_entries = await db.journal_entries.find(query, {"_id": 0}).to_list(length=None)
    
    # Aggregate by account
    accounts = {}
    
    for entry in journal_entries:
        for line_item in entry.get('line_items', []):
            account = line_item['account']
            
            if account not in accounts:
                accounts[account] = {"debit": 0, "credit": 0}
            
            accounts[account]["debit"] += line_item.get('debit', 0)
            accounts[account]["credit"] += line_item.get('credit', 0)
    
    # Convert to list with balance
    trial_balance_list = []
    total_debit = 0
    total_credit = 0
    
    for account, amounts in sorted(accounts.items()):
        debit_balance = amounts["debit"]
        credit_balance = amounts["credit"]
        
        trial_balance_list.append({
            "account": account,
            "debit": debit_balance,
            "credit": credit_balance,
            "balance": debit_balance - credit_balance
        })
        
        total_debit += debit_balance
        total_credit += credit_balance
    
    return {
        "period": {
            "from": start_date or "Inception",
            "to": end_date or datetime.now(timezone.utc).isoformat()
        },
        "accounts": trial_balance_list,
        "totals": {
            "debit": total_debit,
            "credit": total_credit,
            "difference": total_debit - total_credit
        }
    }

@api_router.get("/reports/general-ledger")
async def get_general_ledger(
    account: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate General Ledger - detailed transaction view
    Filter by account and date range
    """
    query = {}
    
    if start_date and end_date:
        # Convert date strings to datetime objects for comparison
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999)
        query['entry_date'] = {
            "$gte": start_dt,
            "$lte": end_dt
        }
    
    journal_entries = await db.journal_entries.find(query, {"_id": 0}).sort("entry_date", 1).to_list(length=None)
    
    # Group by account
    ledger = {}
    
    for entry in journal_entries:
        entry_date = entry.get('entry_date')
        entry_id = entry.get('id')
        description = entry.get('description', '')
        
        for line_item in entry.get('line_items', []):
            acc = line_item['account']
            
            # Filter by account if specified
            if account and acc != account:
                continue
            
            if acc not in ledger:
                ledger[acc] = {
                    "account": acc,
                    "transactions": [],
                    "opening_balance": 0,
                    "closing_balance": 0
                }
            
            ledger[acc]["transactions"].append({
                "date": entry_date,
                "entry_id": entry_id,
                "description": description + " - " + line_item.get('description', ''),
                "debit": line_item.get('debit', 0),
                "credit": line_item.get('credit', 0)
            })
    
    # Calculate running balances
    for acc, data in ledger.items():
        running_balance = 0
        for txn in data["transactions"]:
            running_balance += txn["debit"] - txn["credit"]
            txn["balance"] = running_balance
        
        data["closing_balance"] = running_balance
    
    # If specific account requested, return that; else return all
    if account:
        return ledger.get(account, {"account": account, "transactions": [], "opening_balance": 0, "closing_balance": 0})
    
    return {
        "period": {
            "from": start_date or "Inception",
            "to": end_date or datetime.now(timezone.utc).isoformat()
        },
        "ledger": ledger
    }

@api_router.get("/reports/cashflow-statement")
async def get_cashflow_statement(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate formal Cash Flow Statement from journal entries
    Using Category Master classifications
    """
    query = {}
    
    if start_date and end_date:
        # Convert date strings to datetime objects for comparison
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999)
        query['entry_date'] = {
            "$gte": start_dt,
            "$lte": end_dt
        }
    
    journal_entries = await db.journal_entries.find(query, {"_id": 0}).to_list(length=None)
    
    # Initialize cash flow structure
    cashflow = {
        "period": {
            "from": start_date or "Inception",
            "to": end_date or datetime.now(timezone.utc).isoformat()
        },
        "operating_activities": {"inflows": [], "outflows": [], "net": 0},
        "investing_activities": {"inflows": [], "outflows": [], "net": 0},
        "financing_activities": {"inflows": [], "outflows": [], "net": 0},
        "opening_cash": 0,
        "closing_cash": 0,
        "net_change": 0
    }
    
    # Track cash movements
    for entry in journal_entries:
        for line_item in entry.get('line_items', []):
            account = line_item['account']
            account_lower = account.lower()
            debit = line_item.get('debit', 0)
            credit = line_item.get('credit', 0)
            
            # Only track if it involves cash/bank
            if 'cash' in account_lower or 'bank' in account_lower:
                # Debit to cash = inflow, Credit from cash = outflow
                amount = debit - credit
                
                # Categorize based on transaction description
                desc = entry.get('description', '').lower()
                
                if any(keyword in desc for keyword in ['invoice', 'sale', 'revenue', 'customer', 'expense', 'supplier', 'bill']):
                    if amount > 0:
                        cashflow["operating_activities"]["inflows"].append({
                            "description": entry.get('description', ''),
                            "amount": amount
                        })
                    else:
                        cashflow["operating_activities"]["outflows"].append({
                            "description": entry.get('description', ''),
                            "amount": abs(amount)
                        })
                
                elif any(keyword in desc for keyword in ['asset', 'equipment', 'property', 'investment']):
                    if amount > 0:
                        cashflow["investing_activities"]["inflows"].append({
                            "description": entry.get('description', ''),
                            "amount": amount
                        })
                    else:
                        cashflow["investing_activities"]["outflows"].append({
                            "description": entry.get('description', ''),
                            "amount": abs(amount)
                        })
                
                elif any(keyword in desc for keyword in ['loan', 'equity', 'dividend', 'capital']):
                    if amount > 0:
                        cashflow["financing_activities"]["inflows"].append({
                            "description": entry.get('description', ''),
                            "amount": amount
                        })
                    else:
                        cashflow["financing_activities"]["outflows"].append({
                            "description": entry.get('description', ''),
                            "amount": abs(amount)
                        })
    
    # Calculate nets
    cashflow["operating_activities"]["net"] = (
        sum(item["amount"] for item in cashflow["operating_activities"]["inflows"]) -
        sum(item["amount"] for item in cashflow["operating_activities"]["outflows"])
    )
    cashflow["investing_activities"]["net"] = (
        sum(item["amount"] for item in cashflow["investing_activities"]["inflows"]) -
        sum(item["amount"] for item in cashflow["investing_activities"]["outflows"])
    )
    cashflow["financing_activities"]["net"] = (
        sum(item["amount"] for item in cashflow["financing_activities"]["inflows"]) -
        sum(item["amount"] for item in cashflow["financing_activities"]["outflows"])
    )
    
    cashflow["net_change"] = (
        cashflow["operating_activities"]["net"] +
        cashflow["investing_activities"]["net"] +
        cashflow["financing_activities"]["net"]
    )
    
    # Get opening and closing cash from bank accounts (simplified)
    cashflow["closing_cash"] = cashflow["opening_cash"] + cashflow["net_change"]
    
    return cashflow


# ==================== EXCEL/CSV UPLOAD ROUTES ====================

@api_router.post("/customers/upload")
async def upload_customers(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload customers via Excel/CSV"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        customers_added = 0
        errors = []
        
        # Get current customer count for sequential ID generation
        current_count = await db.parties_customers.count_documents({})
        
        for index, row in df.iterrows():
            try:
                # Generate sequential customer_id
                customer_id = f"CUST-{str(current_count + customers_added + 1).zfill(3)}"
                
                # Handle closing_balance field
                closing_balance = float(row.get('closing_balance', row.get('Closing Balance', 0)))
                
                customer = Customer(
                    customer_id=customer_id,
                    name=str(row.get('name', row.get('Name', ''))),
                    contact_person=str(row.get('contact_person', row.get('Contact Person', ''))),
                    email=str(row.get('email', row.get('Email', ''))),
                    phone=str(row.get('phone', row.get('Phone', ''))),
                    gstin=str(row.get('gstin', row.get('GSTIN', ''))) if pd.notna(row.get('gstin', row.get('GSTIN'))) else None,
                    pan=str(row.get('pan', row.get('PAN', ''))) if pd.notna(row.get('pan', row.get('PAN'))) else None,
                    credit_limit=float(row.get('credit_limit', row.get('Credit Limit', 0))),
                    payment_terms=str(row.get('payment_terms', row.get('Payment Terms', 'Net 30'))),
                    address=str(row.get('address', row.get('Address', ''))) if pd.notna(row.get('address', row.get('Address'))) else None,
                    outstanding_amount=closing_balance  # Map closing_balance to outstanding_amount
                )
                
                doc = customer.model_dump()
                doc['created_at'] = doc['created_at'].isoformat()
                await db.parties_customers.insert_one(doc)
                customers_added += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "success": True,
            "customers_added": customers_added,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@api_router.get("/customers/export/excel")
async def export_customers(current_user: User = Depends(get_current_user)):
    """Export all customers to Excel"""
    try:
        customers = await db.parties_customers.find({}, {"_id": 0}).to_list(10000)
        
        # Prepare data for export
        export_data = []
        for customer in customers:
            export_data.append({
                "Customer ID": customer.get('customer_id', ''),
                "Name": customer.get('name', ''),
                "Contact Person": customer.get('contact_person', ''),
                "Email": customer.get('email', ''),
                "Phone": customer.get('phone', ''),
                "GSTIN": customer.get('gstin', ''),
                "PAN": customer.get('pan', ''),
                "Credit Limit": customer.get('credit_limit', 0),
                "Payment Terms": customer.get('payment_terms', ''),
                "Address": customer.get('address', ''),
                "Outstanding Amount": customer.get('outstanding_amount', 0),
                "Overdue Amount": customer.get('overdue_amount', 0),
                "Status": customer.get('status', 'Active'),
                "Created At": customer.get('created_at', '')
            })
        
        df = pd.DataFrame(export_data)
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Customers')
        
        output.seek(0)
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=customers_export.xlsx"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@api_router.post("/bills/upload")
async def upload_bills(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload bills via Excel/CSV"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        bills_added = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                vendor_id = str(row.get('vendor_id', ''))
                vendor = await db.parties_vendors.find_one({"id": vendor_id}, {"_id": 0})
                if not vendor:
                    errors.append(f"Row {index + 2}: Vendor not found")
                    continue
                
                count = await db.bills.count_documents({})
                bill_number = f"BILL-{count + 2001}"
                
                bill_date = pd.to_datetime(row.get('bill_date', datetime.now(timezone.utc)))
                due_date = pd.to_datetime(row.get('due_date', datetime.now(timezone.utc)))
                base_amount = float(row.get('base_amount', 0))
                gst_percent = float(row.get('gst_percent', 18))
                gst_amount = base_amount * (gst_percent / 100)
                total_amount = base_amount + gst_amount
                
                bill = Bill(
                    bill_number=bill_number,
                    vendor_id=vendor_id,
                    vendor_name=vendor['name'],
                    bill_date=bill_date,
                    due_date=due_date,
                    base_amount=base_amount,
                    gst_percent=gst_percent,
                    gst_amount=gst_amount,
                    total_amount=total_amount,
                    amount_outstanding=total_amount,
                    expense_category=str(row.get('expense_category', 'General'))
                )
                
                doc = bill.model_dump()
                doc['bill_date'] = doc['bill_date'].isoformat()
                doc['due_date'] = doc['due_date'].isoformat()
                doc['created_at'] = doc['created_at'].isoformat()
                
                await db.bills.insert_one(doc)
                bills_added += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "success": True,
            "bills_added": bills_added,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@api_router.post("/vendors/upload")
async def upload_vendors(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload vendors via Excel/CSV"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        vendors_added = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                vendor = Vendor(
                    name=str(row.get('name', row.get('Name', ''))),
                    contact_person=str(row.get('contact_person', row.get('Contact Person', ''))),
                    email=str(row.get('email', row.get('Email', ''))),
                    phone=str(row.get('phone', row.get('Phone', ''))),
                    gstin=str(row.get('gstin', row.get('GSTIN', ''))) if pd.notna(row.get('gstin', row.get('GSTIN'))) else None,
                    pan=str(row.get('pan', row.get('PAN', ''))) if pd.notna(row.get('pan', row.get('PAN'))) else None,
                    payment_terms=str(row.get('payment_terms', row.get('Payment Terms', 'Net 30'))),
                    bank_account=str(row.get('bank_account', row.get('Bank Account', ''))) if pd.notna(row.get('bank_account', row.get('Bank Account'))) else None,
                    ifsc=str(row.get('ifsc', row.get('IFSC', ''))) if pd.notna(row.get('ifsc', row.get('IFSC'))) else None,
                    address=str(row.get('address', row.get('Address', ''))) if pd.notna(row.get('address', row.get('Address'))) else None
                )
                
                doc = vendor.model_dump()
                doc['created_at'] = doc['created_at'].isoformat()
                await db.parties_vendors.insert_one(doc)
                vendors_added += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "success": True,
            "vendors_added": vendors_added,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@api_router.post("/invoices/upload")
async def upload_invoices(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload invoices via Excel/CSV with new calculation logic"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        invoices_added = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                customer_id = str(row.get('customer_id', ''))
                # Look up customer by customer_id (CUST-001) instead of internal id
                customer = await db.parties_customers.find_one({"customer_id": customer_id}, {"_id": 0})
                if not customer:
                    errors.append(f"Row {index + 2}: Customer with ID '{customer_id}' not found")
                    continue
                
                # Get invoice number from Excel, or auto-generate if empty
                invoice_number = str(row.get('invoice_number', '')).strip()
                if not invoice_number:
                    count = await db.invoices.count_documents({})
                    invoice_number = f"INV-{count + 1001}"
                else:
                    # Check if invoice number already exists
                    existing = await db.invoices.find_one({"invoice_number": invoice_number}, {"_id": 0})
                    if existing:
                        errors.append(f"Row {index + 2}: Invoice number '{invoice_number}' already exists")
                        continue
                
                # Extract values from template
                invoice_date = pd.to_datetime(row.get('invoice_date', datetime.now(timezone.utc)))
                base_amount = float(row.get('base_amount', 0))
                gst_percentage = float(row.get('gst_percentage', 18))
                tds_percentage = float(row.get('tds_percentage', 0))
                payment_terms = int(row.get('payment_terms', 30))  # in days
                owner = str(row.get('owner', 'N/A'))  # New owner field
                
                # Calculate amounts using new formula
                # Amount receivable = base_amount + (base_amount * gst_percentage/100) - (base_amount * tds_percentage/100)
                gst_amount = base_amount * (gst_percentage / 100)
                tds_amount = base_amount * (tds_percentage / 100)
                total_amount = base_amount + gst_amount  # Invoice total
                amount_receivable = base_amount + gst_amount - tds_amount  # Net amount after TDS
                
                # Calculate due date from invoice date + payment terms
                due_date = invoice_date + pd.Timedelta(days=payment_terms)
                
                invoice = Invoice(
                    invoice_number=invoice_number,
                    customer_id=customer['id'],  # Store internal customer id
                    customer_name=customer['name'],
                    invoice_date=invoice_date,
                    due_date=due_date,
                    base_amount=base_amount,
                    gst_percent=gst_percentage,
                    gst_amount=gst_amount,
                    tds_percent=tds_percentage,
                    tds_amount=tds_amount,
                    total_amount=total_amount,
                    amount_outstanding=amount_receivable  # Outstanding is the net receivable amount
                )
                
                doc = invoice.model_dump()
                doc['owner'] = owner  # Add owner to the document
                doc['invoice_date'] = doc['invoice_date'].isoformat()
                doc['due_date'] = doc['due_date'].isoformat()
                doc['created_at'] = doc['created_at'].isoformat()
                
                await db.invoices.insert_one(doc)
                invoices_added += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "success": True,
            "invoices_added": invoices_added,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@api_router.post("/transactions/upload")
async def upload_transactions(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload bank transactions via Excel/CSV with new format"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        transactions_added = 0
        errors = []
        
        # Get first bank account (for MVP - can be enhanced to accept bank_id)
        accounts = await db.bank_accounts.find({}, {"_id": 0}).to_list(10)
        if not accounts:
            raise HTTPException(status_code=404, detail="No bank accounts found")
        
        account = accounts[0]  # Use first account
        
        for index, row in df.iterrows():
            try:
                # New format mapping
                date_val = row.get('Date', row.get('date'))
                particulars = str(row.get('Particulars', row.get('particulars', '')))
                debit = float(row.get('Debit', row.get('debit', 0)))
                credit = float(row.get('Credit', row.get('credit', 0)))
                reference = str(row.get('Reference', row.get('reference', '')))
                
                # Determine transaction type and amount
                if credit > 0:
                    trans_type = "Credit"
                    amount = credit
                elif debit > 0:
                    trans_type = "Debit"
                    amount = debit
                else:
                    errors.append(f"Row {index + 2}: No debit or credit amount")
                    continue
                
                transaction = Transaction(
                    bank_account_id=account['id'],
                    bank_name=account['bank_name'],
                    transaction_date=pd.to_datetime(date_val) if pd.notna(date_val) else datetime.now(timezone.utc),
                    description=particulars,
                    transaction_type=trans_type,
                    amount=amount,
                    reference_no=reference if pd.notna(reference) and reference != 'nan' else None,
                    status="Uncategorized"  # All uploaded transactions are uncategorized
                )
                
                # Update balance
                if trans_type == "Credit":
                    new_balance = account['current_balance'] + amount
                else:
                    new_balance = account['current_balance'] - amount
                
                transaction.balance = new_balance
                
                doc = transaction.model_dump()
                doc['transaction_date'] = doc['transaction_date'].isoformat()
                doc['created_at'] = doc['created_at'].isoformat()
                
                await db.transactions.insert_one(doc)
                
                # Update bank account balance
                await db.bank_accounts.update_one(
                    {"id": account['id']},
                    {"$set": {"current_balance": new_balance}}
                )
                
                transactions_added += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "success": True,
            "transactions_added": transactions_added,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

# ==================== TEMPLATE DOWNLOAD ROUTES ====================

@api_router.get("/templates/invoices")
async def download_invoice_template():
    """Download invoice upload template with updated fields"""
    template_data = {
        "customer_id": ["CUST-001"],
        "invoice_number": ["INV-1001"],
        "invoice_date": ["2025-10-25"],
        "base_amount": [100000],
        "gst_percentage": [18],
        "tds_percentage": [2],
        "payment_terms": [30],
        "owner": ["John Doe"]
    }
    
    df = pd.DataFrame(template_data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Invoices')
    
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=invoice_template.xlsx"}
    )

@api_router.get("/templates/customers")
async def download_customer_template():
    """Download customer upload template"""
    template_data = {
        "name": ["ABC Company Ltd"],
        "contact_person": ["John Doe"],
        "email": ["john@abc.com"],
        "phone": ["+91-9876543210"],
        "gstin": ["27AAAAA0000A1Z5"],
        "pan": ["AAAAA0000A"],
        "credit_limit": [500000],
        "payment_terms": ["Net 30"],
        "address": ["Mumbai, Maharashtra"],
        "closing_balance": [0]
    }
    
    df = pd.DataFrame(template_data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Customers')
    
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=customer_template.xlsx"}
    )

@api_router.get("/templates/bills")
async def download_bill_template():
    """Download bill upload template"""
    template_data = {
        "vendor_id": ["vend-001"],
        "bill_date": ["2025-10-25"],
        "due_date": ["2025-11-09"],
        "base_amount": [50000],
        "gst_percent": [18],
        "expense_category": ["Office Expenses"]
    }
    
    df = pd.DataFrame(template_data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Bills')
    
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=bill_template.xlsx"}
    )

@api_router.get("/templates/vendors")
async def download_vendor_template():
    """Download vendor upload template"""
    template_data = {
        "name": ["XYZ Suppliers Ltd"],
        "contact_person": ["Jane Smith"],
        "email": ["jane@xyz.com"],
        "phone": ["+91-9876543211"],
        "gstin": ["27BBBBB1111B2Z6"],
        "pan": ["BBBBB1111B"],
        "payment_terms": ["Net 15"],
        "bank_account": ["1234567890"],
        "ifsc": ["HDFC0001234"],
        "address": ["Delhi, NCR"]
    }
    
    df = pd.DataFrame(template_data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Vendors')
    
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=vendor_template.xlsx"}
    )

@api_router.get("/templates/transactions")
async def download_transaction_template():
    """Download transaction upload template with new format"""
    template_data = {
        "Date": ["2025-10-15"],
        "Particulars": ["Customer Payment / Vendor Payment"],
        "Debit": [0],
        "Credit": [100000],
        "Closing Balance": [5100000],
        "Reference": ["UTR123456789"]
    }
    
    df = pd.DataFrame(template_data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Transactions')
    
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=transaction_template.xlsx"}
    )



# ==================== CATEGORY MASTER ENDPOINTS ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories(
    cashflow_activity: Optional[str] = None,
    cashflow_flow: Optional[str] = None,
    statement_type: Optional[str] = None,
    industry: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get all categories with optional filters
    - cashflow_activity: Operating, Investing, Financing, etc.
    - cashflow_flow: Inflow, Outflow, Non-Cash
    - statement_type: Profit & Loss, Balance Sheet
    - industry: Filter by industry tag
    - search: Search in category name
    """
    query = {}
    
    if cashflow_activity:
        query['cashflow_activity'] = cashflow_activity
    if cashflow_flow:
        query['cashflow_flow'] = cashflow_flow
    if statement_type:
        query['statement_type'] = statement_type
    if industry:
        query['industry_tags'] = {"$regex": industry, "$options": "i"}
    if search:
        query['category_name'] = {"$regex": search, "$options": "i"}
    
    categories = await db.category_master.find(query, {"_id": 0}).to_list(length=None)
    return [Category(**cat) for cat in categories]

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a single category by ID"""
    category = await db.category_master.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return Category(**category)

@api_router.get("/categories/summary/stats")
async def get_category_stats(current_user: User = Depends(get_current_user)):
    """Get category distribution statistics"""
    pipeline = [
        {
            "$group": {
                "_id": "$cashflow_activity",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    stats = {}
    async for doc in db.category_master.aggregate(pipeline):
        stats[doc["_id"]] = doc["count"]
    
    total_categories = await db.category_master.count_documents({})
    
    return {
        "total_categories": total_categories,
        "by_activity": stats
    }

@api_router.post("/categories", response_model=Category)
async def create_category(
    category: Category,
    current_user: User = Depends(get_current_user)
):
    """Create a new category"""
    category_dict = category.model_dump()
    category_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    category_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Check if category already exists
    existing = await db.category_master.find_one({"category_name": category_dict["category_name"]})
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    await db.category_master.insert_one(category_dict)
    return Category(**category_dict)

# ==================== JOURNAL ENTRY ENDPOINTS ====================

@api_router.post("/journal-entries", response_model=JournalEntry)
async def create_journal_entry(
    entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new journal entry"""
    # Validate that debits = credits
    if entry.total_debit != entry.total_credit:
        raise HTTPException(
            status_code=400,
            detail=f"Debits ({entry.total_debit}) must equal Credits ({entry.total_credit})"
        )
    
    journal_dict = entry.model_dump()
    journal_dict['id'] = str(uuid.uuid4())
    journal_dict['posted_by'] = current_user.id
    journal_dict['status'] = "Posted"
    journal_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    
    await db.journal_entries.insert_one(journal_dict)
    
    return JournalEntry(**journal_dict)

@api_router.get("/journal-entries", response_model=List[JournalEntry])
async def get_journal_entries(
    transaction_id: Optional[str] = None,
    transaction_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get journal entries with filters"""
    query = {}
    
    if transaction_id:
        query['transaction_id'] = transaction_id
    if transaction_type:
        query['transaction_type'] = transaction_type
    if start_date and end_date:
        query['entry_date'] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    entries = await db.journal_entries.find(query, {"_id": 0}).sort("entry_date", -1).limit(limit).to_list(length=None)
    return [JournalEntry(**entry) for entry in entries]

@api_router.get("/journal-entries/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a single journal entry"""
    entry = await db.journal_entries.find_one({"id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return JournalEntry(**entry)

@api_router.delete("/journal-entries/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a journal entry (with caution)"""
    result = await db.journal_entries.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": "Journal entry deleted successfully"}


# ==================== ADJUSTMENT ENTRY ENDPOINTS ====================

@api_router.post("/adjustment-entries", response_model=AdjustmentEntry)
async def create_adjustment_entry(
    entry: AdjustmentEntryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new adjustment entry in Draft status"""
    # Calculate totals
    total_debit = sum(item.debit for item in entry.line_items)
    total_credit = sum(item.credit for item in entry.line_items)
    
    # Validate that debits = credits
    if abs(total_debit - total_credit) > 0.01:  # Allow small floating point differences
        raise HTTPException(
            status_code=400,
            detail=f"Debits ({total_debit}) must equal Credits ({total_credit})"
        )
    
    # Generate adjustment entry number
    count = await db.adjustment_entries.count_documents({})
    entry_number = f"ADJ-{count + 1:04d}"
    
    adjustment_dict = entry.model_dump()
    adjustment_dict['id'] = str(uuid.uuid4())
    adjustment_dict['entry_number'] = entry_number
    adjustment_dict['total_debit'] = total_debit
    adjustment_dict['total_credit'] = total_credit
    adjustment_dict['status'] = "Draft"
    adjustment_dict['created_by'] = current_user.id
    adjustment_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    adjustment_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    adjustment_dict['entry_date'] = adjustment_dict['entry_date'].isoformat()
    
    await db.adjustment_entries.insert_one(adjustment_dict)
    
    return AdjustmentEntry(**adjustment_dict)

@api_router.get("/adjustment-entries", response_model=List[AdjustmentEntry])
async def get_adjustment_entries(
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get adjustment entries with filters"""
    query = {}
    
    if status:
        query['status'] = status
    if start_date and end_date:
        query['entry_date'] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    entries = await db.adjustment_entries.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(length=None)
    return [AdjustmentEntry(**entry) for entry in entries]

@api_router.get("/adjustment-entries/{entry_id}", response_model=AdjustmentEntry)
async def get_adjustment_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a single adjustment entry"""
    entry = await db.adjustment_entries.find_one({"id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Adjustment entry not found")
    return AdjustmentEntry(**entry)

@api_router.put("/adjustment-entries/{entry_id}", response_model=AdjustmentEntry)
async def update_adjustment_entry(
    entry_id: str,
    entry_update: AdjustmentEntryCreate,
    current_user: User = Depends(get_current_user)
):
    """Update an adjustment entry (only if status is Draft)"""
    existing = await db.adjustment_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Adjustment entry not found")
    
    if existing['status'] != "Draft":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update adjustment entry in {existing['status']} status"
        )
    
    # Calculate totals
    total_debit = sum(item.debit for item in entry_update.line_items)
    total_credit = sum(item.credit for item in entry_update.line_items)
    
    # Validate that debits = credits
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Debits ({total_debit}) must equal Credits ({total_credit})"
        )
    
    update_dict = entry_update.model_dump()
    update_dict['total_debit'] = total_debit
    update_dict['total_credit'] = total_credit
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    update_dict['entry_date'] = update_dict['entry_date'].isoformat()
    
    await db.adjustment_entries.update_one(
        {"id": entry_id},
        {"$set": update_dict}
    )
    
    updated = await db.adjustment_entries.find_one({"id": entry_id}, {"_id": 0})
    return AdjustmentEntry(**updated)

@api_router.put("/adjustment-entries/{entry_id}/review")
async def move_to_review(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Move adjustment entry from Draft to Review"""
    existing = await db.adjustment_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Adjustment entry not found")
    
    if existing['status'] != "Draft":
        raise HTTPException(
            status_code=400,
            detail=f"Can only move Draft entries to Review. Current status: {existing['status']}"
        )
    
    await db.adjustment_entries.update_one(
        {"id": entry_id},
        {"$set": {
            "status": "Review",
            "reviewed_by": current_user.id,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Adjustment entry moved to Review"}

@api_router.put("/adjustment-entries/{entry_id}/approve")
async def approve_and_post(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Approve adjustment entry and post to journal"""
    existing = await db.adjustment_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Adjustment entry not found")
    
    if existing['status'] not in ["Draft", "Review"]:
        raise HTTPException(
            status_code=400,
            detail=f"Can only approve Draft or Review entries. Current status: {existing['status']}"
        )
    
    # Create journal entry
    journal_line_items = [
        JournalLineItem(**item) for item in existing['line_items']
    ]
    
    journal_entry = JournalEntryCreate(
        transaction_id=entry_id,
        transaction_type="Adjustment",
        entry_date=datetime.fromisoformat(existing['entry_date']),
        description=existing['description'],
        line_items=journal_line_items,
        total_debit=existing['total_debit'],
        total_credit=existing['total_credit']
    )
    
    journal_dict = journal_entry.model_dump()
    journal_dict['id'] = str(uuid.uuid4())
    journal_dict['posted_by'] = current_user.id
    journal_dict['status'] = "Posted"
    journal_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    
    await db.journal_entries.insert_one(journal_dict)
    
    # Update adjustment entry status
    await db.adjustment_entries.update_one(
        {"id": entry_id},
        {"$set": {
            "status": "Approved",
            "approved_by": current_user.id,
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "journal_entry_id": journal_dict['id'],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Adjustment entry approved and posted to journal", "journal_entry_id": journal_dict['id']}

@api_router.delete("/adjustment-entries/{entry_id}")
async def delete_adjustment_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an adjustment entry (only if status is Draft)"""
    existing = await db.adjustment_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Adjustment entry not found")
    
    if existing['status'] != "Draft":
        raise HTTPException(
            status_code=400,
            detail=f"Can only delete Draft entries. Current status: {existing['status']}"
        )
    
    result = await db.adjustment_entries.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Adjustment entry not found")
    return {"message": "Adjustment entry deleted successfully"}


# Helper function to auto-generate journal entry for invoice
async def create_invoice_journal_entry(invoice_id: str, invoice_data: dict, user_id: str):
    """Auto-generate journal entry when invoice is finalized"""
    
    # DR: Accounts Receivable
    # CR: Revenue (from category COA)
    # CR: Output GST
    
    line_items = []
    
    # Debit: Accounts Receivable (Total Amount including GST)
    line_items.append(JournalLineItem(
        account="Accounts Receivable",
        description=f"Invoice {invoice_data.get('invoice_number', '')} - {invoice_data.get('customer_name', '')}",
        debit=invoice_data['total_amount'],
        credit=0.0
    ))
    
    # Credit: Revenue (Base Amount)
    line_items.append(JournalLineItem(
        account=invoice_data.get('coa_account', 'Sales Revenue'),
        description=f"Revenue from {invoice_data.get('invoice_number', '')}",
        debit=0.0,
        credit=invoice_data['base_amount']
    ))
    
    # Credit: Output GST
    if invoice_data['gst_amount'] > 0:
        line_items.append(JournalLineItem(
            account="Output GST",
            description=f"GST on {invoice_data.get('invoice_number', '')}",
            debit=0.0,
            credit=invoice_data['gst_amount']
        ))
    
    total_debit = sum([item.debit for item in line_items])
    total_credit = sum([item.credit for item in line_items])
    
    journal_entry = JournalEntryCreate(
        transaction_id=invoice_id,
        transaction_type="Invoice",
        entry_date=invoice_data.get('invoice_date') if isinstance(invoice_data.get('invoice_date'), datetime) else datetime.now(timezone.utc),
        description=f"Invoice {invoice_data.get('invoice_number', '')} raised",
        line_items=line_items,
        total_debit=total_debit,
        total_credit=total_credit
    )
    
    journal_dict = journal_entry.model_dump()
    journal_dict['id'] = str(uuid.uuid4())
    journal_dict['posted_by'] = user_id
    journal_dict['status'] = "Posted"
    journal_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    
    await db.journal_entries.insert_one(journal_dict)
    
    return journal_dict

# Helper function to auto-generate journal entry for bill
async def create_bill_journal_entry(bill_id: str, bill_data: dict, user_id: str):
    """Auto-generate journal entry when bill is approved"""
    
    # DR: Expense (from category COA)
    # DR: Input GST
    # CR: Accounts Payable
    
    line_items = []
    
    # Debit: Expense Account
    line_items.append(JournalLineItem(
        account=bill_data.get('coa_account', 'Expense'),
        description=f"Bill {bill_data.get('bill_number', '')} - {bill_data.get('vendor_name', '')}",
        debit=bill_data['base_amount'],
        credit=0.0
    ))
    
    # Debit: Input GST
    if bill_data['gst_amount'] > 0:
        line_items.append(JournalLineItem(
            account="Input GST",
            description=f"GST on {bill_data.get('bill_number', '')}",
            debit=bill_data['gst_amount'],
            credit=0.0
        ))
    
    # Credit: Accounts Payable (Total Amount)
    line_items.append(JournalLineItem(
        account="Accounts Payable",
        description=f"Bill {bill_data.get('bill_number', '')} - {bill_data.get('vendor_name', '')}",
        debit=0.0,
        credit=bill_data['total_amount']
    ))
    
    total_debit = sum([item.debit for item in line_items])
    total_credit = sum([item.credit for item in line_items])
    
    journal_entry = JournalEntryCreate(
        transaction_id=bill_id,
        transaction_type="Bill",
        entry_date=bill_data.get('bill_date') if isinstance(bill_data.get('bill_date'), datetime) else datetime.now(timezone.utc),
        description=f"Bill {bill_data.get('bill_number', '')} approved",
        line_items=line_items,
        total_debit=total_debit,
        total_credit=total_credit
    )
    
    journal_dict = journal_entry.model_dump()
    journal_dict['id'] = str(uuid.uuid4())
    journal_dict['posted_by'] = user_id
    journal_dict['status'] = "Posted"
    journal_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    
    await db.journal_entries.insert_one(journal_dict)
    
    return journal_dict

# Import Commerce routes
from commerce_routes import commerce_router
from lead_sop_complete import lead_router
from engagement_routes import engagement_router
from auth_routes import router as auth_router
from test_helpers import router as test_helpers_router
from chat_routes import router as chat_router
from user_management_routes import router as user_management_router
from webrtc_routes import router as webrtc_router
from manufacturing_routes import router as manufacturing_router
from manufacturing_routes_phase2 import router as manufacturing_phase2_router
from manufacturing_routes_phase3 import router as manufacturing_phase3_router
from finance_routes import router as finance_router
from workforce_routes import router as workforce_router
from operations_routes import router as operations_router
from ib_finance.router import router as ib_finance_router
from ib_workforce_routes import router as ib_workforce_router
from ib_capital_routes import router as ib_capital_router
from sla_monitoring_routes import router as sla_monitoring_router
from capital_routes import router as capital_router
from financial_reports_routes import router as financial_reports_router
from finance_events_routes import router as finance_events_router
from finance_export_routes import router as finance_export_router
from finance_advanced_routes import router as finance_advanced_router

# Import Enterprise routes
from enterprise_auth_routes import router as enterprise_auth_router
from super_admin_routes import router as super_admin_router
from org_admin_routes import router as org_admin_router
from parties_routes import router as parties_router
from razorpay_webhook_routes import router as razorpay_webhook_router

# Include the router in the main app
app.include_router(api_router)
app.include_router(auth_router, prefix="/api")
app.include_router(test_helpers_router, prefix="/api")
app.include_router(commerce_router, prefix="/api")
app.include_router(lead_router, prefix="/api")
app.include_router(engagement_router)
app.include_router(chat_router)
app.include_router(user_management_router)
app.include_router(webrtc_router)
app.include_router(manufacturing_router)
app.include_router(manufacturing_phase2_router)
app.include_router(manufacturing_phase3_router)
app.include_router(finance_router)
app.include_router(workforce_router)
app.include_router(operations_router)
app.include_router(ib_finance_router)
app.include_router(ib_workforce_router)
app.include_router(ib_capital_router)
app.include_router(sla_monitoring_router)
app.include_router(capital_router)
app.include_router(financial_reports_router)
app.include_router(finance_events_router)
app.include_router(finance_export_router)
app.include_router(finance_advanced_router)

# Include Enterprise routes
app.include_router(enterprise_auth_router, prefix="/api")
app.include_router(super_admin_router, prefix="/api")
app.include_router(org_admin_router, prefix="/api")
app.include_router(parties_router)
app.include_router(razorpay_webhook_router, prefix="/api")

# Import Commerce Modules routes (Catalog, Revenue, Procurement, Governance)
from commerce_modules_routes import router as commerce_modules_router
app.include_router(commerce_modules_router, prefix="/api")

# Import Super Admin Analytics routes
from super_admin_analytics_routes import router as super_admin_analytics_router
app.include_router(super_admin_analytics_router, prefix="/api")

# Import Intelligence routes
from intelligence_routes import router as intelligence_router
app.include_router(intelligence_router, prefix="/api")

# Import Workspace routes
from workspace_routes import router as workspace_router
app.include_router(workspace_router)

# Import Comprehensive Seed routes
from comprehensive_seed import router as seed_router
app.include_router(seed_router)

# Import IB Commerce Workflow routes (Revenue & Procurement 5-stage)
from workflow_routes import router as workflow_router
app.include_router(workflow_router, prefix="/api")

# Import Enhanced Parties Engine (Commercial Identity & Readiness)
# from parties_engine_routes import router as parties_engine_router
# app.include_router(parties_engine_router, prefix="/api")
from parties_engine_routes import router as parties_engine_router

# Existing (do not remove)
app.include_router(
    parties_engine_router,
    prefix="/api/commerce/parties-engine"
)

# ✅ ADD THIS ALIAS (VERY IMPORTANT)
app.include_router(
    parties_engine_router,
    prefix="/api/commerce/parties"
)



# Import Governance Engine (Policies, Limits, Authority, Risk, Audit)
from governance_engine_routes import router as governance_engine_router
app.include_router(governance_engine_router, prefix="/api")

# Admin routes
from admin_routes import router as admin_router
app.include_router(admin_router, prefix="/api")

# GST Reporting routes
from gst_reporting_routes import router as gst_reporting_router
app.include_router(gst_reporting_router)

# Global Search routes
from global_search_routes import router as global_search_router
app.include_router(global_search_router)

# Activity Feed routes
from activity_feed_routes import router as activity_feed_router
app.include_router(activity_feed_router)

# Dashboard Widgets routes
from dashboard_widgets_routes import router as dashboard_widgets_router
app.include_router(dashboard_widgets_router)

# Bulk Actions routes
from bulk_actions_routes import router as bulk_actions_router
app.include_router(bulk_actions_router)

# Document Management routes
from document_management_routes import router as document_management_router
app.include_router(document_management_router)

# Calendar Integration routes
from calendar_integration_routes import router as calendar_integration_router
app.include_router(calendar_integration_router)

# Audit Trail routes
from audit_trail_routes import router as audit_trail_router
app.include_router(audit_trail_router)

# Email Integration routes
from email_integration_routes import router as email_integration_router
app.include_router(email_integration_router)

# Reports Builder routes
from reports_builder_routes import router as reports_builder_router
app.include_router(reports_builder_router)

# P2 Features: ML Reconciliation, Cap Table Scenario, Email Campaigns, Workflow Builder
from ml_reconciliation_routes import router as ml_reconciliation_router
app.include_router(ml_reconciliation_router)

from cap_table_scenario_routes import router as cap_table_scenario_router
app.include_router(cap_table_scenario_router)

from email_campaigns_routes import router as email_campaigns_router
app.include_router(email_campaigns_router)

from workflow_builder_routes import router as workflow_builder_router
app.include_router(workflow_builder_router)


# Mount static files for uploads
uploads_dir = "/app/backend/uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def auto_seed_on_startup():
    """Auto-seed database if empty on startup"""
    try:
        logger.info("Checking if seed data is needed...")
        
        # Check if ₹100 Cr demo data exists (check leads as indicator)
        leads_count = await db.revenue_workflow_leads.count_documents({"org_id": "org_default_innovate"})
        if leads_count == 0:
            logger.info("Seeding ₹100 Cr Financial Year demo data...")
            from seed_100cr_startup import seed_100cr_data
            result = await seed_100cr_data(db)
            logger.info(f"₹100 Cr data seeded: {result}")
        else:
            logger.info(f"Revenue leads already have {leads_count} records, skipping ₹100 Cr seed")
        
        # Check IB Capital data
        capital_owners_count = await db.capital_owners.count_documents({})
        if capital_owners_count == 0:
            logger.info("Seeding IB Capital data...")
            from ib_capital_routes import seed_capital_data
            result = await seed_capital_data()
            logger.info(f"IB Capital seeded: {result.get('summary', {})}")
        else:
            logger.info(f"IB Capital already has {capital_owners_count} owners, skipping seed")
        
        # Check IB Finance data
        fin_accounts_count = await db.fin_accounts.count_documents({})
        if fin_accounts_count == 0:
            logger.info("Seeding IB Finance data...")
            from ib_finance.seed import seed_finance_data_internal
            result = await seed_finance_data_internal()
            logger.info(f"IB Finance seeded: {result}")
        else:
            logger.info(f"IB Finance already has {fin_accounts_count} accounts, skipping seed")
        
        # Check demo user exists
        demo_user = await db.users.find_one({"email": "demo@innovatebooks.com"})
        if not demo_user:
            logger.info("Creating demo user...")
            hashed_password = pwd_context.hash("Demo1234")
            demo_user_data = {
                "user_id": str(uuid.uuid4()),
                "email": "demo@innovatebooks.com",
                "password_hash": hashed_password,
                "first_name": "Demo",
                "last_name": "User",
                "role": "admin",
                "org_id": "org_default_innovate",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(demo_user_data)
            logger.info("Demo user created")
        else:
            logger.info("Demo user already exists")
            
        logger.info("Startup seed check complete")
    except Exception as e:
        logger.error(f"Auto-seed failed: {e}")
        # Don't fail startup if seed fails

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Public endpoint to check database status and trigger seed if needed
@app.get("/api/health/seed-status")
async def get_seed_status():
    """Check if database has seed data - no auth required"""
    try:
        capital_owners = await db.capital_owners.count_documents({})
        fin_accounts = await db.fin_accounts.count_documents({})
        esop_grants = await db.capital_esop_grants.count_documents({})
        users = await db.users.count_documents({})
        revenue_leads = await db.revenue_workflow_leads.count_documents({"org_id": "org_default_innovate"})
        invoices = await db.fin_invoices.count_documents({"org_id": "org_default_innovate"})
        customers = await db.parties_customers.count_documents({"org_id": "org_default_innovate"})
        
        has_data = capital_owners > 0 or fin_accounts > 0 or revenue_leads > 0
        
        return {
            "status": "ok",
            "has_seed_data": has_data,
            "counts": {
                "capital_owners": capital_owners,
                "fin_accounts": fin_accounts,
                "esop_grants": esop_grants,
                "users": users,
                "revenue_leads_100cr": revenue_leads,
                "invoices_100cr": invoices,
                "customers": customers
            },
            "message": "Data is ready" if has_data else "Database is empty - call POST /api/seed-all to seed"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/api/seed-all")
async def seed_all_data():
    """Seed all demo data - no auth required (for deployment convenience)"""
    try:
        results = {}
        
        # Seed demo user if needed
        demo_user = await db.users.find_one({"email": "demo@innovatebooks.com"})
        if not demo_user:
            hashed_password = pwd_context.hash("Demo1234")
            demo_user_data = {
                "user_id": str(uuid.uuid4()),
                "email": "demo@innovatebooks.com",
                "password_hash": hashed_password,
                "first_name": "Demo",
                "last_name": "User",
                "role": "admin",
                "org_id": "org_default_innovate",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(demo_user_data)
            results["demo_user"] = "created"
        else:
            results["demo_user"] = "already exists"
        
        # Seed ₹100 Cr Financial Year Data
        leads_count = await db.revenue_workflow_leads.count_documents({"org_id": "org_default_innovate"})
        if leads_count == 0:
            from seed_100cr_startup import seed_100cr_data
            seed_result = await seed_100cr_data(db)
            results["financial_year_100cr"] = seed_result
        else:
            results["financial_year_100cr"] = f"already has {leads_count} leads"
        
        # Seed IB Capital
        capital_count = await db.capital_owners.count_documents({})
        if capital_count == 0:
            from ib_capital_routes import seed_capital_data
            capital_result = await seed_capital_data()
            results["ib_capital"] = capital_result.get("summary", {})
        else:
            results["ib_capital"] = f"already has {capital_count} owners"
        
        # Seed IB Finance
        fin_count = await db.fin_accounts.count_documents({})
        if fin_count == 0:
            from ib_finance.seed import seed_finance_data_internal
            fin_result = await seed_finance_data_internal()
            results["ib_finance"] = fin_result
        else:
            results["ib_finance"] = f"already has {fin_count} accounts"
        
        return {
            "success": True,
            "message": "Seed completed",
            "results": results
        }
    except Exception as e:
        logger.error(f"Seed all failed: {e}")
        return {"success": False, "error": str(e)}







#Added for backup
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.abspath(
    os.path.join(BASE_DIR, "..", "frontend", "build")
)

if os.path.exists(FRONTEND_BUILD_DIR):

    # Serve assets (icons, images, js, etc.)
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_BUILD_DIR),
        name="frontend-assets",
    )

    # Serve main frontend page
    @app.get("/")
    async def serve_frontend():
        return FileResponse(
            os.path.join(FRONTEND_BUILD_DIR, "super-admin-test.html")
        )

    # Optional favicon handler (prevents console noise)
    @app.get("/favicon.ico")
    async def favicon():
        return FileResponse(
            os.path.join(FRONTEND_BUILD_DIR, "innovate-books-logo.png")
        )
